import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CURSOR_IDLE_DELAY = 2.0;

const PLUSH = {
  grid: 36,
  wobble: 2.3,
  reach: 0.19,
  damping: 0.15,
  flesh: 0.35,
  grabRadius: 0.18,
  maxPull: 0.62,
  rub: 480,
  rubRadius: 0.12,
  rubSlip: 0.11,
  sway: 1.15,
  maxSteps: 36,
  hardest: 8,
  grip: 2500,
};

function drawStarPath(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
}

function createExpressionSheet() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let lastKey = '';

  function renderSheet({ annoyed, dizzy, poke, time }) {
    const qAnnoyed = Math.round(annoyed * 20) / 20;
    const qDizzy = Math.round(dizzy * 20) / 20;
    const qPoke = Math.round(poke * 20) / 20;
    const qPhase = qDizzy > 0.05 ? Math.floor(time * 8) : 0;
    const key = `${qAnnoyed}|${qDizzy}|${qPoke}|${qPhase}`;
    if (key === lastKey) return;
    lastKey = key;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Soft cheek blush that intensifies when poked or dizzy
    const blushAlpha = Math.min(0.65, qPoke * 0.45 + qDizzy * 0.35 + qAnnoyed * 0.12);
    if (blushAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = blushAlpha;
      ctx.fillStyle = '#ff7b7b';
      ctx.beginPath();
      ctx.ellipse(w * 0.34, h * 0.56, w * 0.075, h * 0.04, 0, 0, Math.PI * 2);
      ctx.ellipse(w * 0.66, h * 0.56, w * 0.075, h * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Annoyed furrowed brows + squint creases
    if (qAnnoyed > 0.02 && qDizzy <= 0.1) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, qAnnoyed * 1.15);
      ctx.strokeStyle = '#24140e';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';

      // Left brow angled down toward center
      ctx.beginPath();
      ctx.moveTo(w * 0.31, h * 0.34 - 8 * qAnnoyed);
      ctx.lineTo(w * 0.45, h * 0.38 + 12 * qAnnoyed);
      ctx.stroke();

      // Right brow angled down toward center
      ctx.beginPath();
      ctx.moveTo(w * 0.69, h * 0.34 - 8 * qAnnoyed);
      ctx.lineTo(w * 0.55, h * 0.38 + 12 * qAnnoyed);
      ctx.stroke();

      // Angry temple mark
      ctx.strokeStyle = '#e03c28';
      ctx.lineWidth = 4;
      const vx = w * 0.74;
      const vy = h * 0.27;
      const vr = 11 * qAnnoyed;
      ctx.beginPath();
      ctx.moveTo(vx - vr, vy);
      ctx.lineTo(vx + vr, vy);
      ctx.moveTo(vx, vy - vr);
      ctx.lineTo(vx, vy + vr);
      ctx.stroke();
      ctx.restore();
    }

    // Dizzy X eyes + orbiting stars on stretch release
    if (qDizzy > 0.02) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, qDizzy * 1.2);
      ctx.strokeStyle = '#1b110d';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';

      const eyeCenters = [
        [w * 0.37, h * 0.45],
        [w * 0.63, h * 0.45],
      ];
      const r = 18;
      eyeCenters.forEach(([ex, ey], idx) => {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate((idx === 0 ? 1 : -1) * qPhase * 0.18);
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(r, -r);
        ctx.lineTo(-r, r);
        ctx.stroke();
        ctx.restore();
      });

      for (let s = 0; s < 3; s++) {
        const ang = qPhase * 0.55 + (s * Math.PI * 2) / 3;
        const sx = w * 0.5 + Math.cos(ang) * w * 0.18;
        const sy = h * 0.26 + Math.sin(ang) * h * 0.05;
        ctx.save();
        ctx.fillStyle = '#ffd43b';
        ctx.strokeStyle = '#2b1810';
        ctx.lineWidth = 2.5;
        drawStarPath(ctx, sx, sy, 5, 14 * qDizzy, 6 * qDizzy);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }

    texture.needsUpdate = true;
  }

  return { texture, renderSheet };
}

