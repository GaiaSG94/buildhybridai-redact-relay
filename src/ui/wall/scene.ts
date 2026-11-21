import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { kit } from './kit';
import { packRows, ROW_GAP, wallWords, type WallBlock } from './words';
import type { RedactionSpan } from '../../core/types';

export type WallView = 'held' | 'original';

const BLOCK_H = 1.02;
const BLOCK_D = 1.25;
const HELD_Z = -0.55;
const SIDE = new THREE.MeshStandardMaterial({ color: '#b4b5b4', roughness: 0.9 });

export interface WallScene {
  setTranscript: (text: string, animate?: boolean) => void;
  setRedaction: (text: string, spans: RedactionSpan[], onHeld?: (count: number) => void) => void;
  setView: (view: WallView) => void;
  dispose: () => void;
}

const easeOutBack = (t: number): number => {
  const c = 1.20158;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
const easeHold = (t: number): number => {
  const c = 0.22;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

const createRenderer = (canvas: HTMLCanvasElement, w: number, h: number): THREE.WebGLRenderer => {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, alpha: false });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.setSize(w, h, false);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.82;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  return r;
};

const createWorld = (scene: THREE.Scene, r: THREE.WebGLRenderer): void => {
  const fogC = new THREE.Color('#8f949c');
  scene.background = fogC;
  scene.fog = new THREE.FogExp2(fogC, 0.011);
  const pm = new THREE.PMREMGenerator(r);
  scene.environment = pm.fromScene(new RoomEnvironment(r), 0.04).texture;
  const key = new THREE.DirectionalLight('#eef3ff', 2.1);
  key.position.set(-18, 22, 14);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -20, right: 20, top: 16, bottom: -6, near: 1, far: 80 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 3;
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#c9d2e0', '#4a4d52', 0.55));
};

const createTerrain = (scene: THREE.Scene): void => {
  const tg = new THREE.PlaneGeometry(260, 260, 300, 300);
  tg.rotateX(-Math.PI / 2);
  const p = tg.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const d = Math.hypot(x, z);
    const hills = (kit.fbm(x * 0.03 + 40, z * 0.03 + 7, 5, 3) - 0.38) * 26 * Math.min(1, Math.max(0, (d - 15) / 45)) ** 1.5;
    const rock = (kit.fbm(x * 0.45, z * 0.45, 3, 9) - 0.5) * 0.35;
    p.setY(i, hills + rock - 0.02);
  }
  tg.computeVertexNormals();
  const rockTex = kit.canvasTex(512, 512, (g, w, h) => kit.noiseFill(g, w, h, [132, 135, 140], 34, 0.06, 4));
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
  rockTex.repeat.set(40, 40);
  const ground = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ color: '#9a9ea5', map: rockTex, roughness: 0.96, metalness: 0 }));
  ground.receiveShadow = true;
  scene.add(ground);
  const stoneG = new THREE.IcosahedronGeometry(1, 1);
  for (let k = 0; k < 90; k++) {
    const a = kit.hash(k, 1, 5) * Math.PI * 2;
    const d = 16 + kit.hash(k, 2, 5) * 50;
    const s = 0.15 + kit.hash(k, 3, 5) ** 3 * 1.6;
    const m = new THREE.Mesh(stoneG, new THREE.MeshStandardMaterial({ color: '#8e9298', roughness: 0.95, flatShading: true }));
    m.position.set(Math.cos(a) * d, s * 0.25, 1 + Math.sin(a) * d * 0.7);
    m.scale.set(s * (1 + kit.hash(k, 4, 5)), s * 0.6, s);
    m.rotation.set(k, k * 2, k * 3);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  }
};

const concreteMat = (word: string, bw: number): THREE.MeshStandardMaterial => {
  const px = 150;
  const cw = Math.round(bw * px);
  const ch = Math.round(BLOCK_H * px);
  const draw = (g: CanvasRenderingContext2D, w2: number, h2: number, bump: boolean): void => {
    if (bump) {
      g.fillStyle = '#fff';
      g.fillRect(0, 0, w2, h2);
    } else {
      kit.noiseFill(g, w2, h2, [190, 191, 190], 30, 0.05, word.length);
    }
    g.font = `600 ${Math.round(h2 * 0.46)}px 'Instrument Sans'`;
    g.textBaseline = 'middle';
    g.textAlign = 'center';
    g.fillStyle = bump ? '#000' : 'rgba(34,36,40,.86)';
    g.fillText(word, w2 / 2, h2 * 0.53);
  };
  return new THREE.MeshStandardMaterial({
    map: kit.canvasTex(cw, ch, (g, a, b) => draw(g, a, b, false)),
    bumpMap: kit.canvasTex(cw, ch, (g, a, b) => draw(g, a, b, true), false),
    bumpScale: 3,
    roughness: 0.88,
    color: '#ffffff',
  });
};

