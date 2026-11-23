import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

function createBrushedMetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1800; i++) {
    const y = Math.random() * canvas.height;
    const x = Math.random() * canvas.width;
    const len = 40 + Math.random() * 140;
    const shade = 38 + Math.floor(Math.random() * 52);
    ctx.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, 0.22)`;
    ctx.lineWidth = 0.7 + Math.random() * 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 1.4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.03, 0.03);
  tex.needsUpdate = true;
  return tex;
}

function createFrostedGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgb(76, 76, 76)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 32;
    const val = Math.max(36, Math.min(125, 76 + grain));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  for (let i = 0; i < 160; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 20 + Math.random() * 60;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, 'rgba(145, 145, 145, 0.16)');
    grad.addColorStop(1, 'rgba(76, 76, 76, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(0.025, 0.025);
  tex.needsUpdate = true;
  return tex;
}

const SAGMETIC_LOGO_SVG = `
<svg width="270" height="220" viewBox="0 0 270 220" xmlns="http://www.w3.org/2000/svg">
  <path d="M216.503 48.1351C225.747 35.4787 237.009 36.5951 237.076 36.6019C274.174 69.3195 235.479 121.111 235.479 121.111C183.412 188.109 102.169 203.567 102.169 203.567C123.865 195.315 142.147 185.78 157.213 176.347C156.665 176.69 156.113 177.035 155.556 177.378L111.794 183.596L126.347 152.994L200.805 142.415C209.057 134.321 213.01 129.061 213.01 129.061L212.599 129.589C211.775 130.63 209.705 133.163 206.33 136.768C206.733 132.945 205.523 128.174 197.492 127.052L133.112 136.199C132.973 136.19 104.228 134.163 101.296 109.714C98.4127 85.1939 125.33 72.5043 125.44 72.4524L219.932 58.7248L205.848 90.104L136.511 99.9556C136.489 99.962 132.811 101.033 133.279 104.329C133.739 107.566 138.203 107.777 138.226 107.778L199.892 99.0168C199.892 99.0168 219.688 99.3464 223.798 111.992C222.4 114.59 220.83 117.283 219.075 120.075C253.428 65.4619 216.637 48.1975 216.503 48.1351ZM212.224 35.4162C215.411 34.9634 218.319 37.2008 218.763 40.3274C219.207 43.4552 217.038 46.4138 213.851 46.8666C210.725 47.3104 207.817 45.0734 207.373 41.9458C206.929 38.8193 209.098 35.8605 212.224 35.4162ZM202.44 32.6537C204.683 32.3347 206.772 33.9048 207.09 36.1476C207.409 38.3896 205.84 40.4788 203.597 40.7975C201.355 41.1158 199.266 39.546 198.947 37.3045C198.629 35.0619 200.198 32.9725 202.44 32.6537ZM222.06 26.2549C224.895 25.8521 227.529 27.8836 227.932 30.7174C228.334 33.55 226.362 36.1771 223.527 36.5799C220.637 36.9906 218.007 35.0174 217.604 32.1848C217.202 29.351 219.17 26.6656 222.06 26.2549ZM230.9 29.9949C232.258 29.8015 233.479 30.772 233.672 32.13C233.865 33.4866 232.954 34.6999 231.596 34.8929C230.239 35.0856 228.966 34.1829 228.773 32.8261C228.58 31.4682 229.543 30.1879 230.9 29.9949ZM212.499 27.6114C214.152 27.3762 215.703 28.5412 215.938 30.1943C216.173 31.8469 215.008 33.3981 213.354 33.633C211.704 33.8673 210.213 32.6937 209.978 31.0412C209.743 29.3881 210.848 27.8461 212.499 27.6114ZM194.835 24.0412C197.077 23.7226 199.167 25.2932 199.486 27.535C199.804 29.7773 198.234 31.8664 195.992 32.185C193.75 32.5034 191.661 30.9344 191.342 28.6921C191.023 26.4507 192.593 24.3597 194.835 24.0412ZM204.9 24.5384C206.552 24.3034 208.042 25.476 208.277 27.1293C208.511 28.7817 207.407 30.3234 205.755 30.5581C204.102 30.7928 202.554 29.6281 202.319 27.9758C202.084 26.3229 203.247 24.7734 204.9 24.5384ZM186.573 26.0584C188.225 25.8237 189.715 26.9958 189.95 28.6482C190.127 30.3097 188.963 31.86 187.302 32.0348C185.709 32.2609 184.16 31.0961 183.925 29.4461C183.749 27.7844 184.913 26.2338 186.573 26.0584ZM174.002 27.8445C175.361 27.6518 176.633 28.5545 176.826 29.9122C177.019 31.2694 176.057 32.5506 174.698 32.7435C173.341 32.9361 172.122 31.965 171.929 30.608C171.736 29.2504 172.645 28.0376 174.002 27.8445Z" />
