import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

export default function PhysicsLabDrawer({
  physicsUI,
  onPhysicsChange,
  onReset,
  darkMode,
}) {
  return (
    <aside
      className={`pointer-events-auto w-full md:w-72 p-4 rounded-2xl border backdrop-blur-xl shadow-xl space-y-3.5 transition-all ${
        darkMode
          ? 'border-white/15 bg-[#0E0E10]/90 text-[#F4F3EE]'
          : 'border-black/15 bg-white/90 text-[#141413]'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b pb-2 ${
          darkMode ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <span className="font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#FF552E]" />
          Spring-Mass Tuner
        </span>
        <button
          onClick={onReset}
          className="font-mono text-[11px] text-[#FF552E] hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="opacity-75">Spring Stiffness</span>
          <span className="font-semibold">{physicsUI.stiffness} N/m</span>
        </div>
        <input
          type="range"
          min="90"
          max="340"
          step="5"
          value={physicsUI.stiffness}
          onChange={(e) => onPhysicsChange('stiffness', e.target.value)}
          className="w-full accent-[#FF552E] cursor-pointer"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="opacity-75">Damping Ratio</span>
          <span className="font-semibold">{physicsUI.damping}</span>
        </div>
        <input
          type="range"
          min="4"
          max="24"
          step="0.5"
          value={physicsUI.damping}
          onChange={(e) => onPhysicsChange('damping', e.target.value)}
          className="w-full accent-[#FF552E] cursor-pointer"
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="opacity-75">Mesh Wobble Amp</span>
          <span className="font-semibold">{physicsUI.wobble.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="2.2"
          step="0.05"
          value={physicsUI.wobble}
          onChange={(e) => onPhysicsChange('wobble', e.target.value)}
          className="w-full accent-[#FF552E] cursor-pointer"
        />
      </div>
    </aside>
  );
}