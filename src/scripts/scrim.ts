// Frosted-glass panels (hero card, now-strip, nav pill) use a background
// alpha driven by --scrim-alpha instead of a flat value, so they stay
// barely-there at night and only opaque enough to hold WCAG AA text
// contrast when the day sky is bright behind them. Listens to the public
// `sky-update` event dispatched by scripts/sky.ts — doesn't modify it.
const SCRIM_RGB: [number, number, number] = [21, 17, 13];
const TARGET_LUMINANCE = 0.045; // small margin under the 4.5:1 body-text threshold

function srgbToLinear(c: number) {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]) {
  const [rl, gl, bl] = [r, g, b].map(srgbToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function parseHex(hex: string): [number, number, number] {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// Smallest alpha (of the near-black scrim over this sky color) whose
// blended luminance still lands at or under the target.
function minAlphaFor(hex: string) {
  const sky = parseHex(hex);
  let lo = 0, hi = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    const blended = sky.map((c, j) => mid * SCRIM_RGB[j] + (1 - mid) * c) as [number, number, number];
    if (relativeLuminance(blended) <= TARGET_LUMINANCE) hi = mid;
    else lo = mid;
  }
  return hi;
}

function applyScrim(palette?: { top: string; mid: string; bottom: string; cloudHi: string }) {
  if (!palette) return;
  const needed = [palette.top, palette.mid, palette.bottom, palette.cloudHi].map(minAlphaFor);
  // Floor keeps a visible glass panel even when the night sky needs none of it.
  const alpha = Math.min(0.92, Math.max(0.18, Math.max(...needed) + 0.03));
  document.documentElement.style.setProperty('--scrim-alpha', alpha.toFixed(2));
}

export function initScrim() {
  window.addEventListener('sky-update', (e: any) => applyScrim(e.detail?.palette));
}
