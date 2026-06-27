interface SkyPalette {
  top: string;
  mid: string;
  bottom: string;
}

const SKY_STATES: Record<string, SkyPalette> = {
  night: { top: '#0B0D1A', mid: '#141833', bottom: '#1A1530' },
  dawn: { top: '#1A1530', mid: '#4A2040', bottom: '#D4845A' },
  day: { top: '#2E5090', mid: '#5A8AC0', bottom: '#8CB4D8' },
  golden: { top: '#3A2A50', mid: '#C07830', bottom: '#E8A84A' },
  dusk: { top: '#1A1530', mid: '#3A2050', bottom: '#8A4060' },
};

type SkyState = keyof typeof SKY_STATES;

function getStateForHour(hour: number): SkyState {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'golden';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night';
}

function lerpColor(a: string, b: string, t: number): string {
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

function getBlendedPalette(hour: number, minute: number): SkyPalette {
  const transitions: Array<{ start: number; end: number; from: SkyState; to: SkyState }> = [
    { start: 5, end: 7, from: 'night', to: 'dawn' },
    { start: 7, end: 8, from: 'dawn', to: 'day' },
    { start: 16, end: 17, from: 'day', to: 'golden' },
    { start: 17, end: 19, from: 'golden', to: 'dusk' },
    { start: 19, end: 21, from: 'dusk', to: 'night' },
  ];

  const fractionalHour = hour + minute / 60;

  for (const tr of transitions) {
    if (fractionalHour >= tr.start && fractionalHour < tr.end) {
      const t = (fractionalHour - tr.start) / (tr.end - tr.start);
      const from = SKY_STATES[tr.from];
      const to = SKY_STATES[tr.to];
      return {
        top: lerpColor(from.top, to.top, t),
        mid: lerpColor(from.mid, to.mid, t),
        bottom: lerpColor(from.bottom, to.bottom, t),
      };
    }
  }

  return SKY_STATES[getStateForHour(hour)];
}

function applySky(palette: SkyPalette) {
  const root = document.documentElement;
  root.style.setProperty('--sky-top', palette.top);
  root.style.setProperty('--sky-mid', palette.mid);
  root.style.setProperty('--sky-bottom', palette.bottom);
}

function getStarfieldOpacity(hour: number): number {
  if (hour >= 21 || hour < 5) return 1;
  if (hour >= 19) return (hour - 19) / 2;
  if (hour >= 5 && hour < 7) return 1 - (hour - 5) / 2;
  return 0;
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

function update() {
  const now = new Date();
  const hour = overrideHour ?? now.getHours();
  const minute = overrideHour !== null ? 0 : now.getMinutes();

  const palette = getBlendedPalette(hour, minute);
  applySky(palette);

  const state = getStateForHour(hour);
  document.body.setAttribute('data-sky-state', state);

  const starfield = document.getElementById('starfield-canvas') as HTMLCanvasElement | null;
  if (starfield) {
    const opacity = getStarfieldOpacity(hour);
    starfield.style.opacity = String(opacity);
  }

  window.dispatchEvent(new CustomEvent('sky-update', { detail: { hour, state, palette } }));
}

export function initSky() {
  const saved = sessionStorage.getItem('foothouse-sky-override');
  if (saved !== null) {
    overrideHour = parseInt(saved, 10);
  }

  update();
  setInterval(update, 60_000);
}