const heldFaceTex = (tag: string, bw: number): THREE.CanvasTexture =>
  kit.canvasTex(Math.round(bw * 150), 150, (g, w2, h2) => {
    g.fillStyle = '#2a0503';
    g.fillRect(0, 0, w2, h2);
    g.font = "500 44px 'IBM Plex Mono'";
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#ffb3a6';
    g.letterSpacing = '10px';
    g.fillText(tag, w2 / 2 + 5, h2 * 0.54);
  });

interface HeldExtras {
  sprite: THREE.Sprite;
  light: THREE.PointLight;
  face: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
}

const disposeMaterials = (mat: THREE.Material): void => {
  if (mat === SIDE) {
    return;
  }
  const any = mat as unknown as Record<string, unknown>;
  ['map', 'bumpMap', 'emissiveMap'].forEach((k) => {
    if (any[k]) {
      (any[k] as THREE.Texture).dispose();
    }
  });
  mat.dispose();
};

const disposeGroup = (group: THREE.Object3D): void => {
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    mats.forEach(disposeMaterials);
  });
};

const buildBlock = (block: WallBlock, held: boolean): { mesh: THREE.Mesh; extras: HeldExtras | null } => {
  const geo = new RoundedBoxGeometry(block.bw, BLOCK_H, BLOCK_D, 3, 0.05);
  if (block.tag && held) {
    const faceTex = heldFaceTex(block.tag.toUpperCase(), block.bw);
    const glass = new THREE.MeshPhysicalMaterial({ color: '#ff3b2a', emissive: '#ff2a12', emissiveIntensity: 0, emissiveMap: faceTex, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2, metalness: 0 });
    const face = new THREE.MeshPhysicalMaterial({ color: '#ff5a44', emissive: '#ff3a20', emissiveIntensity: 0, emissiveMap: faceTex, map: faceTex, roughness: 0.25, clearcoat: 1 });
    const mesh = new THREE.Mesh(geo, [glass, glass, glass, glass, face, glass]);
    const glow = kit.glowSprite('rgba(255,70,40,1)');
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ff4a30', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 }));
    sprite.scale.set(block.bw * 1.9, 2.6, 1);
    sprite.position.set(0, 0, 1.45);
    const light = new THREE.PointLight('#ff3a22', 0, 4.5, 1.6);
    light.position.set(0, 0, 1.05);
    mesh.add(sprite, light);
    return { mesh, extras: { sprite, light, face, glass } };
  }
  const face = concreteMat(block.t, block.bw);
  return { mesh: new THREE.Mesh(geo, [SIDE, SIDE, SIDE, SIDE, face, SIDE]), extras: null };
};

interface Anim {
  mesh: THREE.Mesh;
  fromY: number;
  toY: number;
  fromZ: number;
  toZ: number;
  start: number;
  dur: number;
  ease: (t: number) => number;
  extras: HeldExtras | null;
  litAt: number;
  onDone?: () => void;
  done: boolean;
}

