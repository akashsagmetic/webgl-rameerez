import { useEffect } from 'react';
import * as THREE from 'three';

const CURSOR_IDLE_DELAY = 2.2;
const DIZZY_DURATION = 0.95;

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

function createMochiExpressionTexture() {
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

  function drawEyes({ w, h, annoyed, dizzy, poke, sleepy, phase }) {
    const leftEye = [w * 0.37, h * 0.45];
    const rightEye = [w * 0.63, h * 0.45];

    ctx.save();
    ctx.strokeStyle = '#241412';
    ctx.fillStyle = '#241412';
    ctx.lineCap = 'round';

    if (dizzy > 0.05) {
      ctx.globalAlpha = Math.min(1, dizzy * 1.2);
      ctx.lineWidth = 7;
      const r = 17;
      [leftEye, rightEye].forEach(([ex, ey], idx) => {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate((idx === 0 ? 1 : -1) * phase * 0.2);
        ctx.beginPath();
        ctx.moveTo(-r, -r);
        ctx.lineTo(r, r);
        ctx.moveTo(r, -r);
        ctx.lineTo(-r, r);
        ctx.stroke();
        ctx.restore();
      });

      for (let s = 0; s < 3; s++) {
        const ang = phase * 0.55 + (s * Math.PI * 2) / 3;
        const sx = w * 0.5 + Math.cos(ang) * w * 0.19;
        const sy = h * 0.25 + Math.sin(ang) * h * 0.05;
        ctx.save();
        ctx.fillStyle = '#ffd43b';
        ctx.strokeStyle = '#2b1810';
        ctx.lineWidth = 2.5;
        drawStarPath(ctx, sx, sy, 5, 14 * dizzy, 6 * dizzy);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    if (sleepy > 0.12 && annoyed <= 0.05) {
      ctx.globalAlpha = Math.min(1, sleepy * 1.15);
      ctx.lineWidth = 6.5;
      const halfW = 17;
      const sag = 8 * sleepy;
      [leftEye, rightEye].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(ex - halfW, ey - 2);
        ctx.quadraticCurveTo(ex, ey + sag, ex + halfW, ey - 2);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    // Happy / curious / poked eyes
    const squint = annoyed > 0.05 ? annoyed * 0.45 : poke > 0.05 ? poke * 0.55 : 0;
    const eyeRx = 13;
    const eyeRy = Math.max(4, 15 * (1 - squint));

    [leftEye, rightEye].forEach(([ex, ey]) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRx, eyeRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glossy highlight dot
      if (eyeRy > 7) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -4, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#241412';
      }
      ctx.restore();
    });

    // Furrowed annoyed brows while hovering with ripple
    if (annoyed > 0.06) {
      ctx.globalAlpha = Math.min(1, annoyed * 1.2);
      ctx.lineWidth = 7;

      ctx.beginPath();
      ctx.moveTo(w * 0.30, h * 0.33 - 7 * annoyed);
      ctx.lineTo(w * 0.45, h * 0.38 + 12 * annoyed);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.70, h * 0.33 - 7 * annoyed);
      ctx.lineTo(w * 0.55, h * 0.38 + 12 * annoyed);
      ctx.stroke();

      ctx.strokeStyle = '#e03c28';
      ctx.lineWidth = 4;
      const vx = w * 0.75;
      const vy = h * 0.26;
      const vr = 11 * annoyed;
      ctx.beginPath();
      ctx.moveTo(vx - vr, vy);
      ctx.lineTo(vx + vr, vy);
      ctx.moveTo(vx, vy - vr);
      ctx.lineTo(vx, vy + vr);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMouth({ w, h, annoyed, dizzy, poke, sleepy, phase }) {
    const mx = w * 0.5;
    const my = h * 0.59;
    const mouthW = w * 0.14;

    ctx.save();
    ctx.strokeStyle = '#241412';
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (dizzy > 0.05) {
      ctx.globalAlpha = Math.min(1, dizzy * 1.2);
      const waveAmp = (5.5 + Math.sin(phase * 1.4) * 3.5) * dizzy;
      const waves = 4;
      const steps = 24;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = mx - mouthW * 0.5 + t * mouthW;
        const py =
          my +
          Math.sin(t * Math.PI * waves + phase * 0.9) *
            waveAmp *
            Math.sin(t * Math.PI);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (annoyed > 0.08) {
      const g = Math.min(1, annoyed * 1.15);
      ctx.globalAlpha = g;
      const poutDrop = 10 * g;

      ctx.beginPath();
      ctx.moveTo(mx - mouthW * 0.42, my + poutDrop * 0.55);
      ctx.quadraticCurveTo(mx, my - 3 * g, mx + mouthW * 0.42, my + poutDrop * 0.55);
      ctx.stroke();

      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(mx - mouthW * 0.16, my + poutDrop + 6);
      ctx.quadraticCurveTo(mx, my + poutDrop + 11, mx + mouthW * 0.16, my + poutDrop + 6);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (sleepy > 0.15) {
      const s = Math.min(1, sleepy);
      ctx.globalAlpha = 0.72 * s;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.moveTo(mx - mouthW * 0.32, my);
      ctx.quadraticCurveTo(mx, my + 3.5 * s, mx + mouthW * 0.32, my);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const bounce = poke > 0.05 ? Math.sin(phase * 1.2) * 3 * poke : 0;
    const curve = 9.5 + poke * 5 + bounce;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(mx - mouthW * 0.44, my - 2 - bounce * 0.4);
    ctx.quadraticCurveTo(mx, my + curve, mx + mouthW * 0.44, my - 2 - bounce * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  function renderSheet({ annoyed, dizzy, poke, sleepy = 0, time }) {
    const qAnnoyed = Math.round(annoyed * 20) / 20;
    const qDizzy = Math.round(dizzy * 20) / 20;
    const qPoke = Math.round(poke * 20) / 20;
    const qSleepy = Math.round(sleepy * 20) / 20;
    const needsMotion = qDizzy > 0.05 || qPoke > 0.05;
    const qPhase = needsMotion ? Math.floor(time * 10) : 0;

    const key = `${qAnnoyed}|${qDizzy}|${qPoke}|${qSleepy}|${qPhase}`;
    if (key === lastKey) return;
    lastKey = key;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Mochi cheek blush
    const blushAlpha = Math.min(
      0.65,
      0.24 + qPoke * 0.4 + qDizzy * 0.3 + qSleepy * 0.16
    );
    ctx.save();
    ctx.globalAlpha = blushAlpha;
    ctx.fillStyle = '#ff7d8a';
    ctx.beginPath();
    ctx.ellipse(w * 0.31, h * 0.54, w * 0.075, h * 0.042, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.69, h * 0.54, w * 0.075, h * 0.042, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawEyes({
      w,
      h,
      annoyed: qAnnoyed,
      dizzy: qDizzy,
      poke: qPoke,
      sleepy: qSleepy,
      phase: qPhase,
    });

    drawMouth({
      w,
      h,
      annoyed: qAnnoyed,
      dizzy: qDizzy,
      poke: qPoke,
      sleepy: qSleepy,
      phase: qPhase,
    });

    texture.needsUpdate = true;
  }

  return { texture, renderSheet };
}

function buildMochiGeometry() {
  const geo = new THREE.SphereGeometry(0.42, 48, 36);
  const pos = geo.getAttribute('position');
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Flatten bottom like a sitting mochi dumpling and plump cheeks slightly
    if (v.y < -0.15) {
      v.y = -0.15 + (v.y + 0.15) * 0.52;
    } else {
      v.y *= 0.88;
    }
    const cheekBulge = Math.exp(((v.y + 0.04) / 0.22) ** 2) * 0.08;
    v.x *= 1.06 + cheekBulge;
    v.z *= 1.02;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

const MochiMascot = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.05, 2.05);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(renderer.domElement);

    const exprSheet = createMochiExpressionTexture();

    scene.add(new THREE.AmbientLight(0xffffff, 1.08));
    const keyLight = new THREE.DirectionalLight(0xfff7ee, 2.0);
    keyLight.position.set(2.2, 3.6, 4.0);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffdfcc, 0.8);
    fillLight.position.set(-2.6, 1.4, 2.2);
    scene.add(fillLight);

    const shaderUniforms = {
      uTime: { value: 0 },
      uHoverPos: { value: new THREE.Vector3(0, 0.04, 0.42) },
      uHoverActive: { value: 0 },
      uRippleAmp: { value: 0 },
      uStretchBoost: { value: 0 },
      uExprMap: { value: exprSheet.texture },
    };

    function createMochiMaterial({ name, color, roughness = 0.42, exprMix = 0.85, sssBase = 0.24 }) {
      const mat = new THREE.MeshStandardMaterial({
        name,
        color,
        roughness,
        metalness: 0.0,
      });

      mat.customProgramCacheKey = () => `mochi-plush-${name}`;

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.uTime;
        shader.uniforms.uHoverPos = shaderUniforms.uHoverPos;
        shader.uniforms.uHoverActive = shaderUniforms.uHoverActive;
        shader.uniforms.uRippleAmp = shaderUniforms.uRippleAmp;
        shader.uniforms.uStretchBoost = shaderUniforms.uStretchBoost;
        shader.uniforms.uExprMap = shaderUniforms.uExprMap;
        shader.uniforms.uExprMix = { value: exprMix };
        shader.uniforms.uSssBase = { value: sssBase };

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec2 vMochiUv;
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
             vMochiUv = uv;
             float rDist = distance(transformed, uHoverPos);
             float localMask = smoothstep(0.28, 0.015, rDist) * (uHoverActive * uRippleAmp);
             float ring = sin(rDist * 38.0 - uTime * 12.5) * exp(-rDist * 8.5);
             transformed += normal * ring * 0.032 * localMask;`
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
             varying vec2 vMochiUv;
             varying vec3 vWorldNormal;
             varying vec3 vWorldPos;
             uniform sampler2D uExprMap;
             uniform float uExprMix;
             uniform float uSssBase;
             uniform float uStretchBoost;

             float mochiHash(vec2 p) {
               return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
             }

             float mochiNoise(vec2 p) {
               vec2 i = floor(p);
               vec2 f = fract(p);
               vec2 u = f * f * (3.0 - 2.0 * f);
               float a = mochiHash(i);
               float b = mochiHash(i + vec2(1.0, 0.0));
               float c = mochiHash(i + vec2(0.0, 1.0));
               float d = mochiHash(i + vec2(1.0, 1.0));
               return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
             }`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             // Subtle powdered mochi surface micro-grain
             float grain = mochiNoise(vMochiUv * 150.0) - 0.5;
             gl_FragColor.rgb *= (1.0 + grain * 0.08);

             if (uExprMix > 0.001) {
               vec4 exprSample = texture2D(uExprMap, vMochiUv);
               gl_FragColor.rgb = mix(
                 gl_FragColor.rgb,
                 exprSample.rgb,
                 clamp(exprSample.a * uExprMix, 0.0, 1.0)
               );
             }

             vec3 N = normalize(vWorldNormal);
             vec3 V = normalize(cameraPosition - vWorldPos);
             float ndotv = clamp(dot(N, V), 0.0, 1.0);

             // Warm rim lighting
             float rim = pow(1.0 - ndotv, 2.7);
             gl_FragColor.rgb += vec3(1.0, 0.84, 0.66) * rim * 0.22;

             // Soft mochi subsurface scatter + stretch glow boost
             float wrap = clamp((dot(N, normalize(vec3(0.3, 0.45, 0.85))) + 0.65) / 1.65, 0.0, 1.0);
             float sss = pow(1.0 - ndotv, 1.7) * (0.45 + 0.55 * wrap);
             float sssTotal = uSssBase + uStretchBoost * 0.18;
             gl_FragColor.rgb += vec3(1.0, 0.64, 0.42) * sss * sssTotal;`
          );
      };

      return mat;
    }

    const mochiGroup = new THREE.Group();
    scene.add(mochiGroup);

    const bodyGeo = buildMochiGeometry();
    const baseBodyPos = new Float32Array(bodyGeo.getAttribute('position').array);
    const bodyMat = createMochiMaterial({
      name: 'MochiCream',
      color: 0xfff0e4,
      roughness: 0.38,
      exprMix: 0.9,
      sssBase: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    mochiGroup.add(bodyMesh);

    // Cute little mochi ear nubs
    const earGeo = new THREE.ConeGeometry(0.085, 0.16, 20);
    const earMat = createMochiMaterial({
      name: 'MochiEar',
      color: 0xffd2c2,
      roughness: 0.44,
      exprMix: 0.0,
      sssBase: 0.28,
    });
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.22, 0.31, 0.0);
    earL.rotation.z = 0.32;
    mochiGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.22, 0.31, 0.0);
    earR.rotation.z = -0.32;
    mochiGroup.add(earR);

    const hitMeshes = [bodyMesh, earL, earR];
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    let grab = null; // { startX, startY, pullX, pullY }
    let dragPeakStretch = 0;
    let funnyTimer = 0;
    let funnyDir = 1;
    let pokeTimer = 0;
    let rippleAmp = 0;
    let annoyedAmount = 0;
    let sleepyAmount = 0;
    let isHoveringMochi = false;
    let timeSinceMove = CURSOR_IDLE_DELAY;

    // Volume-preserving spring state
    const spring = {
      stretchY: 0,
      stretchYV: 0,
      pullX: 0,
      pullXV: 0,
      pullY: 0,
      pullYV: 0,
      tiltZ: 0,
      tiltZV: 0,
    };

    function updateHover(clientX, clientY) {
      pointerNdc.x = (clientX / window.innerWidth) * 2 - 1;
      pointerNdc.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        isHoveringMochi = true;
        shaderUniforms.uHoverPos.value.copy(hits[0].point);
      } else {
        isHoveringMochi = false;
      }
    }

    function triggerFunnyRebound(dir = 1) {
      if (funnyTimer > 0.15) return;
      funnyTimer = DIZZY_DURATION;
      funnyDir = dir >= 0 ? 1 : -1;
      spring.stretchYV += 4.5;
    }

    function triggerPoke() {
      pokeTimer = 0.35;
      spring.stretchYV -= 3.2;
      spring.tiltZV += (Math.random() > 0.5 ? 1 : -1) * 2.2;
    }

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      timeSinceMove = 0;
      updateHover(e.clientX, e.clientY);
      if (isHoveringMochi && !grab) {
        rippleAmp = Math.min(1.0, rippleAmp + 0.24);
      }
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      updateHover(e.clientX, e.clientY);
      if (!isHoveringMochi) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      grab = { startX: nx, startY: ny, pullX: 0, pullY: 0 };
      dragPeakStretch = 0;
      timeSinceMove = 0;
    };

    const onPointerUp = () => {
      if (!grab) return;
      const pullMag = Math.hypot(grab.pullX, grab.pullY);
      const dir = grab.pullX || mouse.x;
      grab = null;
      // Funny face only after dragging to stretch and releasing
      if (Math.max(dragPeakStretch, pullMag) > 0.12) {
        triggerFunnyRebound(dir);
      } else if (pullMag <= 0.03) {
        triggerPoke();
      }
      dragPeakStretch = 0;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animFrameId = null;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.max(0.001, Math.min(0.05, clock.getDelta()));
      const now = clock.getElapsedTime();

      timeSinceMove += dt;
      const isTracking = timeSinceMove < CURSOR_IDLE_DELAY;

      smoothMouse.x = THREE.MathUtils.damp(smoothMouse.x, mouse.x, 12, dt);
      smoothMouse.y = THREE.MathUtils.damp(smoothMouse.y, mouse.y, 12, dt);

      if (grab) {
        const nx = (mouse.x + 1) * 0.5;
        const ny = (-mouse.y + 1) * 0.5;
        const sx = (grab.startX + 1) * 0.5;
        const sy = (-grab.startY + 1) * 0.5;
        const dx = nx - sx;
        const dy = ny - sy;
        const len = Math.hypot(dx, dy);
        const maxPull = 0.42;
        const eased = len > 0 ? (maxPull * Math.tanh(len / maxPull)) / len : 0;
        grab.pullX = dx * eased;
        grab.pullY = dy * eased;
        dragPeakStretch = Math.max(dragPeakStretch, Math.hypot(grab.pullX, grab.pullY));
      }

      let funnyWave = 0;
      if (funnyTimer > 0) {
        funnyTimer = Math.max(0, funnyTimer - dt);
        funnyWave = Math.sin((funnyTimer / DIZZY_DURATION) * Math.PI);
      }

      if (pokeTimer > 0) {
        pokeTimer = Math.max(0, pokeTimer - dt);
      }
      const pokeWave = pokeTimer > 0 ? Math.sin((pokeTimer / 0.35) * Math.PI) : 0;

      rippleAmp = THREE.MathUtils.damp(rippleAmp, 0, 2.8, dt);
      const activeHoverFlag = isHoveringMochi && !grab ? 1.0 : 0.0;

      const targetAnnoyed =
        activeHoverFlag > 0 && rippleAmp > 0.08 && funnyWave <= 0.05
          ? Math.min(1, rippleAmp * 1.35)
          : 0;
      annoyedAmount = THREE.MathUtils.damp(annoyedAmount, targetAnnoyed, 9, dt);

      const targetSleepy =
        !isTracking && funnyWave <= 0.05 && annoyedAmount <= 0.05 ? 1.0 : 0.0;
      sleepyAmount = THREE.MathUtils.damp(sleepyAmount, targetSleepy, 4.5, dt);

      exprSheet.renderSheet({
        annoyed: annoyedAmount,
        dizzy: funnyWave,
        poke: pokeWave,
        sleepy: sleepyAmount,
        time: now,
      });

      // Spring physics for squash/stretch & pull
      const targetPullX = grab ? grab.pullX * 0.75 : (isTracking ? smoothMouse.x * 0.06 : 0);
      const targetPullY = grab ? -grab.pullY * 0.75 : Math.sin(now * 2.2) * 0.015 * sleepyAmount;
      const pullMag = Math.hypot(targetPullX, targetPullY);
      const targetStretchY =
        grab
          ? pullMag * 0.85
          : funnyWave * 0.24 - pokeWave * 0.22 + Math.sin(now * 2.2) * 0.03 * sleepyAmount;
      const targetTiltZ =
        (grab ? -grab.pullX * 0.65 : isTracking ? -smoothMouse.x * 0.14 : 0) +
        funnyWave * 0.22 * funnyDir;

      const k = 110;
      const damp = 14;
      spring.pullXV += (k * (targetPullX - spring.pullX) - damp * spring.pullXV) * dt;
      spring.pullX += spring.pullXV * dt;
      spring.pullYV += (k * (targetPullY - spring.pullY) - damp * spring.pullYV) * dt;
      spring.pullY += spring.pullYV * dt;
      spring.stretchYV += (k * (targetStretchY - spring.stretchY) - damp * spring.stretchYV) * dt;
      spring.stretchY += spring.stretchYV * dt;
      spring.tiltZV += (k * (targetTiltZ - spring.tiltZ) - damp * spring.tiltZV) * dt;
      spring.tiltZ += spring.tiltZV * dt;

      // Volume-preserving scale: scaleY * scaleXZ^2 = 1 => scaleXZ = 1 / sqrt(scaleY)
      const scaleY = THREE.MathUtils.clamp(1.0 + spring.stretchY, 0.68, 1.45);
      const scaleXZ = 1.0 / Math.sqrt(scaleY);

      mochiGroup.position.set(spring.pullX, spring.pullY, 0);
      mochiGroup.rotation.set(
        isTracking ? -smoothMouse.y * 0.18 : 0.06 * sleepyAmount,
        isTracking ? smoothMouse.x * 0.26 : 0,
        spring.tiltZ
      );
      mochiGroup.scale.set(scaleXZ, scaleY, scaleXZ);

      // Ear twitches on poke, dizzy, or idle sniff
      const earTwitch =
        Math.sin(now * 24) * 0.14 * funnyWave +
        Math.sin(now * 18) * 0.12 * pokeWave;
      earL.rotation.z = 0.32 + earTwitch + sleepyAmount * 0.14;
      earR.rotation.z = -0.32 - earTwitch - sleepyAmount * 0.14;

      // Localized vertex pull deformation on the mochi body
      const posAttr = bodyGeo.getAttribute('position');
      const arr = posAttr.array;
      const pullWorldX = grab ? grab.pullX * 0.55 : 0;
      const pullWorldY = grab ? -grab.pullY * 0.55 : 0;

      for (let i = 0; i < arr.length; i += 3) {
        const bx = baseBodyPos[i];
        const by = baseBodyPos[i + 1];
        const bz = baseBodyPos[i + 2];

        const frontBias = THREE.MathUtils.clamp((bz + 0.25) / 0.65, 0, 1);
        const w = frontBias * frontBias;

        arr[i] = bx + pullWorldX * w;
        arr[i + 1] = by + pullWorldY * w;
        arr[i + 2] = bz + Math.hypot(pullWorldX, pullWorldY) * 0.18 * w;
      }
      posAttr.needsUpdate = true;
      bodyGeo.computeVertexNormals();

      shaderUniforms.uTime.value = now;
      shaderUniforms.uHoverActive.value = activeHoverFlag;
      shaderUniforms.uRippleAmp.value = rippleAmp;
      shaderUniforms.uStretchBoost.value = Math.min(1, Math.abs(spring.stretchY) * 2.2);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      exprSheet.texture.dispose();
      bodyGeo.dispose();
      earGeo.dispose();
      bodyMat.dispose();
      earMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return null;
};

export default MochiMascot;