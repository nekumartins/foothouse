let filterCounter = 0;

function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function generateDisplacementMap(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const N = 4;
  const IOR = 1.5;
  const DOME_HEIGHT = 0.12;
  const EDGE = 0.92;

  function domeH(nx: number, ny: number): number {
    const d = Math.pow(
      Math.pow(Math.abs(nx), N) + Math.pow(Math.abs(ny), N),
      1 / N
    );
    if (d >= EDGE) return 0;
    const t = 1 - d / EDGE;
    return DOME_HEIGHT * t * t * (3 - 2 * t);
  }

  const eps = 2 / Math.max(width, height);

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      const nx = (px / (width - 1)) * 2 - 1;
      const ny = (py / (height - 1)) * 2 - 1;

      const h = domeH(nx, ny);

      if (h <= 0) {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 128;
        data[idx + 3] = 255;
        continue;
      }

      const dhdx = (domeH(nx + eps, ny) - domeH(nx - eps, ny)) / (2 * eps);
      const dhdy = (domeH(nx, ny + eps) - domeH(nx, ny - eps)) / (2 * eps);

      const nLen = Math.sqrt(dhdx * dhdx + dhdy * dhdy + 1);
      const normalX = -dhdx / nLen;
      const normalY = -dhdy / nLen;
      const normalZ = 1 / nLen;

      const cosI = normalZ;
      const eta = 1 / IOR;
      const sinT2 = eta * eta * (1 - cosI * cosI);

      let dx = 0;
      let dy = 0;

      if (sinT2 <= 1) {
        const cosT = Math.sqrt(1 - sinT2);
        const factor = eta * cosI - cosT;
        const rx = factor * normalX;
        const ry = factor * normalY;
        const strength = h * 5;
        dx = rx * strength;
        dy = ry * strength;
      }

      data[idx] = Math.max(0, Math.min(255, Math.round(128 + dx * 128)));
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + dy * 128)));
      data[idx + 2] = 128;
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

async function createFilter(scale: number): Promise<string> {
  const canvas = generateDisplacementMap(128, 128);
  const blobUrl = await canvasToBlob(canvas);

  const id = `glass-${++filterCounter}-${Date.now()}`;
  const svgNS = 'http://www.w3.org/2000/svg';

  let svg = document.getElementById('glass-svg') as SVGSVGElement | null;
  if (!svg) {
    svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'glass-svg';
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';
    document.body.appendChild(svg);
  }

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
    const feBlend = document.createElementNS(svgNS, 'feGaussianBlur');
    feBlend.setAttribute('in', 'refracted');
    feBlend.setAttribute('stdDeviation', '0.4');
    filter.appendChild(feBlend);
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

export async function initGlass() {
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) {
    return;
  }

  const cards = document.querySelectorAll<HTMLElement>('[data-glass]');
  if (cards.length === 0) return;

  const scale = 35;
  const filterId = await createFilter(scale);

  const pairs: Array<{ card: HTMLElement; skyCopy: HTMLElement }> = [];

  cards.forEach((card) => {
    const refraction = card.querySelector<HTMLElement>('.glass-refraction');
    const skyCopy = card.querySelector<HTMLElement>('.glass-sky-copy');
    if (!refraction || !skyCopy) return;

    refraction.style.filter = `url(#${filterId})`;
    card.classList.add('glass-active');
    pairs.push({ card, skyCopy });
  });

  function updateAll() {
    for (const { card, skyCopy } of pairs) {
      positionSkyCopy(card, skyCopy);
    }
  }

  updateAll();
  window.addEventListener('scroll', updateAll, { passive: true });
  window.addEventListener('resize', updateAll, { passive: true });

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
