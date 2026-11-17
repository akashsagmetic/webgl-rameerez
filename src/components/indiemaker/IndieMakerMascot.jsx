import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { createVinylMicroGrainTexture } from './utils/textures';


export default function IndieMakerMascot({
  physicsRef,
  presetTrigger,
  onPokeFeedback,
  darkMode,
}) {
  const rootGroupRef = useRef();
  const headGroupRef = useRef();
  const headMeshRef = useRef();
  const leftPupilRef = useRef();
  const rightPupilRef = useRef();
  const leftEyelidRef = useRef();
  const rightEyelidRef = useRef();
  const mouthRef = useRef();

  const springState = useRef({
    scale: new THREE.Vector3(1, 1, 1),
    scaleVel: new THREE.Vector3(0, 0, 0),
    pos: new THREE.Vector3(0, 0.12, 0),
    posVel: new THREE.Vector3(0, 0, 0),
    rotImpulse: new THREE.Vector3(0, 0, 0),
    rotVel: new THREE.Vector3(0, 0, 0),
    pokePoint: new THREE.Vector3(0, 0, 1.15),
    pokeAmount: 0,
    pokeVel: 0,
    blinkTimer: 2.4,
    blinkProgress: 0,
    isBlinking: false,
    surpriseAmount: 0,
    isDragging: false,
    dragLastX: 0,
    dragLastY: 0,
    spinOffset: 0,
  });

  const vinylBump = useMemo(() => createVinylMicroGrainTexture(), []);

  const { headGeometry, basePositions } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.12, 64, 64);
    const posAttr = geo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      const yNorm = v.y / 1.12;
      const cheekFactor =
        yNorm < 0
          ? 1 + Math.sin(Math.abs(yNorm) * Math.PI) * 0.08
          : 1 - yNorm * 0.04;
      v.x *= cheekFactor * 1.03;
      v.z *= 0.96;
      v.y *= 1.04;
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    const base = new Float32Array(posAttr.array);
    return { headGeometry: geo, basePositions: base };
  }, []);

  useEffect(() => {
    if (!rootGroupRef.current) return;
    const s = springState.current;

    if (presetTrigger.type === 'entrance') {
      gsap.killTweensOf(rootGroupRef.current.scale);
      gsap.killTweensOf(rootGroupRef.current.rotation);
      rootGroupRef.current.scale.set(0.01, 0.01, 0.01);
      rootGroupRef.current.rotation.y = -Math.PI * 0.85;

      gsap.to(rootGroupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.15,
        ease: 'elastic.out(1, 0.52)',
      });
      gsap.to(rootGroupRef.current.rotation, {
        y: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.6)',
      });
      s.pokeAmount = 0.22;
      s.surpriseAmount = 1.0;
    } else if (presetTrigger.type === 'squish') {
      s.scaleVel.set(4.5, -5.8, 4.5);
      s.posVel.y = 2.6;
      s.rotVel.z = (Math.random() - 0.5) * 5.0;
      s.pokePoint.set(0, 0.1, 1.15);
      s.pokeVel = 4.2;
      s.surpriseAmount = 1.0;

      gsap.to(rootGroupRef.current.rotation, {
        y: rootGroupRef.current.rotation.y + Math.PI * 2,
        duration: 0.95,
        ease: 'back.out(1.4)',
      });
    } else if (presetTrigger.type === 'zerog') {
      s.posVel.y = 3.2;
      s.rotVel.set(1.4, 2.2, -1.2);
      s.scaleVel.set(-1.8, 2.4, -1.8);
    }
  }, [presetTrigger]);

  const triggerPoke = useCallback(
    (localPoint, intensity = 1.0) => {
      const s = springState.current;
      const wobbleMult = physicsRef.current.wobble;

      s.pokePoint.copy(localPoint).normalize().multiplyScalar(1.12);
      s.pokeVel += 3.6 * intensity * wobbleMult;
      s.scaleVel.x += 2.6 * intensity * wobbleMult;
      s.scaleVel.y -= 3.4 * intensity * wobbleMult;
      s.scaleVel.z += 2.6 * intensity * wobbleMult;
      s.posVel.y += 1.4 * intensity;
      s.rotVel.x += -localPoint.y * 2.8 * intensity;
      s.rotVel.y += localPoint.x * 3.2 * intensity;
      s.surpriseAmount = 1.0;

      if (onPokeFeedback) onPokeFeedback();
    },
    [physicsRef, onPokeFeedback]
  );

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const s = springState.current;
    s.isDragging = true;
    s.dragLastX = e.clientX;
    s.dragLastY = e.clientY;
    document.body.style.cursor = 'grabbing';

    if (headMeshRef.current) {
      const localPt = headMeshRef.current.worldToLocal(e.point.clone());
      triggerPoke(localPt, 1.15);
    }
  };

  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      const s = springState.current;
      if (!s.isDragging) return;
      const dx = e.clientX - s.dragLastX;
      const dy = e.clientY - s.dragLastY;
      s.dragLastX = e.clientX;
      s.dragLastY = e.clientY;

      s.spinOffset += dx * 0.012;
      s.rotVel.y += dx * 0.06;
      s.rotVel.x += dy * 0.05;
      s.scaleVel.x += Math.abs(dx) * 0.015 * physicsRef.current.wobble;
      s.scaleVel.y -= Math.abs(dy) * 0.015 * physicsRef.current.wobble;
    };

    const handleWindowPointerUp = () => {
      if (springState.current.isDragging) {
        springState.current.isDragging = false;
        document.body.style.cursor = 'auto';
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [physicsRef]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.033);
    const s = springState.current;
    const { stiffness: k, damping: c, wobble } = physicsRef.current;

    const forceSX = -k * (s.scale.x - 1) - c * s.scaleVel.x;
    const forceSY = -k * (s.scale.y - 1) - c * s.scaleVel.y;
    const forceSZ = -k * (s.scale.z - 1) - c * s.scaleVel.z;
    s.scaleVel.x += forceSX * dt;
    s.scaleVel.y += forceSY * dt;
    s.scaleVel.z += forceSZ * dt;
    s.scale.x += s.scaleVel.x * dt;
    s.scale.y += s.scaleVel.y * dt;
    s.scale.z += s.scaleVel.z * dt;

    const idleY = 0.14 + Math.sin(state.clock.elapsedTime * 2.1) * 0.06;
    const forcePY = -k * 0.85 * (s.pos.y - idleY) - c * s.posVel.y;
    s.posVel.y += forcePY * dt;
    s.pos.y += s.posVel.y * dt;

    const forceRX = -k * 0.9 * s.rotImpulse.x - c * s.rotVel.x;
    const forceRY = -k * 0.9 * s.rotImpulse.y - c * s.rotVel.y;
    const forceRZ = -k * 0.9 * s.rotImpulse.z - c * s.rotVel.z;
    s.rotVel.x += forceRX * dt;
    s.rotVel.y += forceRY * dt;
    s.rotVel.z += forceRZ * dt;
    s.rotImpulse.x += s.rotVel.x * dt;
    s.rotImpulse.y += s.rotVel.y * dt;
    s.rotImpulse.z += s.rotVel.z * dt;

    const forcePoke = -k * 1.15 * s.pokeAmount - c * 0.85 * s.pokeVel;
    s.pokeVel += forcePoke * dt;
    s.pokeAmount += s.pokeVel * dt;

    if (!s.isDragging) {
      s.spinOffset = THREE.MathUtils.lerp(s.spinOffset, 0, 1 - Math.exp(-3.5 * dt));
    }

    const targetHeadY = state.pointer.x * 0.42 + s.spinOffset + s.rotImpulse.y;
    const targetHeadX = -state.pointer.y * 0.3 + s.rotImpulse.x;
    const targetHeadZ = -state.pointer.x * 0.1 + s.rotImpulse.z;

    if (headGroupRef.current) {
      headGroupRef.current.position.copy(s.pos);
      headGroupRef.current.scale.copy(s.scale);
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.y,
        targetHeadY,
        1 - Math.exp(-10 * dt)
      );
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.x,
        targetHeadX,
        1 - Math.exp(-10 * dt)
      );
      headGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.z,
        targetHeadZ,
        1 - Math.exp(-10 * dt)
      );
    }

    const pupilX = THREE.MathUtils.clamp(state.pointer.x * 0.085, -0.09, 0.09);
    const pupilY = THREE.MathUtils.clamp(state.pointer.y * 0.075, -0.08, 0.08);
    if (leftPupilRef.current && rightPupilRef.current) {
      leftPupilRef.current.position.x = THREE.MathUtils.lerp(leftPupilRef.current.position.x, pupilX, 14 * dt);
      leftPupilRef.current.position.y = THREE.MathUtils.lerp(leftPupilRef.current.position.y, pupilY, 14 * dt);
      rightPupilRef.current.position.x = THREE.MathUtils.lerp(rightPupilRef.current.position.x, pupilX, 14 * dt);
      rightPupilRef.current.position.y = THREE.MathUtils.lerp(rightPupilRef.current.position.y, pupilY, 14 * dt);
    }

    s.blinkTimer -= dt;
    if (s.blinkTimer <= 0 && !s.isBlinking) {
      s.isBlinking = true;
      s.blinkProgress = 0;
    }
    if (s.isBlinking) {
      s.blinkProgress += dt * 9.5;
      const blinkScaleY = Math.max(0.08, Math.abs(Math.cos(s.blinkProgress * Math.PI)));
      if (leftEyelidRef.current && rightEyelidRef.current) {
        leftEyelidRef.current.scale.y = blinkScaleY;
        rightEyelidRef.current.scale.y = blinkScaleY;
      }
      if (s.blinkProgress >= 1) {
        s.isBlinking = false;
        s.blinkTimer = 2.2 + Math.random() * 2.8;
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.scale.y = 1;
          rightEyelidRef.current.scale.y = 1;
        }
      }
    }

    s.surpriseAmount = THREE.MathUtils.lerp(s.surpriseAmount, 0, 1 - Math.exp(-5.5 * dt));
    if (mouthRef.current) {
      const openScale = 1 + s.surpriseAmount * 0.9;
      mouthRef.current.scale.set(1 - s.surpriseAmount * 0.25, openScale, 1);
    }

    if (headMeshRef.current && Math.abs(s.pokeAmount) > 0.0005) {
      const posAttr = headGeometry.attributes.position;
      const px = s.pokePoint.x;
      const py = s.pokePoint.y;
      const pz = s.pokePoint.z;
      const amp = s.pokeAmount * 0.34 * wobble;

      for (let i = 0; i < posAttr.count; i++) {
        const idx = i * 3;
        const bx = basePositions[idx];
        const by = basePositions[idx + 1];
        const bz = basePositions[idx + 2];

        const dx = bx - px;
        const dy = by - py;
        const dz = bz - pz;
        const distSq = dx * dx + dy * dy + dz * dz;

        const falloff = Math.exp(-distSq * 2.4);
        const ripple = Math.cos(Math.sqrt(distSq) * 5.0) * falloff;
        const disp = -amp * ripple;

        const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        posAttr.setXYZ(
          i,
          bx + (bx / len) * disp,
          by + (by / len) * disp,
          bz + (bz / len) * disp
        );
      }
      posAttr.needsUpdate = true;
      headGeometry.computeVertexNormals();
    }
  });

  const skinColor = '#FFD7BA';
  const beanieColor = '#FF552E';
  const glassesColor = darkMode ? '#F4F3EE' : '#18181B';
  const hoodieColor = darkMode ? '#27272A' : '#1E1E22';

  return (
    <group ref={rootGroupRef} position={[0, -0.05, 0]}>
      <group
        ref={headGroupRef}
        onPointerDown={handlePointerDown}
        onPointerOver={() => {
          if (!springState.current.isDragging) document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          if (!springState.current.isDragging) document.body.style.cursor = 'auto';
        }}
      >
        <mesh ref={headMeshRef} geometry={headGeometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={skinColor}
            roughness={0.42}
            metalness={0.02}
            clearcoat={0.18}
            clearcoatRoughness={0.45}
            bumpMap={vinylBump}
            bumpScale={0.004}
          />
        </mesh>

        <mesh position={[-0.56, -0.14, 0.92]} scale={[1.2, 0.75, 0.5]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#FF8A75" roughness={0.6} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.56, -0.14, 0.92]} scale={[1.2, 0.75, 0.5]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color="#FF8A75" roughness={0.6} transparent opacity={0.55} />
        </mesh>

        <mesh position={[0, -0.06, 1.11]} scale={[1, 0.85, 0.9]}>
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshPhysicalMaterial color="#FFC39E" roughness={0.38} clearcoat={0.2} />
        </mesh>

        <mesh ref={mouthRef} position={[0, -0.36, 1.03]} rotation={[0.18, 0, 0]}>
          <torusGeometry args={[0.14, 0.036, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#2A1A17" roughness={0.4} />
        </mesh>

        <group ref={leftEyelidRef} position={[-0.36, 0.12, 1.02]}>
          <mesh scale={[1, 1.12, 0.65]}>
            <sphereGeometry args={[0.18, 28, 28]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={0.8} />
          </mesh>
          <group ref={leftPupilRef} position={[0, 0, 0.1]}>
            <mesh>
              <sphereGeometry args={[0.095, 24, 24]} />
              <meshStandardMaterial color="#111113" roughness={0.1} />
            </mesh>
            <mesh position={[0.035, 0.04, 0.075]}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </group>

        <group ref={rightEyelidRef} position={[0.36, 0.12, 1.02]}>
          <mesh scale={[1, 1.12, 0.65]}>
            <sphereGeometry args={[0.18, 28, 28]} />
            <meshPhysicalMaterial color="#FFFFFF" roughness={0.15} clearcoat={0.8} />
          </mesh>
          <group ref={rightPupilRef} position={[0, 0, 0.1]}>
            <mesh>
              <sphereGeometry args={[0.095, 24, 24]} />
              <meshStandardMaterial color="#111113" roughness={0.1} />
            </mesh>
            <mesh position={[0.035, 0.04, 0.075]}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          </group>
        </group>

        <group position={[0, 0.12, 1.12]}>
          <mesh position={[-0.36, 0, 0]}>
            <torusGeometry args={[0.25, 0.038, 16, 36]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.22} clearcoat={0.7} />
          </mesh>
          <mesh position={[0.36, 0, 0]}>
            <torusGeometry args={[0.25, 0.038, 16, 36]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.22} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.24, 0.05, 0.05]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.22} clearcoat={0.7} />
          </mesh>
          <mesh position={[-0.64, 0.02, -0.35]} rotation={[0, 0.25, 0]}>
            <boxGeometry args={[0.04, 0.045, 0.72]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.25} />
          </mesh>
          <mesh position={[0.64, 0.02, -0.35]} rotation={[0, -0.25, 0]}>
            <boxGeometry args={[0.04, 0.045, 0.72]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.25} />
          </mesh>
        </group>

        <group position={[0, 0.48, -0.06]} rotation={[-0.22, 0, 0]}>
          <mesh position={[0, 0.22, 0]} scale={[1.05, 0.92, 1.02]}>
            <sphereGeometry args={[1.06, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
            <meshStandardMaterial
              color={beanieColor}
              roughness={0.78}
              bumpMap={vinylBump}
              bumpScale={0.012}
            />
          </mesh>
          <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.04, 0.15, 24, 48]} />
            <meshStandardMaterial
              color={beanieColor}
              roughness={0.82}
              bumpMap={vinylBump}
              bumpScale={0.014}
            />
          </mesh>
          <mesh position={[0, 1.24, -0.05]}>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial color="#FF7A59" roughness={0.85} />
          </mesh>
        </group>

        <group position={[0, 0.14, -0.05]}>
          <mesh position={[-1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.34, 0.22, 32]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.28} clearcoat={0.5} />
          </mesh>
          <mesh position={[-1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 0.1, 32]} />
            <meshStandardMaterial color="#FF552E" roughness={0.5} />
          </mesh>
          <mesh position={[1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.34, 0.22, 32]} />
            <meshPhysicalMaterial color={glassesColor} roughness={0.28} clearcoat={0.5} />
          </mesh>
          <mesh position={[1.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.34, 0.34, 0.1, 32]} />
            <meshStandardMaterial color="#FF552E" roughness={0.5} />
          </mesh>
        </group>
      </group>

      <group position={[0, -1.25, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.34, 0.4, 0.45, 32]} />
          <meshPhysicalMaterial color={skinColor} roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.22, 0]} scale={[1.45, 0.65, 0.92]}>
          <sphereGeometry args={[0.88, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial
            color={hoodieColor}
            roughness={0.75}
            bumpMap={vinylBump}
            bumpScale={0.008}
          />
        </mesh>
        <mesh position={[0, 0.04, 0.04]} rotation={[Math.PI / 2 + 0.16, 0, 0]}>
          <torusGeometry args={[0.52, 0.12, 20, 40]} />
          <meshStandardMaterial color={hoodieColor} roughness={0.78} />
        </mesh>
        <mesh position={[0, -0.08, 0.54]} rotation={[-0.25, 0, 0]}>
          <coneGeometry args={[0.24, 0.36, 3]} />
          <meshStandardMaterial color="#FAF9F6" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}