// Computed-refraction "liquid glass". The displacement is built from the
// rounded-rectangle SDF of each card (not a stretched square), so the centre
// stays perfectly flat and the bend concentrates in a uniform rim band —
// the same method described in "Liquid glass for the web".

let filterCounter = 0;

function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Signed distance to a rounded rectangle centred at the origin.
// Negative inside. b = half-size, r = corner radius.
function roundedRectSDF(px: number, py: number, bx: number, by: number, r: number): number {
  const qx = Math.abs(px) - bx + r;
  const qy = Math.abs(py) - by + r;
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.sqrt(ax * ax + ay * ay);
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

function generateDisplacementMap(
  width: number,
  height: number,
  radius: number,
  gain: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const bx = width / 2;
  const by = height / 2;
  const inradius = Math.min(bx, by); // depth from edge to centre
  const eps = 1;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const x = px + 0.5 - bx;
      const y = py + 0.5 - by;

      const sdf = roundedRectSDF(x, y, bx, by, radius);
      const depth = -sdf; // positive inside

      // Outside the shape, or essentially at the flat centre: leave it put.
      if (depth <= 0) {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
        continue;
      }

      // d: 0 at the rim, 1 at the flat centre.
      const d = Math.min(depth / inradius, 1);

      // Guide's dome slope: steep at the rim, zero at the centre.
      const oneMinus = 1 - d;
      const slope = oneMinus ** 3 / (1 - oneMinus ** 4) ** 0.75;

      if (!isFinite(slope) || slope < 1e-4) {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
        continue;
      }

      // Snell refraction through the dome at IOR 1.5.
      const thetaI = Math.atan(slope);
      const thetaT = Math.asin(Math.sin(thetaI) / 1.5);
      const bend = Math.sin(thetaI - thetaT); // 0 centre → max rim

      // Aim the bend along the SDF normal (gradient points outward).
      const gx =
        roundedRectSDF(x + eps, y, bx, by, radius) -
        roundedRectSDF(x - eps, y, bx, by, radius);
      const gy =
        roundedRectSDF(x, y + eps, bx, by, radius) -
        roundedRectSDF(x, y - eps, bx, by, radius);
      const glen = Math.sqrt(gx * gx + gy * gy) || 1;
      const nx = gx / glen;
      const ny = gy / glen;

      const r = 128 + nx * bend * gain;
      const g = 128 + ny * bend * gain;

      // Specular rim light: brightest where the dome is steepest.
      const specular = Math.min(1, slope * 1.2);

      data[idx] = Math.max(0, Math.min(255, Math.round(r)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[idx + 2] = Math.round(specular * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob!));
    }, 'image/png');
  });
}

function getGlassSvg(): SVGSVGElement {
  let svg = document.getElementById('glass-svg') as SVGSVGElement | null;
  if (!svg) {
    const svgNS = 'http://www.w3.org/2000/svg';
    svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'glass-svg';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';
    document.body.appendChild(svg);
  }
  return svg;
}

async function createFilter(canvas: HTMLCanvasElement, scale: number): Promise<string> {
  const blobUrl = await canvasToBlob(canvas);
  const id = `glass-${++filterCounter}-${Date.now()}`;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = getGlassSvg();

  const defs = document.createElementNS(svgNS, 'defs');

  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = id;
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  filter.setAttribute('x', '0%');
  filter.setAttribute('y', '0%');
  filter.setAttribute('width', '100%');
  filter.setAttribute('height', '100%');

  const feImage = document.createElementNS(svgNS, 'feImage');
  feImage.setAttribute('href', blobUrl);
  feImage.setAttribute('result', 'dispMap');
  feImage.setAttribute('preserveAspectRatio', 'none');
  filter.appendChild(feImage);

  const feDisp = document.createElementNS(svgNS, 'feDisplacementMap');
  feDisp.setAttribute('in', 'SourceGraphic');
  feDisp.setAttribute('in2', 'dispMap');
  feDisp.setAttribute('scale', String(scale));
  feDisp.setAttribute('xChannelSelector', 'R');
  feDisp.setAttribute('yChannelSelector', 'G');
  feDisp.setAttribute('result', 'refracted');
  filter.appendChild(feDisp);

  if (!isSafari()) {
    const feBlur = document.createElementNS(svgNS, 'feGaussianBlur');
    feBlur.setAttribute('in', 'refracted');
    feBlur.setAttribute('stdDeviation', '0.25');
    filter.appendChild(feBlur);
  }

  defs.appendChild(filter);
  svg.appendChild(defs);

  return id;
}

