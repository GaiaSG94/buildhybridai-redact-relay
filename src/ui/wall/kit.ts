import * as THREE from 'three';

type Draw = (g: CanvasRenderingContext2D, w: number, h: number) => void;

/** Deterministic value noise (same constants as the boards). */
export const hash = (x: number, y: number, s: number): number => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

const vn = (x: number, y: number, s: number): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const fbm = (x: number, y: number, o = 5, s = 1): number => {
  let f = 0;
  let a = 0.5;
  let fr = 1;
  let n = 0;
  for (let i = 0; i < o; i++) {
    f += a * vn(x * fr, y * fr, s + i * 13);
    n += a;
    fr *= 2.03;
    a *= 0.5;
  }
  return f / n;
};

const canvasTex = (w: number, h: number, draw: Draw, srgb = true): THREE.CanvasTexture => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d') as CanvasRenderingContext2D, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) {
    t.colorSpace = THREE.SRGBColorSpace;
  }
  t.anisotropy = 8;
  return t;
};

const noiseFill = (g: CanvasRenderingContext2D, w: number, h: number, base: number[], amp: number, scale = 0.05, seed = 1): void => {
  const img = g.getImageData(0, 0, w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = (fbm(x * scale, y * scale, 4, seed) - 0.5) * amp + (hash(x, y, seed) - 0.5) * amp * 0.35;
      const i = (y * w + x) * 4;
      d[i] = base[0] + n;
      d[i + 1] = base[1] + n;
      d[i + 2] = base[2] + n;
      d[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
};

const glowSprite = (color: string, size = 256): THREE.CanvasTexture =>
  canvasTex(size, size, (g, w) => {
    const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, color);
    gr.addColorStop(0.25, color.replace(/[\d.]+\)$/, '.35)'));
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, w);
  });

export const kit = { hash, fbm, canvasTex, noiseFill, glowSprite };
export type { Draw };
