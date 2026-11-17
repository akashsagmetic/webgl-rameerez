import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { Sun, Moon, Play, Zap, Orbit, Crosshair } from 'lucide-react';
import StudioScene from './StudioScene';
import { INDIE_ARTIFACTS } from './data/data';
import PhysicsLabDrawer from './PhysicsLabDrawer';
import ArtifactModal from './ArtifactModal';


export default function IndieApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [cameraPreset, setCameraPreset] = useState('hero');
  const [presetTrigger, setPresetTrigger] = useState({ type: 'entrance', count: 0 });
  const [pokeCount, setPokeCount] = useState(0);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [labOpen, setLabOpen] = useState(false);

  const [physicsUI, setPhysicsUI] = useState({
    stiffness: 195,
    damping: 11,
    wobble: 1.15,
  });
  const physicsRef = useRef({ ...physicsUI });
  const uiContainerRef = useRef(null);

  const handlePhysicsChange = (key, value) => {
    const num = parseFloat(value);
    physicsRef.current[key] = num;
    setPhysicsUI((prev) => ({ ...prev, [key]: num }));
  };

  const resetPhysics = () => {
    const defaults = { stiffness: 195, damping: 11, wobble: 1.15 };
    physicsRef.current = { ...defaults };
    setPhysicsUI(defaults);
  };

  const runEditorialEntrance = useCallback(() => {
    if (!uiContainerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-stagger',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }, uiContainerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    runEditorialEntrance();
  }, [runEditorialEntrance]);

  const triggerPreset = (type) => {
    if (type === 'entrance') {
      setCameraPreset('hero');
      setPresetTrigger((p) => ({ type: 'entrance', count: p.count + 1 }));
      runEditorialEntrance();
    } else if (type === 'squish') {
      setPresetTrigger((p) => ({ type: 'squish', count: p.count + 1 }));
      setPokeCount((c) => c + 1);
    } else if (type === 'zerog') {
      setCameraPreset('zerog');
      setPresetTrigger((p) => ({ type: 'zerog', count: p.count + 1 }));
    } else if (type === 'focus') {
      setCameraPreset((prev) => (prev === 'focus' ? 'hero' : 'focus'));
    }
  };

  const handlePokeFeedback = useCallback(() => {
    setPokeCount((c) => c + 1);
  }, []);

  const gridBackgroundStyle = darkMode
    ? {
        backgroundColor: '#0E0E10',
        backgroundImage:
          'radial-gradient(rgba(244, 243, 238, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(244, 243, 238, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(244, 243, 238, 0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px, 112px 112px, 112px 112px',
      }
    : {
        backgroundColor: '#FAF9F6',
        backgroundImage:
          'radial-gradient(rgba(20, 20, 19, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(20, 20, 19, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 20, 19, 0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px, 112px 112px, 112px 112px',
      };

  return (
    <div
      ref={uiContainerRef}
      style={gridBackgroundStyle}
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-300 ${
        darkMode ? 'text-[#F4F3EE]' : 'text-[#141413]'
      }`}
    >
      <div className="absolute inset-0 z-0">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0.15, 5.4], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <StudioScene
            darkMode={darkMode}
            physicsRef={physicsRef}
            presetTrigger={presetTrigger}
            cameraPreset={cameraPreset}
            onPokeFeedback={handlePokeFeedback}
            onSelectArtifact={(art) => setSelectedArtifact(art)}
          />
        </Canvas>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 pointer-events-none">
        <header className="gsap-stagger flex items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerPreset('entrance')}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-full border backdrop-blur-md shadow-sm hover:border-[#FF552E] transition-all ${
                darkMode
                  ? 'border-white/15 bg-[#0E0E10]/80'
                  : 'border-black/15 bg-white/80'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF552E] group-hover:scale-125 transition-transform" />
              <span className="font-mono text-xs sm:text-sm font-semibold tracking-tight">
                @rameerez
              </span>
            </button>

            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs border ${
                darkMode
                  ? 'border-white/10 bg-white/5 text-white/65'
                  : 'border-black/10 bg-white/50 text-black/65'
              }`}
            >
              R3F + GSAP ANIMATIC LAB
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setSelectedArtifact(INDIE_ARTIFACTS[0])}
              className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border backdrop-blur-md transition-colors ${
                darkMode
                  ? 'border-white/15 bg-[#0E0E10]/80 hover:bg-white hover:text-black'
                  : 'border-black/15 bg-white/80 hover:bg-black hover:text-white'
              }`}
            >
              Work <span className="font-mono text-[11px] opacity-60 ml-0.5">03</span>
            </button>

            <button
              onClick={() => setLabOpen((v) => !v)}
              className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors backdrop-blur-md ${
                labOpen
                  ? 'bg-[#FF552E] text-white border-[#FF552E]'
                  : darkMode
                  ? 'border-white/15 bg-[#0E0E10]/80 hover:border-[#FF552E]'
                  : 'border-black/15 bg-white/80 hover:border-[#FF552E]'
              }`}
            >
              Physics Lab
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle Studio Theme"
              className={`p-2.5 rounded-full border backdrop-blur-md hover:scale-105 active:scale-95 transition-transform ${
                darkMode
                  ? 'border-white/15 bg-[#0E0E10]/80'
                  : 'border-black/15 bg-white/80'
              }`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </nav>
        </header>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 my-auto pointer-events-none">
          <div className="max-w-md space-y-2.5">
            <div className="gsap-stagger inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF552E]/10 border border-[#FF552E]/25 text-[#FF552E] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <span>● Interactive Toy Physics</span>
              {pokeCount > 0 && <span>• {pokeCount} Pokes</span>}
            </div>

            <h1 className="gsap-stagger text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
              I love making{' '}
              <span className="text-[#FF552E] italic">cool stuff.</span>
            </h1>

            <p className="gsap-stagger text-xs sm:text-sm opacity-70 leading-relaxed max-w-sm">
              Click or drag the vinyl maker mascot to deform its spring-mass
              mesh, or click orbiting badges to inspect shipped indie products.
            </p>
          </div>

          {labOpen && (
            <PhysicsLabDrawer
              physicsUI={physicsUI}
              onPhysicsChange={handlePhysicsChange}
              onReset={resetPhysics}
              darkMode={darkMode}
            />
          )}
        </div>

        <footer className="gsap-stagger flex flex-col items-center gap-2 pointer-events-auto">
          <div
            className={`flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-2 rounded-2xl sm:rounded-full border backdrop-blur-xl shadow-lg ${
              darkMode
                ? 'border-white/15 bg-[#0E0E10]/85'
                : 'border-black/15 bg-white/85'
            }`}
          >
            <button
              onClick={() => triggerPreset('entrance')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-[#FF552E]" />
              Hero Entrance
            </button>

            <button
              onClick={() => triggerPreset('squish')}
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FF552E] text-white shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Squish & Bounce
            </button>

            <button
              onClick={() => triggerPreset('zerog')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                cameraPreset === 'zerog'
                  ? darkMode
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : darkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-black/5'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              Zero-G Orbit
            </button>

            <button
              onClick={() => triggerPreset('focus')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                cameraPreset === 'focus'
                  ? darkMode
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : darkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-black/5'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              {cameraPreset === 'focus' ? 'Exit Focus' : 'Focus Mode'}
            </button>
          </div>
        </footer>
      </div>

      <ArtifactModal
        artifact={selectedArtifact}
        artifacts={INDIE_ARTIFACTS}
        onSelect={(item) => setSelectedArtifact(item)}
        onClose={() => setSelectedArtifact(null)}
        darkMode={darkMode}
      />
    </div>
  );
}