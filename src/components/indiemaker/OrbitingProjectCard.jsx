import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { createProjectCardTexture } from './utils/textures';

export default function OrbitingProjectCard({
  artifact,
  index,
  darkMode,
  zeroGMode,
  onSelectArtifact,
}) {
  const groupRef = useRef();
  const cardMeshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const cardTexture = useMemo(
    () =>
      createProjectCardTexture({
        code: artifact.code,
        title: artifact.title,
        tag: artifact.tag,
        accent: artifact.accent,
        metric: artifact.metric,
        darkMode,
      }),
    [artifact, darkMode]
  );

  useEffect(() => {
    if (!cardMeshRef.current) return;
    gsap.to(cardMeshRef.current.scale, {
      x: hovered ? 1.14 : 1,
      y: hovered ? 1.14 : 1,
      z: hovered ? 1.14 : 1,
      duration: 0.45,
      ease: 'back.out(2.2)',
    });
  }, [hovered]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const speed = zeroGMode ? 0.52 : 0.24;
    const angle = artifact.orbitAngle + t * speed;
    const radius = zeroGMode ? artifact.orbitRadius * 1.16 : artifact.orbitRadius;

    const targetX = Math.cos(angle) * radius;
    const targetZ = Math.sin(angle) * (radius * 0.65);
    const bobY = artifact.orbitY + Math.sin(t * 1.8 + index * 2.1) * 0.16;

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, bobY, 0.08);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);

    groupRef.current.rotation.y = Math.sin(angle) * -0.25 + (hovered ? state.pointer.x * 0.25 : 0);
    groupRef.current.rotation.x = Math.cos(t * 1.4 + index) * 0.06 + (hovered ? -state.pointer.y * 0.2 : 0);
    groupRef.current.rotation.z = Math.sin(t * 1.2 + index) * 0.04;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={cardMeshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectArtifact(artifact);
        }}
      >
        <boxGeometry args={[1.42, 0.94, 0.055]} />
        <meshPhysicalMaterial
          map={cardTexture}
          roughness={0.25}
          metalness={0.04}
          clearcoat={0.45}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
}