function positionSkyCopy(card: Element, skyCopy: HTMLElement) {
  const rect = card.getBoundingClientRect();
  skyCopy.style.width = window.innerWidth + 'px';
  skyCopy.style.height = window.innerHeight + 'px';
  skyCopy.style.left = -rect.left + 'px';
  skyCopy.style.top = -rect.top + 'px';
}

function applySpecularHighlight(card: HTMLElement, canvas: HTMLCanvasElement) {
  const highlight = card.querySelector<HTMLElement>('.glass-highlight');
  if (!highlight) return;

  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const w = canvas.width;
  const h = canvas.height;
  const rimCanvas = document.createElement('canvas');
  rimCanvas.width = w;
  rimCanvas.height = h;
  const rimCtx = rimCanvas.getContext('2d')!;
  const rimData = rimCtx.createImageData(w, h);

  for (let i = 0; i < data.length; i += 4) {
    const specular = data[i + 2] / 255;
    rimData.data[i] = 255;
    rimData.data[i + 1] = 255;
    rimData.data[i + 2] = 255;
    rimData.data[i + 3] = Math.round(specular * specular * 22);
  }

  rimCtx.putImageData(rimData, 0, 0);
  highlight.style.background = `url(${rimCanvas.toDataURL()})`;
  highlight.style.backgroundSize = '100% 100%';
}

const GAIN = 82;
const SCALE = 22;
const RADIUS = 14; // matches CSS border-radius
const MAX_MAP_DIM = 320;

async function buildCard(card: HTMLElement) {
  const refraction = card.querySelector<HTMLElement>('.glass-refraction');
  const skyCopy = card.querySelector<HTMLElement>('.glass-sky-copy');
  if (!refraction || !skyCopy) return null;

  const rect = card.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return null;

  const f = Math.min(1, MAX_MAP_DIM / Math.max(rect.width, rect.height));
  const mw = Math.max(2, Math.round(rect.width * f));
  const mh = Math.max(2, Math.round(rect.height * f));

  const canvas = generateDisplacementMap(mw, mh, RADIUS * f, GAIN);
  const filterId = await createFilter(canvas, SCALE);

  refraction.style.filter = `url(#${filterId})`;
  card.classList.add('glass-active');
  positionSkyCopy(card, skyCopy);
  applySpecularHighlight(card, canvas);

  return { card, skyCopy };
}

export async function initGlass() {
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    return;
  }

  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-glass]'));
  if (cards.length === 0) return;

  let pairs = (await Promise.all(cards.map(buildCard))).filter(
    (p): p is { card: HTMLElement; skyCopy: HTMLElement } => p !== null
  );

  function updatePositions() {
    for (const { card, skyCopy } of pairs) positionSkyCopy(card, skyCopy);
  }

  updatePositions();
  window.addEventListener('scroll', updatePositions, { passive: true });

  // Rebuild maps on resize (aspect ratio changes), debounced.
  let resizeTimer: number | undefined;
  window.addEventListener(
    'resize',
    () => {
      updatePositions();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(async () => {
        const svg = document.getElementById('glass-svg');
        if (svg) svg.innerHTML = '';
        pairs = (await Promise.all(cards.map(buildCard))).filter(
          (p): p is { card: HTMLElement; skyCopy: HTMLElement } => p !== null
        );
        updatePositions();
      }, 200);
    },
    { passive: true }
  );

  // Drop the effect if it ever tanks the frame rate.
  let frameCount = 0;
  let lastCheck = performance.now();
  let monitoring = true;

  function checkPerformance() {
    if (!monitoring) return;
    frameCount++;
    const now = performance.now();
    if (now - lastCheck >= 3000) {
      const fps = (frameCount * 1000) / (now - lastCheck);
      if (fps < 18) {
        cards.forEach((card) => {
          const refraction = card.querySelector<HTMLElement>('.glass-refraction');
          if (refraction) refraction.style.display = 'none';
          card.classList.remove('glass-active');
          card.classList.add('glass-fallback');
        });
        monitoring = false;
        return;
      }
      frameCount = 0;
      lastCheck = now;
    }
    requestAnimationFrame(checkPerformance);
  }

  requestAnimationFrame(checkPerformance);
}