</svg>
`;

const SagmeticLogo3D = ({ className = 'w-full h-full' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getSize = () => ({
      w: container.clientWidth || 380,
      h: container.clientHeight || 380,
    });

    const { w: initW, h: initH } = getSize();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, initW / initH, 0.1, 100);
    camera.position.set(0, 0, 4.1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(initW, initH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.78;

    const metalRoughTex = createBrushedMetalTexture();
    const frostRoughTex = createFrostedGlassTexture();

    scene.add(new THREE.AmbientLight(0xdbeafe, 0.28));
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.35);
    keyLight.position.set(3.2, 4.2, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x94a3b8, 0.95);
    rimLight.position.set(-3.5, -2.0, 2.6);
    scene.add(rimLight);

    const hoverRedLight = new THREE.PointLight(0xdc2e27, 0.0, 9.5, 1.4);
    hoverRedLight.position.set(0, 0, 2.4);
    scene.add(hoverRedLight);

    const shaderUniforms = {
      uTime: { value: 0 },
      uHoverPos: { value: new THREE.Vector3(170, 110, 0) },
      uRippleAmp: { value: 0 },
      uHoverGlow: { value: 0 },
    };

    function applyGlassAndRedRimShader(
      material,
      {
        rippleScale = 1.8,
        baseRimStrength = 0.24,
        redRimBoost = 2.15,
        spotRadius = 96.0,
        alphaScale = 1.0,
        bubbleFloatScale = 1.0,
      } = {}
    ) {
      material.customProgramCacheKey = () =>
        `sagmetic-hero-logo-${material.name}-${rippleScale}-${redRimBoost}`;
      material.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = shaderUniforms.uTime;
        shader.uniforms.uHoverPos = shaderUniforms.uHoverPos;
        shader.uniforms.uRippleAmp = shaderUniforms.uRippleAmp;
        shader.uniforms.uHoverGlow = shaderUniforms.uHoverGlow;
        shader.uniforms.uRippleScale = { value: rippleScale };
        shader.uniforms.uBaseRimStrength = { value: baseRimStrength };
        shader.uniforms.uRedRimBoost = { value: redRimBoost };
        shader.uniforms.uSpotRadius = { value: spotRadius };
        shader.uniforms.uAlphaScale = { value: alphaScale };
        shader.uniforms.uBubbleFloatScale = { value: bubbleFloatScale };

        shader.vertexShader = shader.vertexShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vWorldNorm;
             varying vec3 vWorldP;
             varying vec3 vLocalP;
             varying float vBubbleMask;
             uniform float uTime;
             uniform vec3 uHoverPos;
             uniform float uRippleAmp;
             uniform float uRippleScale;
             uniform float uBubbleFloatScale;`
          )
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             float bubbleY = 1.0 - smoothstep(45.5, 51.5, position.y);
             float bubbleX = smoothstep(166.0, 173.0, position.x);
             float bubbleMask = clamp(bubbleY * bubbleX, 0.0, 1.0);
             vBubbleMask = bubbleMask;
             vLocalP = position;

             float phase = position.x * 0.14 + position.y * 0.22;
             transformed.y += sin(uTime * 2.4 + phase) * 1.45 * bubbleMask * uBubbleFloatScale;
             transformed.z += cos(uTime * 1.9 + phase) * 0.95 * bubbleMask * uBubbleFloatScale;

             float dist = distance(transformed, uHoverPos);
             float mask = smoothstep(55.0, 2.0, dist) * uRippleAmp;
             float wave = sin(dist * 0.35 - uTime * 9.5) * exp(-dist * 0.045);
             transformed += normal * wave * uRippleScale * mask;`
          )
          .replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>
             vec4 wPos = modelMatrix * vec4(transformed, 1.0);
             vWorldP = wPos.xyz;
             vWorldNorm = normalize(mat3(modelMatrix) * objectNormal);`
          );

        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
             varying vec3 vWorldNorm;
             varying vec3 vWorldP;
             varying vec3 vLocalP;
             varying float vBubbleMask;
             uniform float uTime;
             uniform vec3 uHoverPos;
             uniform float uRippleAmp;
             uniform float uHoverGlow;
             uniform float uBaseRimStrength;
             uniform float uRedRimBoost;
             uniform float uSpotRadius;
             uniform float uAlphaScale;`
          )
          .replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
             vec3 n = normalize(vWorldNorm);
             vec3 v = normalize(cameraPosition - vWorldP);
             float fresnel = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.1);

             vec3 glassRim = vec3(0.82, 0.88, 0.98) * fresnel * uBaseRimStrength;

             float hoverDist = distance(vLocalP.xy, uHoverPos.xy);
             float proximity = smoothstep(uSpotRadius, 2.0, hoverDist);
             float redRimMask = mix(0.45, 1.0, fresnel) * (0.45 + 0.95 * proximity) * uHoverGlow;
             float redSpotCore = pow(proximity, 1.8) * uHoverGlow;

             vec3 dc2e27 = vec3(0.863, 0.180, 0.153);
             vec3 brightCrimson = vec3(1.0, 0.26, 0.20);
             vec3 redReflection = mix(dc2e27, brightCrimson, clamp(fresnel * 0.65 + redSpotCore * 0.45, 0.0, 1.0))
               * (redRimMask + redSpotCore * 0.75) * uRedRimBoost;

             gl_FragColor.rgb += glassRim + redReflection;

             float pulse = 0.82 + 0.18 * sin(uTime * 3.1 + vLocalP.x * 0.12);
             float shimmer = pow(0.5 + 0.5 * sin((vLocalP.x + vLocalP.y) * 0.18 - uTime * 3.5), 6.0);
             vec3 bubbleCrimson = dc2e27 * (0.85 + 0.38 * pulse) + vec3(0.16, 0.02, 0.02);
             bubbleCrimson += vec3(1.0, 0.36, 0.28) * (fresnel * 0.5 + shimmer * 0.35 + uHoverGlow * 0.45 + uRippleAmp * 0.25);

             gl_FragColor.rgb = mix(gl_FragColor.rgb, bubbleCrimson, vBubbleMask * 0.92);
             gl_FragColor.a = clamp((0.38 + fresnel * 0.42 + redRimMask * 0.34 + vBubbleMask * 0.32) * uAlphaScale, 0.16, 0.94);`
          );
      };
      material.needsUpdate = true;
    }

    const metalMat = new THREE.MeshStandardMaterial({
      name: 'LogoSmokedMetal',
      color: 0x262b36,
      metalness: 0.78,
      roughness: 1.0,
      roughnessMap: metalRoughTex,
      bumpMap: metalRoughTex,
      bumpScale: 0.003,
      transparent: true,
      opacity: 0.68,
      envMapIntensity: 0.75,
    });
    applyGlassAndRedRimShader(metalMat, {
      rippleScale: 1.4,
      baseRimStrength: 0.18,
      redRimBoost: 1.65,
      spotRadius: 92.0,
      alphaScale: 0.85,
      bubbleFloatScale: 0.85,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      name: 'LogoFrostedTransparentGlass',
      color: 0xdbeafe,
      transmission: 0.86,
      transparent: true,
      opacity: 0.72,
      roughness: 1.0,
      roughnessMap: frostRoughTex,
      bumpMap: frostRoughTex,
      bumpScale: 0.005,
      metalness: 0.0,
      ior: 1.48,
      thickness: 1.15,
      attenuationColor: new THREE.Color(0x94a3b8),
      attenuationDistance: 1.8,
      clearcoat: 0.92,
      clearcoatRoughness: 0.22,
      iridescence: 0.38,
      iridescenceIOR: 1.32,
      envMapIntensity: 1.0,
    });
    applyGlassAndRedRimShader(glassMat, {
      rippleScale: 2.1,
      baseRimStrength: 0.26,
      redRimBoost: 2.15,
      spotRadius: 98.0,
      alphaScale: 1.0,
      bubbleFloatScale: 1.15,
    });

    const logoPivot = new THREE.Group();
    const metalLayerGroup = new THREE.Group();
    const glassLayerGroup = new THREE.Group();
    logoPivot.add(metalLayerGroup);
    logoPivot.add(glassLayerGroup);
    scene.add(logoPivot);

    const geometries = [];
    const hitMeshes = [];

    const loader = new SVGLoader();
    const svgData = loader.parse(SAGMETIC_LOGO_SVG);

    svgData.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const metalGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 10,
          bevelEnabled: true,
          bevelThickness: 2.4,
          bevelSize: 1.8,
          bevelSegments: 4,
          curveSegments: 24,
        });
        geometries.push(metalGeo);
        const metalMesh = new THREE.Mesh(metalGeo, metalMat);
        metalLayerGroup.add(metalMesh);
        hitMeshes.push(metalMesh);

        const glassGeo = new THREE.ExtrudeGeometry(shape, {
          depth: 7,
          bevelEnabled: true,
          bevelThickness: 2.2,
          bevelSize: 1.6,
          bevelSegments: 4,
          curveSegments: 24,
        });
        geometries.push(glassGeo);
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.position.set(-4, 3, 9);
        glassLayerGroup.add(glassMesh);
        hitMeshes.push(glassMesh);
      });
    });

    const box = new THREE.Box3().setFromObject(logoPivot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, 1);
    const scale = 2.15 / maxDim;

    metalLayerGroup.position.set(-center.x * scale, center.y * scale, -center.z * scale);
    metalLayerGroup.scale.set(scale, -scale, scale);

    glassLayerGroup.position.set(-center.x * scale, center.y * scale, -center.z * scale);
    glassLayerGroup.scale.set(scale, -scale, scale);

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const localHit = new THREE.Vector3();
    const targetPointer = { x: 0, y: 0 };
    const smoothPointer = { x: 0, y: 0 };
    let rippleAmp = 0;
    let impulseBurst = 0;
    let targetHoverGlow = 0;
    let hoverGlow = 0;

    const spring = { rotX: 0, rotXV: 0, rotY: 0, rotYV: 0, scale: 0.94, scaleV: 0 };

    const updatePointer = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      targetPointer.x = THREE.MathUtils.clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      targetPointer.y = THREE.MathUtils.clamp(-((clientY - rect.top) / rect.height) * 2 + 1, -1, 1);

      if (!hitMeshes.length) return;
      pointerNdc.set(targetPointer.x, targetPointer.y);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length > 0) {
        localHit.copy(hits[0].point);
        hits[0].object.worldToLocal(localHit);
        shaderUniforms.uHoverPos.value.copy(localHit);
        rippleAmp = Math.min(1.0, rippleAmp + 0.35);
        targetHoverGlow = 1.25;
      } else {
        targetHoverGlow = 0.55;
      }
    };

    const onPointerMove = (e) => updatePointer(e.clientX, e.clientY);
    const onPointerLeave = () => {
      targetHoverGlow = 0.0;
    };
    const onPointerDown = (e) => {
      updatePointer(e.clientX, e.clientY);
      rippleAmp = 1.0;
      impulseBurst = 1.0;
      targetHoverGlow = 1.65;
      spring.scaleV += 0.65;
      spring.rotYV += (targetPointer.x >= 0 ? 1 : -1) * 2.5;
    };

    const onResize = () => {
      const { w, h } = getSize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let animFrameId = null;

    function animate() {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.max(0.001, Math.min(0.05, clock.getDelta()));
      const elapsed = clock.getElapsedTime();

      smoothPointer.x = THREE.MathUtils.damp(smoothPointer.x, targetPointer.x, 8, dt);
      smoothPointer.y = THREE.MathUtils.damp(smoothPointer.y, targetPointer.y, 8, dt);
      rippleAmp = THREE.MathUtils.damp(rippleAmp, 0, 2.2, dt);
      impulseBurst = THREE.MathUtils.damp(impulseBurst, 0, 3.0, dt);
      hoverGlow = THREE.MathUtils.damp(hoverGlow, targetHoverGlow, 7.5, dt);

      keyLight.position.x = 3.2 + smoothPointer.x * 2.2;
      keyLight.position.y = 4.2 + smoothPointer.y * 1.8;

      hoverRedLight.position.set(smoothPointer.x * 1.9, smoothPointer.y * 1.6, 2.4);
      hoverRedLight.intensity = hoverGlow * 10.5;

      const goalRotX = -smoothPointer.y * 0.42 + Math.sin(elapsed * 0.7) * 0.06;
      const goalRotY = smoothPointer.x * 0.54 + Math.sin(elapsed * 0.45) * 0.18;
      const goalScale = 1.0 + impulseBurst * 0.045;

      spring.rotXV += (68 * (goalRotX - spring.rotX) - 9.5 * spring.rotXV) * dt;
      spring.rotX += spring.rotXV * dt;
      spring.rotYV += (68 * (goalRotY - spring.rotY) - 9.5 * spring.rotYV) * dt;
      spring.rotY += spring.rotYV * dt;
      spring.scaleV += (140 * (goalScale - spring.scale) - 13 * spring.scaleV) * dt;
      spring.scale += spring.scaleV * dt;

      logoPivot.rotation.set(spring.rotX, spring.rotY, smoothPointer.x * 0.09);
      logoPivot.scale.setScalar(THREE.MathUtils.clamp(spring.scale, 0.85, 1.15));

      glassLayerGroup.position.z = -center.z * scale + smoothPointer.x * 0.05;
      glassLayerGroup.rotation.y = smoothPointer.x * 0.06;
      metalLayerGroup.rotation.y = -smoothPointer.x * 0.03;

      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uRippleAmp.value = rippleAmp;
      shaderUniforms.uHoverGlow.value = hoverGlow;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);

      geometries.forEach((g) => g.dispose());
      metalMat.dispose();
      glassMat.dispose();
      metalRoughTex.dispose();
      frostRoughTex.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={className} />;
};

export default SagmeticLogo3D;