const ShibaMascot = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.06, 2.05);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(renderer.domElement);

    const fxCanvas = document.createElement('canvas');
    fxCanvas.width = Math.round(window.innerWidth * Math.min(window.devicePixelRatio, 2));
    fxCanvas.height = Math.round(window.innerHeight * Math.min(window.devicePixelRatio, 2));
    fxCanvas.style.position = 'fixed';
    fxCanvas.style.inset = '0';
    fxCanvas.style.width = '100%';
    fxCanvas.style.height = '100%';
    fxCanvas.style.pointerEvents = 'none';
    document.body.appendChild(fxCanvas);
    const fxCtx = fxCanvas.getContext('2d');

    const expressionSheet = createExpressionSheet();

    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(2.2, 3.8, 4.2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffe8d2, 0.75);
    fillLight.position.set(-2.8, 1.5, 2.0);
    scene.add(fillLight);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const G = PLUSH.grid;
    const S = G + 1;
    const N = S * S;
    const ux = new Float32Array(N);
    const uy = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);
    const ax = new Float32Array(N);
    const ay = new Float32Array(N);
    const fixed = new Uint8Array(N);
    const headSpring = { tilt: 0, tiltV: 0, x: 0, xV: 0, y: 0, yV: 0 };

    for (let j = 0; j < S; j++) {
      for (let i = 0; i < S; i++) {
        const k = j * S + i;
        fixed[k] = i === 0 || j === 0 || i === G || j === G ? 1 : 0;
      }
    }

    const hoverRippleUniforms = {
      uTime: { value: 0 },
      uHoverPos: { value: new THREE.Vector3(0, 0.05, 0.38) },
      uHoverActive: { value: 0 },
      uRippleAmp: { value: 0 },
      uExprMap: { value: expressionSheet.texture },
      uExprAlpha: { value: 0.75 },
    };

    function attachLocalizedHoverRipple(material) {
      const matName = material.name || '';
      const isFurMaterial = matName === 'ShibaTan' || matName === 'ShibaCream' || matName === '';
      const furStrength = matName === 'ShibaTan' ? 0.085 : 0.055;
      const rimStrength = isFurMaterial ? 0.24 : 0.10;
      const sssStrength = matName === 'ShibaTan' ? 0.22 : matName === 'ShibaCream' ? 0.16 : 0.0;
      const exprMixStrength = isFurMaterial ? 0.75 : 0.0;

      material.customProgramCacheKey = () =>
        `shiba-plush-expr-${matName || 'default'}`;

      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = hoverRippleUniforms.uTime;
        shader.uniforms.uHoverPos = hoverRippleUniforms.uHoverPos;
        shader.uniforms.uHoverActive = hoverRippleUniforms.uHoverActive;
        shader.uniforms.uRippleAmp = hoverRippleUniforms.uRippleAmp;
        shader.uniforms.uExprMap = hoverRippleUniforms.uExprMap;
        shader.uniforms.uFurStrength = { value: isFurMaterial ? furStrength : 0.0 };
        shader.uniforms.uRimStrength = { value: rimStrength };
        shader.uniforms.uSssStrength = { value: sssStrength };
        shader.uniforms.uExprMixStrength = { value: exprMixStrength };

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec2 vFurUv;
             varying vec3 vWorldNormal;
             varying vec3 vWorldPos;
             uniform float uTime;
             uniform vec3 uHoverPos;
             uniform float uHoverActive;
             uniform float uRippleAmp;`
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vFurUv = uv;
             float rDist = distance(transformed, uHoverPos);
             float localMask = smoothstep(0.28, 0.015, rDist) * (uHoverActive * uRippleAmp);
             float ring = sin(rDist * 38.0 - uTime * 12.5) * exp(-rDist * 8.5);
             transformed += normal * ring * 0.034 * localMask;`
          )
          .replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>
             vec4 wp = vec4(transformed, 1.0);
             #ifdef USE_INSTANCING
               wp = instanceMatrix * wp;
             #endif
             wp = modelMatrix * wp;
             vWorldPos = wp.xyz;
             vec3 wn = objectNormal;
             #ifdef USE_INSTANCING
               wn = mat3(instanceMatrix) * wn;
             #endif
             vWorldNormal = normalize(mat3(modelMatrix) * wn);`
          );

        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec2 vFurUv;
             varying vec3 vWorldNormal;
             varying vec3 vWorldPos;
             uniform sampler2D uExprMap;
             uniform float uFurStrength;
             uniform float uRimStrength;
             uniform float uSssStrength;
             uniform float uExprMixStrength;

             float furHash(vec2 p) {
               return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
             }

             float furNoise(vec2 p) {
               vec2 i = floor(p);
               vec2 f = fract(p);
               vec2 u = f * f * (3.0 - 2.0 * f);
               float a = furHash(i);
               float b = furHash(i + vec2(1.0, 0.0));
               float c = furHash(i + vec2(0.0, 1.0));
               float d = furHash(i + vec2(1.0, 1.0));
               return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
             }`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             if (uFurStrength > 0.001) {
               float strand = furNoise(vec2(vFurUv.x * 110.0, vFurUv.y * 26.0));
               float microGrain = furNoise(vFurUv * 180.0);
               float furPattern = mix(strand, microGrain, 0.45) - 0.5;
               gl_FragColor.rgb *= (1.0 + furPattern * uFurStrength * 2.0);
             }

             if (uExprMixStrength > 0.001) {
               vec4 exprSample = texture2D(uExprMap, vFurUv);
               gl_FragColor.rgb = mix(
                 gl_FragColor.rgb,
                 exprSample.rgb,
                 clamp(exprSample.a * uExprMixStrength, 0.0, 1.0)
               );
             }

             vec3 N = normalize(vWorldNormal);
             vec3 V = normalize(cameraPosition - vWorldPos);
             float ndotv = clamp(dot(N, V), 0.0, 1.0);

             float rim = pow(1.0 - ndotv, 2.8);
             vec3 warmRimColor = vec3(1.0, 0.82, 0.62);
             gl_FragColor.rgb += warmRimColor * rim * uRimStrength;

             if (uSssStrength > 0.001) {
               float wrap = clamp((dot(N, normalize(vec3(0.35, 0.4, 0.85))) + 0.65) / 1.65, 0.0, 1.0);
               float sss = pow(1.0 - ndotv, 1.75) * (0.45 + 0.55 * wrap);
               vec3 sssTint = vec3(1.0, 0.65, 0.38);
               gl_FragColor.rgb += sssTint * sss * uSssStrength;
             }`
          );
      };
      material.needsUpdate = true;
    }

    const deformedMeshes = [];
    const hitMeshes = [];

    const bones = {
      neck: null,
      head: null,
      eyeL: null,
      eyeR: null,
      lidUpL: null,
      lidUpR: null,
      lidLoL: null,
      lidLoR: null,
      nose: null,
      jaw: null,
      tongue: null,
      earL1: null,
      earL2: null,
      earR1: null,
      earR2: null,
    };

    const restRot = new Map();
    const restPos = new Map();

    function saveRest(bone) {
      if (!bone) return;
      restRot.set(bone, bone.rotation.clone());
      restPos.set(bone, bone.position.clone());
    }

    let mixer = null;
    let idleAction = null;
    let animFrameId = null;

    new GLTFLoader().load(
      '/models/shiba_face_mascot.glb',
      (gltf) => {
        const model = gltf.scene;
        rootGroup.add(model);

        model.traverse((node) => {
          if (node.isMesh) {
            hitMeshes.push(node);
            const posAttr = node.geometry.getAttribute('position');
            if (posAttr) {
              deformedMeshes.push({
                mesh: node,
                posAttr,
                basePositions: new Float32Array(posAttr.array),
              });
            }
            if (node.material) {
              const mats = Array.isArray(node.material) ? node.material : [node.material];
              mats.forEach(attachLocalizedHoverRipple);
            }
          }

          if (!node.isBone) return;
          saveRest(node);
          switch (node.name) {
            case 'Neck': bones.neck = node; break;
            case 'Head': bones.head = node; break;
            case 'L_Eye': bones.eyeL = node; break;
            case 'R_Eye': bones.eyeR = node; break;
            case 'L_UpperEyelid': bones.lidUpL = node; break;
            case 'R_UpperEyelid': bones.lidUpR = node; break;
            case 'L_LowerEyelid': bones.lidLoL = node; break;
            case 'R_LowerEyelid': bones.lidLoR = node; break;
            case 'Nose': bones.nose = node; break;
            case 'Jaw': bones.jaw = node; break;
            case 'Tongue': bones.tongue = node; break;
            case 'L_Ear1': bones.earL1 = node; break;
            case 'L_Ear2': bones.earL2 = node; break;
            case 'R_Ear1': bones.earR1 = node; break;
            case 'R_Ear2': bones.earR2 = node; break;
          }
        });

        if (bones.tongue) {
          bones.tongue.scale.setScalar(0.0001);
        }

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          const clip =
            gltf.animations.find((c) => /idle/i.test(c.name)) || gltf.animations[0];
          if (clip) {
            idleAction = mixer.clipAction(clip);
            idleAction.setLoop(THREE.LoopRepeat).play();
          }
        }
      },
      undefined,
      (err) => console.error('Failed to load shiba_face_mascot.glb:', err)
    );

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const projVec = new THREE.Vector3();
    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };
    const look = { neckYaw: 0, neckPitch: 0, eyeYaw: 0, eyePitch: 0 };
    const hand = { x: G * 0.5, y: G * 0.5, px: G * 0.5, py: G * 0.5, touching: false };
    let grab = null;
    let timeSinceMove = CURSOR_IDLE_DELAY;
    let isHoveringGlb = false;

    let dragPeakStretch = 0;
    let funnyFaceTimer = 0;
    const FUNNY_FACE_DURATION = 0.95;
    let funnyDir = 1;
    let pokeTimer = 0;
    let rippleAmp = 0;
    let annoyedAmount = 0;
    let earPerkTimer = 0;
    let idleSniffCycleIndex = -1;
    let idleFlinchSide = -1;

    function updateGlbHover(clientX, clientY) {
      if (!hitMeshes.length) {
        isHoveringGlb = false;
        return;
      }
      pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
      pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        isHoveringGlb = true;
        hoverRippleUniforms.uHoverPos.value.copy(hits[0].point);
      } else {
        isHoveringGlb = false;
      }
    }

    function triggerFunnyFace(dir = 1) {
      if (funnyFaceTimer > 0.15) return;
      funnyFaceTimer = FUNNY_FACE_DURATION;
      funnyDir = dir >= 0 ? 1 : -1;
      earPerkTimer = 0.7;
    }

    function triggerPokeBoing() {
      pokeTimer = 0.35;
      headSpring.tiltV += (Math.random() > 0.5 ? 1 : -1) * 1.6;
      const cx = G * 0.5;
      const cy = G * 0.5;
      for (let k = 0; k < N; k++) {
        if (fixed[k]) continue;
        const rx = (k % S) - cx;
        const ry = Math.floor(k / S) - cy;
        const d = Math.hypot(rx, ry) / (G * 0.25);
        if (d < 1) {
          const wt = (1 - d * d) ** 2;
          vx[k] -= rx * 1.4 * wt;
          vy[k] -= ry * 1.4 * wt;
        }
      }
    }

    function sampleGridDisp(gx, gy) {
      const i = Math.max(0, Math.min(G - 1, Math.floor(gx)));
      const j = Math.max(0, Math.min(G - 1, Math.floor(gy)));
      const fx = Math.max(0, Math.min(1, gx - i));
      const fy = Math.max(0, Math.min(1, gy - j));
      const a = j * S + i;
      const b = a + 1;
      const c = a + S;
      const d = c + 1;
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;
      return [
        ux[a] * w00 + ux[b] * w10 + ux[c] * w01 + ux[d] * w11,
        uy[a] * w00 + uy[b] * w10 + uy[c] * w01 + uy[d] * w11,
      ];
    }

    function restPointGrid(gx, gy) {
      let rx = gx;
      let ry = gy;
      for (let n = 0; n < 3; n++) {
        const [dx, dy] = sampleGridDisp(rx, ry);
        rx = gx - dx;
        ry = gy - dy;
      }
      return [rx, ry];
    }

    function physics() {
      const cells = G;
      const w = 2 * Math.PI * PLUSH.wobble;
      const c = PLUSH.reach * cells * w;
      return {
        cells,
        w2: w * w,
        c2: c * c,
        gamma: 2 * PLUSH.damping * w,
        nu: PLUSH.flesh * c,
        limit: (PLUSH.maxPull * cells) ** 2,
      };
    }

    function accelerate(p) {
      for (let j = 1; j < G; j++) {
        for (let i = 1; i < G; i++) {
          const k = j * S + i;
          if (fixed[k]) continue;
          const x = ux[k];
          const y = uy[k];
          const hard = p.w2 * Math.min(PLUSH.hardest, 1 + (x * x + y * y) / p.limit);
          ax[k] =
            p.c2 * (ux[k - 1] + ux[k + 1] + ux[k - S] + ux[k + S] - 4 * x) -
            hard * x -
            p.gamma * vx[k] +
            p.nu * (vx[k - 1] + vx[k + 1] + vx[k - S] + vx[k + S] - 4 * vx[k]);
          ay[k] =
            p.c2 * (uy[k - 1] + uy[k + 1] + uy[k - S] + uy[k + S] - 4 * y) -
            hard * y -
            p.gamma * vy[k] +
            p.nu * (vy[k - 1] + vy[k + 1] + vy[k - S] + vy[k + S] - 4 * vy[k]);
        }
      }
    }

    function brushGrid(hx, hy, hvx, hvy, radius, grip, dt) {
      const r2 = radius * radius;
      for (let j = 1; j < G; j++) {
        for (let i = 1; i < G; i++) {
          const k = j * S + i;
          if (fixed[k]) continue;
          const dx = i + ux[k] - hx;
          const dy = j + uy[k] - hy;
          const d2 = dx * dx + dy * dy;
          if (d2 >= r2) continue;
          const q = 1 - d2 / r2;
          const hold = Math.min(1, q * q * 2.4);
          const blend = 1 - Math.exp(-grip * hold * dt);
          vx[k] += (hvx - vx[k]) * blend;
          vy[k] += (hvy - vy[k]) * blend;
        }
      }
    }

    function swayStep(pullX, pullY, dt) {
      const w = 2 * Math.PI * 1.25;
      const k = w * w;
      const damp = 2 * 0.2 * w;
      const tiltTo = pullX * 0.38 * PLUSH.sway;
      const xTo = pullX * 0.11 * PLUSH.sway;
      const yTo = -pullY * 0.11 * PLUSH.sway;
      headSpring.tiltV += (k * (tiltTo - headSpring.tilt) - damp * headSpring.tiltV) * dt;
      headSpring.tilt += headSpring.tiltV * dt;
      headSpring.xV += (k * (xTo - headSpring.x) - damp * headSpring.xV) * dt;
      headSpring.x += headSpring.xV * dt;
      headSpring.yV += (k * (yTo - headSpring.y) - damp * headSpring.yV) * dt;
      headSpring.y += headSpring.yV * dt;
    }

    function simulateGrid(p, elapsed, fromX, fromY, toX, toY, hvx, hvy, radius, grip, pullX, pullY) {
      const K = 8 * p.c2 + PLUSH.hardest * p.w2;
      const d = p.gamma + 8 * p.nu;
      const stable = (0.8 * (Math.sqrt(d * d + 4 * K) - d)) / K;
      const reach =
        grip > 0 && radius > 0
          ? Math.ceil(Math.hypot(toX - fromX, toY - fromY) / (radius * 0.5))
          : 0;
      const steps = Math.min(PLUSH.maxSteps, Math.max(2, Math.ceil(elapsed / stable), reach));
      const dt = Math.min(elapsed / steps, stable);
      const slowed = elapsed / (steps * dt);

      for (let s = 1; s <= steps; s++) {
        const f = s / steps;
        const bx = fromX + (toX - fromX) * f;
        const by = fromY + (toY - fromY) * f;
        accelerate(p);
        for (let k = 0; k < N; k++) {
          if (fixed[k]) continue;
          vx[k] += ax[k] * dt;
          vy[k] += ay[k] * dt;
        }
        if (grip > 0) {
          brushGrid(bx, by, hvx * slowed, hvy * slowed, radius, grip, dt);
        }
        swayStep(pullX, pullY, dt);
        for (let k = 0; k < N; k++) {
          if (fixed[k]) continue;
          ux[k] += vx[k] * dt;
          uy[k] += vy[k] * dt;
        }
      }
    }

    function applyMeshDeformation(hoverWorld, hoverActive, amp) {
      const pullNormX = grab ? grab.pullX / G : 0;
      const pullNormY = grab ? grab.pullY / G : 0;

      for (const item of deformedMeshes) {
        const { posAttr, basePositions } = item;
        const arr = posAttr.array;

        for (let idx = 0; idx < arr.length; idx += 3) {
          const bx = basePositions[idx];
          const by = basePositions[idx + 1];
          const bz = basePositions[idx + 2];

          const gx = THREE.MathUtils.clamp((bx / 0.8 + 0.5) * G, 0, G);
          const gy = THREE.MathUtils.clamp((-by / 0.8 + 0.5) * G, 0, G);
          const [dux, duy] = sampleGridDisp(gx, gy);

          let dx3 = (dux / G) * 0.96;
          let dy3 = -(duy / G) * 0.88;
          let dz3 = 0;

          const faceWeight = THREE.MathUtils.clamp(by + 0.35, 0, 0.92);
          dx3 += pullNormX * 0.34 * faceWeight;
          dy3 += -pullNormY * 0.28 * faceWeight + headSpring.y * 0.34 * faceWeight;
          dz3 += Math.hypot(pullNormX, pullNormY) * 0.12 * faceWeight;

          if (hoverActive > 0 && amp > 0) {
            const dHover = Math.hypot(bx - hoverWorld.x, by - hoverWorld.y);
            if (dHover < 0.26) {
              const falloff = (1 - dHover / 0.26) ** 2;
              dz3 += falloff * 0.038 * amp;
            }
          }

          arr[idx] = bx + dx3;
          arr[idx + 1] = by + dy3;
          arr[idx + 2] = bz + dz3;
        }

        posAttr.needsUpdate = true;
        item.mesh.geometry.computeVertexNormals();
      }
    }

    function getFaceScreenAnchor() {
      const w = fxCanvas.width;
      const h = fxCanvas.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (bones.head) {
        bones.head.getWorldPosition(projVec);
        projVec.y += 0.03;
        projVec.z += 0.32;
        projVec.project(camera);
        return {
          cx: (projVec.x * 0.5 + 0.5) * w,
          cy: (-projVec.y * 0.5 + 0.5) * h,
          headScale: Math.min(w, h) * 0.22 * dpr,
        };
      }

      return {
        cx: w * 0.5 + (look.neckYaw + headSpring.tilt * 0.5) * w * 0.14,
        cy: h * 0.48 + look.neckPitch * h * 0.14,
        headScale: Math.min(w, h) * 0.22 * dpr,
      };
    }

    function drawCanvasExpressions(now, funnyWave, annoyedWave) {
      const w = fxCanvas.width;
      const h = fxCanvas.height;
      fxCtx.clearRect(0, 0, w, h);

      const { cx, cy, headScale } = getFaceScreenAnchor();

      if (annoyedWave > 0.02 && funnyWave <= 0.05) {
        fxCtx.save();
        fxCtx.translate(cx, cy);
        fxCtx.rotate(headSpring.tilt * 0.5);
        fxCtx.globalAlpha = Math.min(1, annoyedWave * 1.1);

        const eyeOffsetX = headScale * 0.18;
        const eyeOffsetY = -headScale * 0.065;
        const browY = eyeOffsetY - headScale * 0.11;
        const browW = headScale * 0.095;

        fxCtx.strokeStyle = '#1b110d';
        fxCtx.lineWidth = Math.max(2.6, headScale * 0.026);
        fxCtx.lineCap = 'round';

        fxCtx.beginPath();
        fxCtx.moveTo(-eyeOffsetX - browW * 0.5, browY - headScale * 0.025 * annoyedWave);
        fxCtx.lineTo(-eyeOffsetX + browW * 0.5, browY + headScale * 0.035 * annoyedWave);
        fxCtx.stroke();

        fxCtx.beginPath();
        fxCtx.moveTo(eyeOffsetX + browW * 0.5, browY - headScale * 0.025 * annoyedWave);
        fxCtx.lineTo(eyeOffsetX - browW * 0.5, browY + headScale * 0.035 * annoyedWave);
        fxCtx.stroke();

        const veinX = headScale * 0.34;
        const veinY = -headScale * 0.29;
        const veinR = headScale * 0.042 * annoyedWave;
        fxCtx.strokeStyle = '#d93829';
        fxCtx.lineWidth = Math.max(2.0, headScale * 0.016);
        fxCtx.beginPath();
        fxCtx.moveTo(veinX - veinR, veinY);
        fxCtx.lineTo(veinX + veinR, veinY);
        fxCtx.moveTo(veinX, veinY - veinR);
        fxCtx.lineTo(veinX, veinY + veinR);
        fxCtx.stroke();

        fxCtx.restore();
      }

      if (funnyWave <= 0.01) return;

      fxCtx.save();
      fxCtx.translate(cx, cy);
      fxCtx.rotate(headSpring.tilt * 0.6 + funnyWave * 0.25 * funnyDir);
      fxCtx.globalAlpha = Math.min(1, funnyWave * 1.15);

      const eyeOffsetX = headScale * 0.18;
      const eyeOffsetY = -headScale * 0.06;
      const eyeR = headScale * 0.065;

      [-1, 1].forEach((side, i) => {
        const ex = side * eyeOffsetX;
        const ey = eyeOffsetY;
        fxCtx.save();
        fxCtx.translate(ex, ey);
        fxCtx.rotate(now * (i === 0 ? 5 : -5) * 0.35);

        fxCtx.strokeStyle = '#1b110d';
        fxCtx.lineWidth = Math.max(2.5, headScale * 0.024);
        fxCtx.lineCap = 'round';
        fxCtx.beginPath();
        fxCtx.moveTo(-eyeR, -eyeR);
        fxCtx.lineTo(eyeR, eyeR);
        fxCtx.moveTo(eyeR, -eyeR);
        fxCtx.lineTo(-eyeR, eyeR);
        fxCtx.stroke();
        fxCtx.restore();
      });

      const sweatX = funnyDir > 0 ? headScale * 0.36 : -headScale * 0.36;
      const sweatY = -headScale * 0.24 + (1 - funnyWave) * headScale * 0.14;
      fxCtx.fillStyle = '#6ec6ff';
      fxCtx.beginPath();
      fxCtx.moveTo(sweatX, sweatY - headScale * 0.05);
      fxCtx.quadraticCurveTo(
        sweatX + headScale * 0.045,
        sweatY + headScale * 0.02,
        sweatX,
        sweatY + headScale * 0.055
      );
      fxCtx.quadraticCurveTo(
        sweatX - headScale * 0.045,
        sweatY + headScale * 0.02,
        sweatX,
        sweatY - headScale * 0.05
      );
      fxCtx.fill();

      const starCount = 3;
      for (let s = 0; s < starCount; s++) {
        const ang = now * 4.2 + (s * Math.PI * 2) / starCount;
        const sx = Math.cos(ang) * headScale * 0.44;
        const sy = -headScale * 0.34 + Math.sin(ang) * headScale * 0.13;
        fxCtx.save();
        fxCtx.fillStyle = '#ffd43b';
        fxCtx.strokeStyle = '#2b1810';
        fxCtx.lineWidth = Math.max(1.5, headScale * 0.012);
        drawStarPath(fxCtx, sx, sy, 5, headScale * 0.055 * funnyWave, headScale * 0.025 * funnyWave);
        fxCtx.fill();
        fxCtx.stroke();
        fxCtx.restore();
      }

      fxCtx.restore();
    }

    function stretchGrabHand(ptrGx, ptrGy) {
      const dx = ptrGx - grab.startX;
      const dy = ptrGy - grab.startY;
      const len = Math.hypot(dx, dy);
      const max = PLUSH.maxPull * G;
      const eased = len > 0 ? (max * Math.tanh(len / max)) / len : 0;
      grab.pullX = dx * eased;
      grab.pullY = dy * eased;
    }

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      timeSinceMove = 0;
      updateGlbHover(e.clientX, e.clientY);
      if (isHoveringGlb && !grab) {
        rippleAmp = Math.min(1.0, rippleAmp + 0.22);
      }
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      updateGlbHover(e.clientX, e.clientY);
      if (!isHoveringGlb) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const gx = (nx * 0.5 + 0.5) * G;
      const gy = (-ny * 0.5 + 0.5) * G;
      grab = { startX: gx, startY: gy, pullX: 0, pullY: 0 };
      dragPeakStretch = 0;
      hand.x = hand.px = gx;
      hand.y = hand.py = gy;
      timeSinceMove = 0;
    };

    const onPointerUp = () => {
      if (!grab) return;
      const pullDist = Math.hypot(grab.pullX, grab.pullY) / G;
      const dir = grab.pullX || mouse.x;
      grab = null;
      if (Math.max(dragPeakStretch, pullDist) > 0.045) {
        triggerFunnyFace(dir);
      } else if (pullDist <= 0.015) {
        triggerPokeBoing();
      }
      dragPeakStretch = 0;
    };

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(dpr);
      fxCanvas.width = Math.round(window.innerWidth * dpr);
      fxCanvas.height = Math.round(window.innerHeight * dpr);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = Math.max(0.001, Math.min(0.05, clock.getDelta()));
      const now = clock.getElapsedTime();
      const p = physics();

      timeSinceMove += elapsed;
      const isTracking = timeSinceMove < CURSOR_IDLE_DELAY;

      let funnyWave = 0;
      if (funnyFaceTimer > 0) {
        funnyFaceTimer = Math.max(0, funnyFaceTimer - elapsed);
        funnyWave = Math.sin((funnyFaceTimer / FUNNY_FACE_DURATION) * Math.PI);
      }

      if (pokeTimer > 0) {
        pokeTimer = Math.max(0, pokeTimer - elapsed);
      }

      if (idleAction) {
        const targetWeight = grab || funnyWave > 0.1 ? 0.35 : 1.0;
        idleAction.setEffectiveWeight(
          THREE.MathUtils.damp(idleAction.getEffectiveWeight(), targetWeight, 8, elapsed)
        );
      }

      if (mixer) {
        mixer.update(elapsed);
      }

      smoothMouse.x = THREE.MathUtils.damp(smoothMouse.x, mouse.x, 12, elapsed);
      smoothMouse.y = THREE.MathUtils.damp(smoothMouse.y, mouse.y, 12, elapsed);

      const targetNeckYaw = isTracking ? smoothMouse.x * 0.34 : 0;
      const targetNeckPitch = isTracking ? -smoothMouse.y * 0.22 : 0;
      const targetEyeYaw = isTracking ? smoothMouse.x * 0.30 : 0;
      const targetEyePitch = isTracking ? -smoothMouse.y * 0.20 : 0;

      const dampRate = isTracking ? 10 : 5;
      look.neckYaw = THREE.MathUtils.damp(look.neckYaw, targetNeckYaw, dampRate, elapsed);
      look.neckPitch = THREE.MathUtils.damp(look.neckPitch, targetNeckPitch, dampRate, elapsed);
      look.eyeYaw = THREE.MathUtils.damp(look.eyeYaw, targetEyeYaw, dampRate + 4, elapsed);
      look.eyePitch = THREE.MathUtils.damp(look.eyePitch, targetEyePitch, dampRate + 4, elapsed);

      const ptrGx = (smoothMouse.x * 0.5 + 0.5) * G;
      const ptrGy = (-smoothMouse.y * 0.5 + 0.5) * G;

      hand.px = hand.x;
      hand.py = hand.y;
      if (grab) {
        stretchGrabHand(ptrGx, ptrGy);
        hand.x = grab.startX + grab.pullX;
        hand.y = grab.startY + grab.pullY;
      } else {
        hand.x = ptrGx;
        hand.y = ptrGy;
      }

      let hvx = (hand.x - hand.px) / elapsed;
      let hvy = (hand.y - hand.py) / elapsed;
      let radius = 0;
      let grip = 0;
      const canRub = isHoveringGlb && !grab;

      if (grab) {
        radius = Math.max(1.8, PLUSH.grabRadius * G);
        grip = PLUSH.grip;
      } else if (canRub && PLUSH.rub > 0 && PLUSH.rubSlip > 0) {
        const [rx, ry] = restPointGrid(hand.x, hand.y);
        const dragged = Math.hypot(hand.x - rx, hand.y - ry) / G;
        const hold = Math.max(0, 1 - dragged / PLUSH.rubSlip);
        radius = Math.max(1.8, PLUSH.rubRadius * G);
        grip = PLUSH.rub * hold * hold;
        const speed = Math.hypot(hvx, hvy);
        const most = PLUSH.rubSlip * G * 26;
        const pass = !hand.touching ? 0 : speed > most ? most / speed : 1;
        hvx *= pass;
        hvy *= pass;
      }
      hand.touching = canRub;

      simulateGrid(
        p,
        elapsed,
        hand.px,
        hand.py,
        hand.x,
        hand.y,
        hvx,
        hvy,
        radius,
        grip,
        grab ? grab.pullX / G : 0,
        grab ? grab.pullY / G : 0
      );

      if (grab) {
        let maxDispSq = 0;
        for (let k = 0; k < N; k++) {
          const d2 = ux[k] * ux[k] + uy[k] * uy[k];
          if (d2 > maxDispSq) maxDispSq = d2;
        }
        const dragStretch = Math.max(
          Math.sqrt(maxDispSq) / G,
          Math.hypot(grab.pullX, grab.pullY) / G
        );
        if (dragStretch > dragPeakStretch) {
          dragPeakStretch = dragStretch;
        }
      }

      rippleAmp = THREE.MathUtils.damp(rippleAmp, 0, 2.8, elapsed);
      const activeHoverFlag = isHoveringGlb && !grab ? 1.0 : 0.0;
      const targetAnnoyed =
        activeHoverFlag > 0 && rippleAmp > 0.08 && funnyWave <= 0.05
          ? Math.min(1, rippleAmp * 1.35)
          : 0;
      annoyedAmount = THREE.MathUtils.damp(annoyedAmount, targetAnnoyed, 9, elapsed);

      const pokeWave = pokeTimer > 0 ? Math.sin((pokeTimer / 0.35) * Math.PI) : 0;

      expressionSheet.renderSheet({
        annoyed: annoyedAmount,
        dizzy: funnyWave,
        poke: pokeWave,
        time: now,
      });

      if (bones.neck && restRot.has(bones.neck)) {
        const r = restRot.get(bones.neck);
        bones.neck.rotation.y = r.y + look.neckYaw + headSpring.tilt * 0.4 + funnyWave * 0.2 * funnyDir;
        bones.neck.rotation.x = r.x + look.neckPitch - funnyWave * 0.14 + annoyedAmount * 0.05 - pokeWave * 0.08;
        bones.neck.rotation.z = r.z - look.neckYaw * 0.16 + headSpring.tilt * 0.7 + funnyWave * 0.28 * funnyDir;
      }

      if (bones.head && restRot.has(bones.head)) {
        const r = restRot.get(bones.head);
        bones.head.rotation.z = r.z + funnyWave * 0.24 * funnyDir;
        bones.head.rotation.x = r.x + funnyWave * 0.15 + annoyedAmount * 0.06;
      }

      const dizzyEyeHide = funnyWave > 0.15 ? 1 - funnyWave * 0.75 : 1;
      if (bones.eyeL && restRot.has(bones.eyeL)) {
        const r = restRot.get(bones.eyeL);
        bones.eyeL.rotation.y = r.y + look.eyeYaw + funnyWave * 0.28 * funnyDir;
        bones.eyeL.rotation.x = r.x + look.eyePitch - funnyWave * 0.22;
        bones.eyeL.scale.setScalar(dizzyEyeHide);
      }
      if (bones.eyeR && restRot.has(bones.eyeR)) {
        const r = restRot.get(bones.eyeR);
        bones.eyeR.rotation.y = r.y + look.eyeYaw - funnyWave * 0.32 * funnyDir;
        bones.eyeR.rotation.x = r.x + look.eyePitch + funnyWave * 0.24;
        bones.eyeR.scale.setScalar(dizzyEyeHide);
      }

if (bones.jaw && restRot.has(bones.jaw) && restPos.has(bones.jaw)) {
        const r = restRot.get(bones.jaw);
        const pRest = restPos.get(bones.jaw);

        const dizzyJawOpen =
          funnyWave > 0.01
            ? funnyWave * 0.24 + Math.sin(now * 16) * 0.035 * funnyWave
            : 0;
        const grumpyJawClose =
          funnyWave <= 0.05 ? annoyedAmount * 0.045 : 0;
        const pokeJawLift = pokeWave * 0.03;

        bones.jaw.rotation.x =
          r.x + dizzyJawOpen - grumpyJawClose - pokeJawLift;
        bones.jaw.position.y =
          pRest.y -
          funnyWave * 0.014 +
          grumpyJawClose * 0.09 +
          pokeJawLift * 0.05;
      }

      if (bones.tongue && restRot.has(bones.tongue) && restPos.has(bones.tongue)) {
        if (funnyWave > 0.01) {
          const r = restRot.get(bones.tongue);
          const pRest = restPos.get(bones.tongue);
          bones.tongue.scale.setScalar(0.2 + funnyWave * 1.15);
          bones.tongue.position.set(
            pRest.x + funnyWave * 0.022 * funnyDir,
            pRest.y - funnyWave * 0.018,
            pRest.z + funnyWave * 0.055
          );
          bones.tongue.rotation.set(
            r.x + funnyWave * 0.38,
            r.y + funnyWave * 0.35 * funnyDir,
            r.z + funnyWave * 0.72 * funnyDir
          );
        } else {
          const pRest = restPos.get(bones.tongue);
          const r = restRot.get(bones.tongue);
          bones.tongue.scale.setScalar(0.0001);
          bones.tongue.position.copy(pRest);
          bones.tongue.rotation.copy(r);
        }
      }

      const blinkCycle = now % 4.0;
      const blink = blinkCycle < 0.15 ? Math.sin((blinkCycle / 0.15) * Math.PI) : 0;
      const squintFromAnnoyed = annoyedAmount * 0.45;
      if (bones.lidUpL && restRot.has(bones.lidUpL)) {
        bones.lidUpL.rotation.x = restRot.get(bones.lidUpL).x + 0.35 * Math.max(blink, squintFromAnnoyed, pokeWave * 0.7);
      }
      if (bones.lidUpR && restRot.has(bones.lidUpR)) {
        bones.lidUpR.rotation.x = restRot.get(bones.lidUpR).x + 0.35 * Math.max(blink, squintFromAnnoyed, pokeWave * 0.7);
      }
      if (bones.lidLoL && restRot.has(bones.lidLoL)) {
        bones.lidLoL.rotation.x = restRot.get(bones.lidLoL).x - 0.22 * squintFromAnnoyed;
      }
      if (bones.lidLoR && restRot.has(bones.lidLoR)) {
        bones.lidLoR.rotation.x = restRot.get(bones.lidLoR).x - 0.22 * squintFromAnnoyed;
      }

      let idleSniff = 0;
      let idleEarFlinch = 0;
      if (!isTracking && funnyFaceTimer <= 0) {
        const cycleIdx = Math.floor(now / 4.5);
        const sniffPhase = now % 4.5;
        if (sniffPhase < 0.75) {
          if (cycleIdx !== idleSniffCycleIndex) {
            idleSniffCycleIndex = cycleIdx;
            idleFlinchSide = idleFlinchSide < 0 ? 1 : -1;
          }
          const env = Math.sin((sniffPhase / 0.75) * Math.PI);
          idleSniff = Math.abs(Math.sin(now * 26)) * 0.012 * env;
          idleEarFlinch = Math.sin(sniffPhase * Math.PI * 3) * 0.24 * env;
        }
      }

      let perk = 0;
      if (earPerkTimer > 0) {
        earPerkTimer = Math.max(0, earPerkTimer - elapsed);
        perk = Math.sin((earPerkTimer / 0.7) * Math.PI) * 0.32;
      }

      const leftFlinch = idleFlinchSide < 0 ? idleEarFlinch : 0;
      const rightFlinch = idleFlinchSide > 0 ? idleEarFlinch : 0;

      if (bones.earL1 && restRot.has(bones.earL1)) {
        bones.earL1.rotation.z = restRot.get(bones.earL1).z + perk + leftFlinch + funnyWave * 0.16 * funnyDir + pokeWave * 0.15;
      }
      if (bones.earL2 && restRot.has(bones.earL2)) {
        bones.earL2.rotation.z = restRot.get(bones.earL2).z + leftFlinch * 1.25;
      }
      if (bones.earR1 && restRot.has(bones.earR1)) {
        bones.earR1.rotation.z = restRot.get(bones.earR1).z - perk - rightFlinch + funnyWave * 0.16 * funnyDir - pokeWave * 0.15;
      }
      if (bones.earR2 && restRot.has(bones.earR2)) {
        bones.earR2.rotation.z = restRot.get(bones.earR2).z - rightFlinch * 1.25;
      }

      if (bones.nose && restPos.has(bones.nose)) {
        const pRest = restPos.get(bones.nose);
        const noseFlipX = idleSniff > 0 ? Math.sin(now * 24) * 0.014 : 0;
        const wiggle = Math.sin(now * 28) * 0.014 * funnyWave;
        bones.nose.position.set(
          pRest.x + wiggle + noseFlipX,
          pRest.y + idleSniff + annoyedAmount * 0.008 - pokeWave * 0.008,
          pRest.z + idleSniff * 0.5 + pokeWave * 0.012
        );
      }

      hoverRippleUniforms.uTime.value = now;
      hoverRippleUniforms.uHoverActive.value = activeHoverFlag;
      hoverRippleUniforms.uRippleAmp.value = rippleAmp;

      applyMeshDeformation(hoverRippleUniforms.uHoverPos.value, activeHoverFlag, rippleAmp);

      renderer.render(scene, camera);
      drawCanvasExpressions(now, funnyWave, annoyedAmount);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      expressionSheet.texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      fxCanvas.remove();
    };
  }, []);

  return null;
};

export default ShibaMascot;