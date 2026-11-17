import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import IndieMakerMascot from './IndieMakerMascot';
import OrbitingProjectCard from './OrbitingProjectCard';
import { INDIE_ARTIFACTS } from './data/data';


function CameraRig({ cameraPreset }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0.15, 5.4));

  useEffect(() => {
    if (cameraPreset === 'focus') {
      targetPos.current.set(0, 0.25, 3.65);
    } else if (cameraPreset === 'zerog') {
      targetPos.current.set(0, 0.45, 6.2);
    } else {
      targetPos.current.set(0, 0.15, 5.4);
    }

    gsap.to(camera.position, {
      x: targetPos.current.x,
      y: targetPos.current.y,
      z: targetPos.current.z,
      duration: 1.05,
      ease: 'expo.out',
    });
  }, [cameraPreset, camera]);

  useFrame((state) => {
    const parallaxX = state.pointer.x * 0.28;
    const parallaxY = targetPos.current.y + state.pointer.y * 0.18;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, parallaxY, 0.04);
    camera.lookAt(0, 0.05, 0);
  });

  return null;
}

export default function StudioScene({
  darkMode,
  physicsRef,
  presetTrigger,
  cameraPreset,
  onPokeFeedback,
  onSelectArtifact,
}) {
  return (
    <>
      <CameraRig cameraPreset={cameraPreset} />

      <ambientLight intensity={darkMode ? 0.65 : 0.95} />
      <directionalLight
        position={[4.5, 6, 5]}
        intensity={darkMode ? 1.85 : 1.55}
        color="#FFFDF9"
        castShadow
      />
      <pointLight position={[-4.5, 2.5, -2.5]} intensity={2.4} color="#FF552E" distance={14} />
      <pointLight position={[4.2, -1.5, -2.2]} intensity={1.9} color="#60A5FA" distance={14} />

      <IndieMakerMascot
        physicsRef={physicsRef}
        presetTrigger={presetTrigger}
        onPokeFeedback={onPokeFeedback}
        darkMode={darkMode}
      />

      {INDIE_ARTIFACTS.map((artifact, idx) => (
        <OrbitingProjectCard
          key={artifact.id}
          artifact={artifact}
          index={idx}
          darkMode={darkMode}
          zeroGMode={cameraPreset === 'zerog'}
          onSelectArtifact={onSelectArtifact}
        />
      ))}
    </>
  );
}