import * as THREE from 'three';

function makePixelTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeat = 1,
  maxAniso = 1,
  isColor = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapLinearFilter;
  tex.anisotropy = maxAniso;
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface ProceduralTextures {
  groundColor: THREE.CanvasTexture;
  groundBump: THREE.CanvasTexture;
  stoneColor: THREE.CanvasTexture;
  barkColor: THREE.CanvasTexture;
  metalHazard: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAniso: number): ProceduralTextures {
  // Deterministic PRNG for crisp PS1 dithered textures
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // 1. Nocturnal clearing ground: mossy dark soil + subtle cobbled stone patches + PS1 dithering
  const groundColor = makePixelTexture(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#131a24';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          const r = rand();
          if (r < 0.22) {
            ctx.fillStyle = '#1b2633';
          } else if (r < 0.36) {
            ctx.fillStyle = '#17221d'; // dark moss
          } else if (r < 0.44) {
            ctx.fillStyle = '#0f141d';
          } else if (r < 0.48) {
            ctx.fillStyle = '#253140'; // worn pebble speck
          } else {
            continue;
          }
          ctx.fillRect(x, y, 2, 2);
        }
      }
    },
    30,
    maxAniso,
    true
  );

  const groundBump = makePixelTexture(
    64,
    (ctx, s) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          const v = Math.floor(95 + rand() * 75);
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    },
    30,
    maxAniso,
    false
  );

  // 2. Weathered ruins stone blocks
  const stoneColor = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = '#333b4a';
      ctx.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 2) {
        for (let x = 0; x < s; x += 2) {
          const v = rand();
          if (v < 0.25) ctx.fillStyle = '#262d3a';
          else if (v < 0.45) ctx.fillStyle = '#3f495c';
          else if (v < 0.52) ctx.fillStyle = '#24352d';
          else continue;
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.fillStyle = '#1b202b';
      ctx.fillRect(0, 15, s, 2);
      ctx.fillRect(15, 0, 2, 16);
      ctx.fillRect(7, 16, 2, 16);
    },
    2,
    maxAniso,
    true
  );

  // 3. Dark nocturnal bark
  const barkColor = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = '#241b17';
      ctx.fillRect(0, 0, s, s);
      for (let x = 0; x < s; x += 2) {
        ctx.fillStyle = rand() > 0.5 ? '#1b1411' : '#30241f';
        ctx.fillRect(x, 0, 2, s);
      }
      for (let i = 0; i < 24; i++) {
        ctx.fillStyle = '#120d0b';
        ctx.fillRect(Math.floor(rand() * s), Math.floor(rand() * s), 2, 4);
      }
    },
    2,
    maxAniso,
    true
  );

  // 4. Industrial robot hazard metal
  const metalHazard = makePixelTexture(
    32,
    (ctx, s) => {
      ctx.fillStyle = '#3b4252';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#eab308';
      for (let i = -s; i < s * 2; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 4, 0);
        ctx.lineTo(i - 12, s);
        ctx.lineTo(i - 16, s);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(0, 0, s, s - 6);
    },
    1,
    maxAniso,
    true
  );

  // 5. Radial soft contact shadow disc
  const contactShadow = makePixelTexture(
    64,
    (ctx, s) => {
      const grad = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.42)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s, s);
    },
    1,
    1,
    true
  );
  contactShadow.wrapS = THREE.ClampToEdgeWrapping;
  contactShadow.wrapT = THREE.ClampToEdgeWrapping;
  contactShadow.magFilter = THREE.LinearFilter;
  contactShadow.minFilter = THREE.LinearFilter;

  return {
    groundColor,
    groundBump,
    stoneColor,
    barkColor,
    metalHazard,
    contactShadow,
    dispose: () => {
      groundColor.dispose();
      groundBump.dispose();
      stoneColor.dispose();
      barkColor.dispose();
      metalHazard.dispose();
      contactShadow.dispose();
    },
  };
}
