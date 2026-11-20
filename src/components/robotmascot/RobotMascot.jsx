import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const CURSOR_IDLE_DELAY = 2.2;
const DIZZY_DURATION = 0.95;
const CAPTION_GRACE_DELAY = 0.18;

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

function createBrushedMetalTextures() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#525252';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1800; i++) {
    const y = Math.random() * canvas.height;
    const x = Math.random() * canvas.width;
    const len = 35 + Math.random() * 140;
    const shade = 55 + Math.floor(Math.random() * 65);
    ctx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, 0.22)`;
    ctx.lineWidth = 0.7 + Math.random() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 1.5);
    ctx.stroke();
  }

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const v = Math.random() > 0.5 ? 165 : 35;
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.14)`;
    ctx.fillRect(x, y, 2 + Math.random() * 4, 1);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.NoColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.needsUpdate = true;

  return map;
}

function createVisorExpressionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let lastKey = '';
  let activeCaption = '';
  let pendingCaption = '';
  let captionGraceTimer = 0;
  let typedChars = 0;

  function drawEyes({ w, h, annoyed, dizzy, poke, sleepy, phase }) {
    const leftEye = [w * 0.33, h * 0.4];
    const rightEye = [w * 0.67, h * 0.4];

    ctx.save();
    ctx.lineCap = 'round';

    if (dizzy > 0.05) {
      ctx.globalAlpha = Math.min(1, dizzy * 1.2);
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 6.5;
      const r = 15;
      [leftEye, rightEye].forEach(([ex, ey], idx) => {
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate((idx === 0 ? 1 : -1) * phase * 0.22);
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
        const sy = h * 0.16 + Math.sin(ang) * h * 0.06;
        ctx.save();
        ctx.fillStyle = '#ffd43b';
        drawStarPath(ctx, sx, sy, 5, 10 * dizzy, 4.2 * dizzy);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    if (sleepy > 0.12 && annoyed <= 0.05) {
      ctx.globalAlpha = Math.min(1, sleepy * 1.15);
      ctx.strokeStyle = '#74c0fc';
      ctx.lineWidth = 6;
      const halfW = 16;
      const sag = 7 * sleepy;
      [leftEye, rightEye].forEach(([ex, ey]) => {
        ctx.beginPath();
        ctx.moveTo(ex - halfW, ey - 2);
        ctx.quadraticCurveTo(ex, ey + sag, ex + halfW, ey - 2);
        ctx.stroke();
      });
      ctx.restore();
      return;
    }

    const squint = annoyed > 0.05 ? annoyed * 0.45 : poke > 0.05 ? poke * 0.55 : 0;
    const eyeRx = 13;
    const eyeRy = Math.max(4, 14 * (1 - squint));
    const eyeColor = annoyed > 0.08 ? '#ff8787' : '#63e6be';

    ctx.fillStyle = eyeColor;
    [leftEye, rightEye].forEach(([ex, ey]) => {
      ctx.save();
      ctx.translate(ex, ey);
      ctx.beginPath();
      ctx.roundRect(-eyeRx, -eyeRy, eyeRx * 2, eyeRy * 2, 6);
      ctx.fill();

      if (eyeRy > 7) {
        ctx.fillStyle = '#e6fcf5';
        ctx.beginPath();
        ctx.arc(-4, -4, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeColor;
      }
      ctx.restore();
    });

    if (annoyed > 0.06) {
      ctx.globalAlpha = Math.min(1, annoyed * 1.2);
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 6;

      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 0.2 - 5 * annoyed);
      ctx.lineTo(w * 0.42, h * 0.27 + 9 * annoyed);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 0.2 - 5 * annoyed);
      ctx.lineTo(w * 0.58, h * 0.27 + 9 * annoyed);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMouth({ w, h, annoyed, dizzy, poke, sleepy, phase }) {
    const mx = w * 0.5;
    const my = h * 0.62;
    const mouthW = w * 0.14;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (dizzy > 0.05) {
      ctx.globalAlpha = Math.min(1, dizzy * 1.2);
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 5.5;
      const waveAmp = (4.5 + Math.sin(phase * 1.4) * 2.5) * dizzy;
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
      ctx.strokeStyle = '#ff8787';
      ctx.lineWidth = 5.5;
      const drop = 7 * g;

      ctx.beginPath();
      ctx.moveTo(mx - mouthW * 0.42, my + drop * 0.5);
      ctx.quadraticCurveTo(mx, my - 2.5 * g, mx + mouthW * 0.42, my + drop * 0.5);
      ctx.stroke();
      ctx.restore();
      return;
    }

    if (sleepy > 0.15) {
      const s = Math.min(1, sleepy);
      ctx.globalAlpha = 0.75 * s;
      ctx.strokeStyle = '#74c0fc';
      ctx.lineWidth = 4.8;
      ctx.beginPath();
      ctx.moveTo(mx - mouthW * 0.32, my);
      ctx.quadraticCurveTo(mx, my + 2.5 * s, mx + mouthW * 0.32, my);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const bounce = poke > 0.05 ? Math.sin(phase * 1.2) * 2.5 * poke : 0;
    ctx.strokeStyle = '#63e6be';
    ctx.lineWidth = 5.5;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(mx - mouthW * 0.42, my - 2 - bounce * 0.4);
    ctx.quadraticCurveTo(mx, my + 6.5 + poke * 3.5 + bounce, mx + mouthW * 0.42, my - 2 - bounce * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  function getTargetCaption({ annoyed, dizzy, poke, sleepy, tracking }) {
    if (dizzy > 0.12) return 'WOOAAH... REBOUNDING!';
    if (poke > 0.12) return 'BOOP! SERVOS READY';
    if (annoyed > 0.14) return 'HEY! EASY ON THE SHELL';
    if (sleepy > 0.25) return 'ZZZ... LOW POWER MODE';
    if (tracking) return 'HELLO HUMAN :)';
    return 'BOOT OK // WAITING';
  }

  function drawTypewriterCaption({ w, h, caption, charCount, blinkOn, annoyed, dizzy, sleepy }) {
    const visibleText = caption.slice(0, charCount);
    const cursorChar = blinkOn ? '_' : ' ';

    let textColor = '#63e6be';
    if (dizzy > 0.12) textColor = '#ffd43b';
    else if (annoyed > 0.14) textColor = '#ff8787';
    else if (sleepy > 0.25) textColor = '#74c0fc';

    ctx.save();
    ctx.font = 'bold 20px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(`${visibleText}${cursorChar}`, w * 0.5, h * 0.84);
    ctx.restore();
  }

  function renderVisor({ annoyed, dizzy, poke, sleepy = 0, tracking = false, time, dt = 0.016 }) {
    const candidateCaption = getTargetCaption({ annoyed, dizzy, poke, sleepy, tracking });

    if (!activeCaption) {
      activeCaption = candidateCaption;
      pendingCaption = candidateCaption;
      captionGraceTimer = 0;
      typedChars = 0;
    } else if (candidateCaption === activeCaption) {
      pendingCaption = activeCaption;
      captionGraceTimer = 0;
    } else if (candidateCaption !== pendingCaption) {
      pendingCaption = candidateCaption;
      captionGraceTimer = 0;
    } else {
      captionGraceTimer += dt;
      if (captionGraceTimer >= CAPTION_GRACE_DELAY) {
        activeCaption = pendingCaption;
        captionGraceTimer = 0;
        typedChars = 0;
      }
    }

    if (typedChars < activeCaption.length) {
      typedChars = Math.min(activeCaption.length, typedChars + dt * 24);
    }

    const shownCount = Math.floor(typedChars);
    const blinkOn = Math.floor(time * 3.2) % 2 === 0;

    const qAnnoyed = Math.round(annoyed * 20) / 20;
    const qDizzy = Math.round(dizzy * 20) / 20;
    const qPoke = Math.round(poke * 20) / 20;
    const qSleepy = Math.round(sleepy * 20) / 20;
    const needsMotion = qDizzy > 0.05 || qPoke > 0.05;
    const qPhase = needsMotion ? Math.floor(time * 10) : 0;

    const key = `${qAnnoyed}|${qDizzy}|${qPoke}|${qSleepy}|${qPhase}|${activeCaption}|${shownCount}|${blinkOn ? 1 : 0}`;
    if (key === lastKey) return;
    lastKey = key;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#141824';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(130, 177, 255, 0.16)';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    const blushAlpha = Math.min(0.65, 0.2 + qPoke * 0.4 + qDizzy * 0.25 + qSleepy * 0.15);
    ctx.save();
    ctx.globalAlpha = blushAlpha;
    ctx.fillStyle = '#ff7875';
    ctx.beginPath();
    ctx.ellipse(w * 0.22, h * 0.55, w * 0.06, h * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.78, h * 0.55, w * 0.06, h * 0.06, 0, 0, Math.PI * 2);
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

    drawTypewriterCaption({
      w,
      h,
      caption: activeCaption,
      charCount: shownCount,
      blinkOn,
      annoyed: qAnnoyed,
      dizzy: qDizzy,
      sleepy: qSleepy,
    });

    texture.needsUpdate = true;
  }

  return { texture, renderVisor };
}

function buildRetroBodyGeometry() {
  const geo = new THREE.BoxGeometry(0.76, 0.66, 0.62, 28, 24, 22);
  const pos = geo.getAttribute('position');
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = v.x / 0.38;
    const ny = v.y / 0.33;
    const nz = v.z / 0.31;
    const radial = Math.min(1, Math.hypot(nx * 0.45, ny * 0.45, nz * 0.45));
    const roundFactor = 0.24 * radial;

    v.x *= 1.0 - roundFactor;
    v.y *= 1.0 - roundFactor * 0.85;
    v.z *= 1.0 - roundFactor;
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

const RobotMascot = ({ positionX = 0, className = 'w-full h-screen' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getSize = () => ({
      w: container.clientWidth || window.innerWidth,
      h: container.clientHeight || window.innerHeight,
    });

    const { w: initW, h: initH } = getSize();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, initW / initH, 0.1, 100);
    camera.position.set(0, 0.06, 2.35);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.65;

    const metalBrushTex = createBrushedMetalTextures();
    const visorSheet = createVisorExpressionTexture();

    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const keyLight = new THREE.DirectionalLight(0xfff6eb, 2.1);
    keyLight.position.set(2.2, 3.8, 4.0);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
    fillLight.position.set(-2.6, 1.4, 2.2);
    scene.add(fillLight);

    const shaderUniforms = {
      uTime: { value: 0 },
      uHoverPos: { value: new THREE.Vector3(0, 0.04, 0.32) },
      uHoverActive: { value: 0 },
      uRippleAmp: { value: 0 },
      uStretchBoost: { value: 0 },
    };

    let annoyedHoldTimer = 0;

    function createToyShellMaterial({
      name,
      color,
      roughness = 1.0,
      metalness = 0.78,
      roughnessMap = null,
      bumpMap = null,
      bumpScale = 0.004,
      sssBase = 0.04,
    }) {
      const mat = new THREE.MeshStandardMaterial({
        name,
        color,
        roughness,
        metalness,
        roughnessMap,
        bumpMap,
        bumpScale,
        envMapIntensity: 0.9,
      });

      mat.customProgramCacheKey = () => `retro-robot-${name}`;

      mat.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.uTime;
        shader.uniforms.uHoverPos = shaderUniforms.uHoverPos;
        shader.uniforms.uHoverActive = shaderUniforms.uHoverActive;
        shader.uniforms.uRippleAmp = shaderUniforms.uRippleAmp;
        shader.uniforms.uStretchBoost = shaderUniforms.uStretchBoost;
        shader.uniforms.uSssBase = { value: sssBase };

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec2 vShellUv;
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
             vShellUv = uv;
             float rDist = distance(transformed, uHoverPos);
             float localMask = smoothstep(0.28, 0.015, rDist) * (uHoverActive * uRippleAmp);
             float ring = sin(rDist * 38.0 - uTime * 12.5) * exp(-rDist * 8.5);
             transformed += normal * ring * 0.028 * localMask;`
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
             varying vec2 vShellUv;
             varying vec3 vWorldNormal;
             varying vec3 vWorldPos;
             uniform float uSssBase;
             uniform float uStretchBoost;

             float shellHash(vec2 p) {
               return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
             }

             float shellNoise(vec2 p) {
               vec2 i = floor(p);
               vec2 f = fract(p);
               vec2 u = f * f * (3.0 - 2.0 * f);
               float a = shellHash(i);
               float b = shellHash(i + vec2(1.0, 0.0));
               float c = shellHash(i + vec2(0.0, 1.0));
               float d = shellHash(i + vec2(1.0, 1.0));
               return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
             }`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             float grain = shellNoise(vShellUv * 140.0) - 0.5;
             gl_FragColor.rgb *= (1.0 + grain * 0.05);

             vec3 N = normalize(vWorldNormal);
             vec3 V = normalize(cameraPosition - vWorldPos);
             float ndotv = clamp(dot(N, V), 0.0, 1.0);

             float rim = pow(1.0 - ndotv, 2.8);
             gl_FragColor.rgb += vec3(1.0, 0.85, 0.68) * rim * 0.22;

             float wrap = clamp((dot(N, normalize(vec3(0.3, 0.45, 0.85))) + 0.65) / 1.65, 0.0, 1.0);
             float sss = pow(1.0 - ndotv, 1.8) * (0.45 + 0.55 * wrap);
             float sssTotal = uSssBase + uStretchBoost * 0.14;
             gl_FragColor.rgb += vec3(1.0, 0.68, 0.45) * sss * sssTotal;`
          );
      };

      return mat;
    }

    const robotGroup = new THREE.Group();
    robotGroup.position.x = positionX;
    scene.add(robotGroup);

    const bodyGeo = buildRetroBodyGeometry();
    const baseBodyPos = new Float32Array(bodyGeo.getAttribute('position').array);
    const shellMat = createToyShellMaterial({
      name: 'ToyBrushedSteel',
      color: 0xe6ecf5,
      roughness: 1.0,
      metalness: 0.82,
      roughnessMap: metalBrushTex,
      bumpMap: metalBrushTex,
      bumpScale: 0.0035,
      sssBase: 0.04,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, shellMat);
    robotGroup.add(bodyMesh);

    const visorGeo = new THREE.PlaneGeometry(0.56, 0.28);
    const visorMat = new THREE.MeshBasicMaterial({
      map: visorSheet.texture,
      toneMapped: false,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.03, 0.295);
    robotGroup.add(visorMesh);

    const capGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 20);
    capGeo.rotateZ(Math.PI / 2);
    const capMat = createToyShellMaterial({
      name: 'ToyAnodizedCoral',
      color: 0xff7b66,
      roughness: 1.0,
      metalness: 0.72,
      roughnessMap: metalBrushTex,
      bumpMap: metalBrushTex,
      bumpScale: 0.003,
      sssBase: 0.05,
    });
    const capL = new THREE.Mesh(capGeo, capMat);
    capL.position.set(-0.39, 0.02, 0);
    robotGroup.add(capL);

    const capR = new THREE.Mesh(capGeo, capMat);
    capR.position.set(0.39, 0.02, 0);
    robotGroup.add(capR);

    const antennaPivot = new THREE.Group();
    antennaPivot.position.set(0, 0.31, 0);
    robotGroup.add(antennaPivot);

    const stalkGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.22, 12);
    const stalkMat = createToyShellMaterial({
      name: 'ToyMetalStalk',
      color: 0xcbd5e1,
      roughness: 0.28,
      sssBase: 0.05,
    });
    const stalkMesh = new THREE.Mesh(stalkGeo, stalkMat);
    stalkMesh.position.set(0, 0.11, 0);
    antennaPivot.add(stalkMesh);

    const bulbGeo = new THREE.SphereGeometry(0.052, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xff9f43,
      emissive: 0xff7b29,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    });
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.set(0, 0.23, 0);
    antennaPivot.add(bulbMesh);

    const antennaLight = new THREE.PointLight(0xff7b29, 0.45, 2.2, 2);
    antennaLight.position.set(0, 0.04, 0.06);
    bulbMesh.add(antennaLight);

    const baseBulbColor = new THREE.Color(0xff9f43);
    const baseBulbEmissive = new THREE.Color(0xff7b29);
    const annoyedBulbColor = new THREE.Color(0xff6b6b);
    const annoyedBulbEmissive = new THREE.Color(0xe03131);
    const dizzyBulbColorA = new THREE.Color(0xffd43b);
    const dizzyBulbColorB = new THREE.Color(0xf783ac);
    const pokeBulbColor = new THREE.Color(0x63e6be);
    const pokeBulbEmissive = new THREE.Color(0x20c997);
    const sleepyBulbColor = new THREE.Color(0x74c0fc);
    const sleepyBulbEmissive = new THREE.Color(0x4dabf7);
    const targetBulbColor = new THREE.Color();
    const targetBulbEmissive = new THREE.Color();
    const dizzyMixColor = new THREE.Color();

    const hitMeshes = [bodyMesh, visorMesh, capL, capR, bulbMesh];
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    let grab = null;
    let dragPeakStretch = 0;
    let funnyTimer = 0;
    let funnyDir = 1;
    let pokeTimer = 0;
    let rippleAmp = 0;
    let annoyedAmount = 0;
    let sleepyAmount = 0;
    let isHoveringRobot = false;
    let timeSinceMove = CURSOR_IDLE_DELAY;

    const spring = {
      stretchY: 0,
      stretchYV: 0,
      pullX: 0,
      pullXV: 0,
      pullY: 0,
      pullYV: 0,
      tiltZ: 0,
      tiltZV: 0,
      antTiltZ: 0,
      antTiltZV: 0,
    };

    function updateHover(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        isHoveringRobot = true;
        shaderUniforms.uHoverPos.value.copy(hits[0].point);
      } else {
        isHoveringRobot = false;
      }
    }

    function triggerFunnyRebound(dir = 1) {
      if (funnyTimer > 0.15) return;
      funnyTimer = DIZZY_DURATION;
      funnyDir = dir >= 0 ? 1 : -1;
      spring.stretchYV += 4.2;
      spring.antTiltZV += (dir >= 0 ? 1 : -1) * 9.5;
    }

    function triggerPoke() {
      pokeTimer = 0.35;
      spring.stretchYV -= 3.0;
      spring.tiltZV += (Math.random() > 0.5 ? 1 : -1) * 2.0;
      spring.antTiltZV += (Math.random() > 0.5 ? 1 : -1) * 6.0;
    }

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
      timeSinceMove = 0;
      updateHover(e.clientX, e.clientY);
      if (isHoveringRobot && !grab) {
        rippleAmp = Math.min(1.0, rippleAmp + 0.24);
      }
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      updateHover(e.clientX, e.clientY);
      if (!isHoveringRobot) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      grab = { startX: nx, startY: ny, pullX: 0, pullY: 0 };
      dragPeakStretch = 0;
      timeSinceMove = 0;
    };

    const onPointerUp = () => {
      if (!grab) return;
      const pullMag = Math.hypot(grab.pullX, grab.pullY);
      const dir = grab.pullX || mouse.x;
      grab = null;
      if (Math.max(dragPeakStretch, pullMag) > 0.12) {
        triggerFunnyRebound(dir);
      } else if (pullMag <= 0.03) {
        triggerPoke();
      }
      dragPeakStretch = 0;
    };

    const onResize = () => {
      const { w, h } = getSize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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

      rippleAmp = THREE.MathUtils.damp(rippleAmp, 0, 1.1, dt);
      const activeHoverFlag = isHoveringRobot && !grab ? 1.0 : 0.0;

      if (activeHoverFlag > 0 && rippleAmp > 0.14 && funnyWave <= 0.05) {
        annoyedHoldTimer = Math.max(annoyedHoldTimer, 1.6);
      } else if (annoyedHoldTimer > 0) {
        annoyedHoldTimer = Math.max(0, annoyedHoldTimer - dt);
      }

      const holdFactor = Math.min(1, annoyedHoldTimer / 0.6);
      const rippleFactor =
        activeHoverFlag > 0 && funnyWave <= 0.05
          ? Math.min(1, rippleAmp * 1.45)
          : 0;

      const targetAnnoyed =
        funnyWave > 0.05 ? 0 : Math.max(rippleFactor, holdFactor * 0.85);

      annoyedAmount = THREE.MathUtils.damp(annoyedAmount, targetAnnoyed, 3.2, dt);

      const targetSleepy =
        !isTracking && funnyWave <= 0.05 && annoyedAmount <= 0.05 ? 1.0 : 0.0;
      sleepyAmount = THREE.MathUtils.damp(sleepyAmount, targetSleepy, 4.5, dt);

      visorSheet.renderVisor({
        annoyed: annoyedAmount,
        dizzy: funnyWave,
        poke: pokeWave,
        sleepy: sleepyAmount,
        tracking: isTracking,
        time: now,
        dt,
      });

      targetBulbColor.copy(baseBulbColor);
      targetBulbEmissive.copy(baseBulbEmissive);
      let targetIntensity = 0.55;

      if (sleepyAmount > 0.05) {
        const breath = 0.5 + 0.5 * Math.sin(now * 2.2);
        targetBulbColor.lerp(sleepyBulbColor, sleepyAmount);
        targetBulbEmissive.lerp(sleepyBulbEmissive, sleepyAmount);
        targetIntensity = THREE.MathUtils.lerp(
          targetIntensity,
          0.22 + breath * 0.16,
          sleepyAmount
        );
      }

      if (annoyedAmount > 0.05) {
        const pulse = 0.5 + 0.5 * Math.sin(now * 14);
        targetBulbColor.lerp(annoyedBulbColor, annoyedAmount);
        targetBulbEmissive.lerp(annoyedBulbEmissive, annoyedAmount);
        targetIntensity = THREE.MathUtils.lerp(
          targetIntensity,
          0.85 + pulse * 0.3,
          annoyedAmount
        );
      }

      if (pokeWave > 0.02) {
        targetBulbColor.lerp(pokeBulbColor, pokeWave);
        targetBulbEmissive.lerp(pokeBulbEmissive, pokeWave);
        targetIntensity = THREE.MathUtils.lerp(targetIntensity, 1.35, pokeWave);
      }

      if (funnyWave > 0.02) {
        const cycleT = 0.5 + 0.5 * Math.sin(now * 18);
        dizzyMixColor.copy(dizzyBulbColorA).lerp(dizzyBulbColorB, cycleT);
        targetBulbColor.lerp(dizzyMixColor, funnyWave);
        targetBulbEmissive.lerp(dizzyMixColor, funnyWave);
        targetIntensity = THREE.MathUtils.lerp(
          targetIntensity,
          0.95 + cycleT * 0.5,
          funnyWave
        );
      }

      bulbMat.color.lerp(targetBulbColor, 1 - Math.exp(-12 * dt));
      bulbMat.emissive.lerp(targetBulbEmissive, 1 - Math.exp(-12 * dt));
      bulbMat.emissiveIntensity = THREE.MathUtils.damp(
        bulbMat.emissiveIntensity,
        targetIntensity,
        12,
        dt
      );

      antennaLight.color.copy(bulbMat.emissive);
      antennaLight.intensity = bulbMat.emissiveIntensity * 0.65;

      const targetPullX = grab ? grab.pullX * 0.72 : (isTracking ? smoothMouse.x * 0.06 : 0);
      const targetPullY = grab ? -grab.pullY * 0.72 : Math.sin(now * 2.2) * 0.012 * sleepyAmount;
      const pullMag = Math.hypot(targetPullX, targetPullY);
      const targetStretchY =
        grab
          ? pullMag * 0.75
          : funnyWave * 0.2 - pokeWave * 0.18 + Math.sin(now * 2.2) * 0.025 * sleepyAmount;
      const targetTiltZ =
        (grab ? -grab.pullX * 0.55 : isTracking ? -smoothMouse.x * 0.12 : 0) +
        funnyWave * 0.2 * funnyDir;

      const k = 115;
      const damp = 14;
      spring.pullXV += (k * (targetPullX - spring.pullX) - damp * spring.pullXV) * dt;
      spring.pullX += spring.pullXV * dt;
      spring.pullYV += (k * (targetPullY - spring.pullY) - damp * spring.pullYV) * dt;
      spring.pullY += spring.pullYV * dt;
      spring.stretchYV += (k * (targetStretchY - spring.stretchY) - damp * spring.stretchYV) * dt;
      spring.stretchY += spring.stretchYV * dt;
      spring.tiltZV += (k * (targetTiltZ - spring.tiltZ) - damp * spring.tiltZV) * dt;
      spring.tiltZ += spring.tiltZV * dt;

      const antTarget = -spring.tiltZ * 1.4 - spring.pullX * 1.1;
      const antK = 90;
      const antDamp = 8.5;
      spring.antTiltZV += (antK * (antTarget - spring.antTiltZ) - antDamp * spring.antTiltZV) * dt;
      spring.antTiltZ += spring.antTiltZV * dt;
      antennaPivot.rotation.z = spring.antTiltZ;
      antennaPivot.rotation.x = isTracking ? -smoothMouse.y * 0.15 : 0.12 * sleepyAmount;

      const scaleY = THREE.MathUtils.clamp(1.0 + spring.stretchY, 0.72, 1.38);
      const scaleXZ = 1.0 / Math.sqrt(scaleY);

      robotGroup.position.set(positionX + spring.pullX, spring.pullY, 0);
      robotGroup.rotation.set(
        isTracking ? -smoothMouse.y * 0.18 : 0.06 * sleepyAmount,
        isTracking ? smoothMouse.x * 0.24 : 0,
        spring.tiltZ
      );
      robotGroup.scale.set(scaleXZ, scaleY, scaleXZ);

      const posAttr = bodyGeo.getAttribute('position');
      const arr = posAttr.array;
      const pullWorldX = grab ? grab.pullX * 0.45 : 0;
      const pullWorldY = grab ? -grab.pullY * 0.45 : 0;

      for (let i = 0; i < arr.length; i += 3) {
        const bx = baseBodyPos[i];
        const by = baseBodyPos[i + 1];
        const bz = baseBodyPos[i + 2];

        const frontBias = THREE.MathUtils.clamp((bz + 0.2) / 0.55, 0, 1);
        const w = frontBias * frontBias;

        arr[i] = bx + pullWorldX * w;
        arr[i + 1] = by + pullWorldY * w;
        arr[i + 2] = bz + Math.hypot(pullWorldX, pullWorldY) * 0.14 * w;
      }
      posAttr.needsUpdate = true;
      bodyGeo.computeVertexNormals();

      shaderUniforms.uTime.value = now;
      shaderUniforms.uHoverActive.value = activeHoverFlag;
      shaderUniforms.uRippleAmp.value = rippleAmp;
      shaderUniforms.uStretchBoost.value = Math.min(1, Math.abs(spring.stretchY) * 2.0);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      visorSheet.texture.dispose();
      bodyGeo.dispose();
      visorGeo.dispose();
      capGeo.dispose();
      stalkGeo.dispose();
      bulbGeo.dispose();
      shellMat.dispose();
      visorMat.dispose();
      capMat.dispose();
      stalkMat.dispose();
      bulbMat.dispose();
      metalBrushTex.dispose();
      envTex.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [positionX]);

  return <div ref={containerRef} className={className} />;
};

export default RobotMascot;