interface SkyPalette {
  top: string;
  mid: string;
  bottom: string;
  cloudHi: string;
  cloudLo: string;
}

const SKY_STATES: Record<string, SkyPalette> = {
  night: { top: '#0B0D1A', mid: '#141833', bottom: '#1A1530', cloudHi: '#3A4066', cloudLo: '#232849' },
  dawn: { top: '#202B4E', mid: '#5E3349', bottom: '#A56A44', cloudHi: '#E8B78C', cloudLo: '#7A5A6E' },
  day: { top: '#234571', mid: '#365F8C', bottom: '#5184B0', cloudHi: '#FFFFFF', cloudLo: '#A8C4DC' },
  golden: { top: '#33254A', mid: '#8A5326', bottom: '#BC7C39', cloudHi: '#F5C98A', cloudLo: '#9A6A52' },
  dusk: { top: '#1F1838', mid: '#4A2A60', bottom: '#9A4A6A', cloudHi: '#B48AA6', cloudLo: '#4E3A66' },
};

type SkyState = keyof typeof SKY_STATES;

function getStateForHour(hour: number): SkyState {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'golden';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night';
}

export function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const v = parseInt(hex.slice(1), 16);
    return [(v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + blue).toString(16).slice(1)}`;
}

function getBlendedPalette(fractionalHour: number): SkyPalette {
  const transitions: Array<{ start: number; end: number; from: SkyState; to: SkyState }> = [
    { start: 5, end: 7, from: 'night', to: 'dawn' },
    { start: 7, end: 8, from: 'dawn', to: 'day' },
    { start: 16, end: 17, from: 'day', to: 'golden' },
    { start: 17, end: 19, from: 'golden', to: 'dusk' },
    { start: 19, end: 21, from: 'dusk', to: 'night' },
  ];

  for (const tr of transitions) {
    if (fractionalHour >= tr.start && fractionalHour < tr.end) {
      const t = (fractionalHour - tr.start) / (tr.end - tr.start);
      const from = SKY_STATES[tr.from];
      const to = SKY_STATES[tr.to];
      return {
        top: lerpColor(from.top, to.top, t),
        mid: lerpColor(from.mid, to.mid, t),
        bottom: lerpColor(from.bottom, to.bottom, t),
        cloudHi: lerpColor(from.cloudHi, to.cloudHi, t),
        cloudLo: lerpColor(from.cloudLo, to.cloudLo, t),
      };
    }
  }

  return SKY_STATES[getStateForHour(fractionalHour)];
}

function applySky(palette: SkyPalette) {
  const root = document.documentElement;
  root.style.setProperty('--sky-top', palette.top);
  root.style.setProperty('--sky-mid', palette.mid);
  root.style.setProperty('--sky-bottom', palette.bottom);
  root.style.setProperty('--cloud-hi', palette.cloudHi);
  root.style.setProperty('--cloud-lo', palette.cloudLo);
}

function getStarfieldOpacity(hour: number): number {
  if (hour >= 21 || hour < 5) return 1;
  if (hour >= 19) return (hour - 19) / 2;
  if (hour >= 5 && hour < 7) return 1 - (hour - 5) / 2;
  return 0;
}

// Sun/moon arc. The sun is up from RISE→SET, arcing east(left)→west(right) and
// rising to its peak at solar noon; the moon mirrors it across the night.
const SUN_RISE = 5.5;
const SUN_SET = 18.75;

interface Celestial {
  x: number; // % across
  y: number; // % from top (lower number = higher in sky)
  sun: number; // opacity
  moon: number; // opacity
}

export function getCelestial(fractionalHour: number): Celestial {
  // Wide, shallow dome (vertical swing kept small — `top` is a % of the tall
  // viewport, so a little goes a long way on a portrait phone).
  const dome = (p: number) => 56 - 30 * Math.sin(p * Math.PI); // 56% horizon → 26% peak
  // Brightness fades toward the horizons so each set/rise dissolves gently.
  const fade = (p: number) => Math.max(0, Math.min(1, Math.sin(p * Math.PI) * 1.6));

  if (fractionalHour >= SUN_RISE && fractionalHour <= SUN_SET) {
    // Day: sun sweeps left → right.
    const p = (fractionalHour - SUN_RISE) / (SUN_SET - SUN_RISE);
    return { x: 8 + p * 84, y: dome(p), sun: fade(p) * 0.8, moon: 0 };
  }

  // Night: moon sweeps RIGHT → LEFT, back the way the sun came. This keeps the
  // path continuous — at sunset the sun sets on the right and the moon rises
  // from that same right edge; at sunrise both meet on the left. The disc never
  // teleports across the screen; it just crossfades sun↔moon in place.
  const fh = fractionalHour < SUN_RISE ? fractionalHour + 24 : fractionalHour;
  const p = (fh - SUN_SET) / (SUN_RISE + 24 - SUN_SET);
  return { x: 92 - p * 84, y: dome(p), sun: 0, moon: fade(p) * 0.7 };
}

let overrideHour: number | null = null;

export function setOverrideHour(hour: number | null) {
  overrideHour = hour;
  if (hour !== null) {
    sessionStorage.setItem('foothouse-sky-override', String(hour));
  } else {
    sessionStorage.removeItem('foothouse-sky-override');
  }
  update();
}

export function getOverrideHour(): number | null {
  return overrideHour;
}

let reducedMotion = false;
let snapNext = false; // one instant (no-transition) update, e.g. after a hidden tab returns

function update() {
  const now = new Date();
  const hour =
    overrideHour ?? now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const palette = getBlendedPalette(hour);
  applySky(palette);

  const state = getStateForHour(hour);
  document.body.setAttribute('data-sky-state', state);

  const starfield = document.getElementById('starfield-canvas') as HTMLCanvasElement | null;
  if (starfield) {
    const opacity = getStarfieldOpacity(hour);
    starfield.style.opacity = String(opacity);
  }

  // Sun/moon arc position + fade. While the user is scrubbing the slider
  // (override active), track it crisply; when live, each 5s tick starts a
  // slightly longer linear transition, so consecutive ticks chain into one
  // continuous drift.
  const celestial = getCelestial(hour);
  const root = document.documentElement;
  const instant = snapNext || reducedMotion;
  snapNext = false;
  root.style.setProperty('--sky-ease', overrideHour !== null ? '0.12s' : instant ? '0s' : '6s');
  root.style.setProperty('--sky-ease-fn', overrideHour !== null ? 'ease' : 'linear');
  root.style.setProperty('--celestial-x', `${celestial.x}%`);
  root.style.setProperty('--celestial-y', `${celestial.y}%`);
  root.style.setProperty('--sun-opacity', String(celestial.sun));
  root.style.setProperty('--moon-opacity', String(celestial.moon));

  window.dispatchEvent(new CustomEvent('sky-update', { detail: { hour, state, palette } }));
}

// Sun/moon arc. The sun is up from RISE→SET, arcing east(left)→west(right) and
// rising to its peak at solar noon; the moon mirrors it across the night.
export function hourFromX(xPercent: number, isNight: boolean): number {
  const p = Math.max(0, Math.min(1, isNight ? (92 - xPercent) / 84 : (xPercent - 8) / 84));
  if (!isNight) return SUN_RISE + p * (SUN_SET - SUN_RISE);
  return (SUN_SET + p * (SUN_RISE + 24 - SUN_SET)) % 24;
}

export function initSky() {
  const saved = sessionStorage.getItem('foothouse-sky-override');
  if (saved !== null) {
    overrideHour = parseFloat(saved);
  }

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The very first paint of a page is the static HTML's hardcoded night
  // default (see global.css); every navigation is a full page load, so
  // without this the 6s live-drift transition would visibly crossfade
  // from that default up to the real sky state on every single page.
  snapNext = true;
  update();
  // The sky really moves: a short tick keeps sun, moon and colors drifting.
  // Under reduced motion the sky steps quietly once a minute instead.
  setInterval(() => {
    if (document.hidden) return;
    update();
  }, reducedMotion ? 60_000 : 5_000);

  // A tab that comes back after a while snaps to the current sky instead of
  // sliding across hours of arc.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      snapNext = true;
      update();
    }
  });
}
