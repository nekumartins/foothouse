// Flips `data-ink` on <html> to match the live sky's brightness: dark sky
// keeps paper-on-dark glass, bright sky flips to dark-ink-on-light glass, so
// no surface ever has to go opaque to hold contrast. Listens to the public
// `sky-update` event dispatched by scripts/sky.ts — doesn't modify it. The
// luminance helpers mirror scrim.ts, which this script replaces.
const FLIP_UP = 0.45;
const FLIP_DOWN = 0.35;
const FIRST_THRESHOLD = 0.40;

type SkyPalette = { top: string; mid: string; bottom: string; cloudHi: string };

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

function maxLuminance(palette: SkyPalette) {
  return Math.max(
    ...[palette.top, palette.mid, palette.bottom, palette.cloudHi].map((hex) =>
      relativeLuminance(parseHex(hex))
    )
  );
}

let mode: 'dark' | 'light' | null = null;

function applyInk(palette?: SkyPalette) {
  if (!palette) return;
  const L = maxLuminance(palette);
  if (mode === null) {
    mode = L >= FIRST_THRESHOLD ? 'light' : 'dark';
  } else if (mode === 'dark' && L > FLIP_UP) {
    mode = 'light';
  } else if (mode === 'light' && L < FLIP_DOWN) {
    mode = 'dark';
  }
  document.documentElement.dataset.ink = mode;
}

export function initSurface() {
  // The receded sky filter (BaseLayout.astro) dims the rendered pixels only —
  // it never touches the raw palette this reads from the event, so a receded
  // page would otherwise flip to light ink over a visually dark sky. Interior
  // pages stay pinned to the SSR default (data-ink="dark") instead.
  if (document.body.dataset.skyMode === 'receded') return;
  window.addEventListener('sky-update', (e: any) => applyInk(e.detail?.palette));
}