export const createWallScene = async (canvas: HTMLCanvasElement): Promise<WallScene> => {
  await Promise.all(["600 64px 'Instrument Sans'", "500 40px 'IBM Plex Mono'"].map((f) => document.fonts.load(f)));
  const W = 1440;
  const H = 900;
  const r = createRenderer(canvas, W, H);
  const scene = new THREE.Scene();
  createWorld(scene, r);
  createTerrain(scene);
  const cam = new THREE.PerspectiveCamera(27, W / H, 0.1, 400);
  cam.position.set(-5, 6.5, 43);
  cam.lookAt(3.6, 3.2, 0);
  const wall = new THREE.Group();
  wall.rotation.y = 0.22;
  scene.add(wall);
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(21 + 2, 0.6, BLOCK_D + 2.2),
    new THREE.MeshStandardMaterial({ color: '#8f9399', roughness: 0.95 }),
  );
  plinth.position.set(0, -0.25, -0.2);
  plinth.rotation.y = 0.22;
  plinth.receiveShadow = plinth.castShadow = true;
  scene.add(plinth);

  let anims: Anim[] = [];
  const rebuild = (text: string, spans: RedactionSpan[], held: boolean, opts: { drop?: boolean; onHeld?: (c: number) => void } = {}): void => {
    anims = [];
    disposeGroup(wall);
    wall.clear();
    const rows = packRows(wallWords(text, spans), held);
    const total = rows.length;
    const now = performance.now();
    let blockIdx = 0;
    let heldIdx = 0;
    rows.forEach((rw, ri) => {
      const rowW = rw.reduce((s, b) => s + b.bw + ROW_GAP, -ROW_GAP);
      let x = -rowW / 2 + (ri % 2 ? 0.45 : 0);
      const y = (total - 1 - ri) * (BLOCK_H + ROW_GAP) + BLOCK_H / 2;
      rw.forEach((b) => {
        const { mesh, extras } = buildBlock(b, held);
        const jitter = (kit.hash(ri, Math.round(x * 10), 3) - 0.5) * 0.05;
        const restZ = jitter + (extras ? HELD_Z : 0);
        mesh.position.set(x + b.bw / 2, y, restZ);
        mesh.castShadow = mesh.receiveShadow = true;
        wall.add(mesh);
        if (opts.drop) {
          mesh.position.y = y + 0.6;
          anims.push({ mesh, fromY: y + 0.6, toY: y, fromZ: restZ, toZ: restZ, start: now + blockIdx * 40, dur: 420, ease: easeOutBack, extras: null, litAt: 0, done: false });
        }
        if (extras) {
          const start = now + heldIdx * 40;
          heldIdx += 1;
          mesh.position.z = jitter;
          anims.push({ mesh, fromY: y, toY: y, fromZ: jitter, toZ: restZ, start, dur: 380, ease: easeHold, extras, litAt: start + 380, done: false, onDone: () => opts.onHeld?.(heldIdx) });
        }
        blockIdx += 1;
        x += b.bw + ROW_GAP;
      });
    });
  };

  let captureFrames = new URLSearchParams(window.location.search).has('capture') ? 60 : -1;
  const tick = (t: number): void => {
    anims = anims.filter((a) => {
      if (a.done) {
        return false;
      }
      if (t < a.start) {
        return true;
      }
      const k = Math.min(1, (t - a.start) / a.dur);
      const e = a.ease(k);
      a.mesh.position.y = a.fromY + (a.toY - a.fromY) * e;
      a.mesh.position.z = a.fromZ + (a.toZ - a.fromZ) * e;
      if (a.extras) {
        if (t >= a.litAt) {
          const l = Math.min(1, (t - a.litAt) / 240);
          a.extras.glass.emissiveIntensity = 0.9 * l;
          a.extras.face.emissiveIntensity = 1.25 * l;
          (a.extras.sprite.material as THREE.SpriteMaterial).opacity = 0.8 * l;
          a.extras.light.intensity = 2.4 * l;
          if (l >= 1) {
            a.done = true;
            a.onDone?.();
            return false;
          }
        }
        return true;
      }
      if (k >= 1) {
        a.mesh.position.y = a.toY;
        a.done = true;
        return false;
      }
      return true;
    });
    r.render(scene, cam);
    if (captureFrames >= 0) {
      captureFrames -= 1;
      if (captureFrames === 0) {
        return;
      }
    }
    if (anims.length === 0 && (window as unknown as { wallIdleStop?: boolean }).wallIdleStop) {
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  let lastText = '';
  let lastSpans: RedactionSpan[] = [];
  return {
    setTranscript: (text, animate = false) => {
      lastText = text;
      lastSpans = [];
      rebuild(text, [], false, { drop: animate });
    },
    setRedaction: (text, spans, onHeld) => {
      lastText = text;
      lastSpans = spans;
      rebuild(text, spans, true, { onHeld });
    },
    setView: (v) => {
      const held = v === 'held' && lastSpans.length > 0;
      rebuild(lastText, lastSpans, held, {});
    },
    dispose: () => {
      disposeGroup(wall);
      r.dispose();
    },
  };
};
