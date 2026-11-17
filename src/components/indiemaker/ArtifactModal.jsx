import React from 'react';
import { X } from 'lucide-react';

export default function ArtifactModal({
  artifact,
  artifacts,
  onSelect,
  onClose,
  darkMode,
}) {
  if (!artifact) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
          darkMode
            ? 'border-white/15 bg-[#0E0E10] text-[#F4F3EE]'
            : 'border-black/15 bg-[#FAF9F6] text-[#141413]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            style={{ backgroundColor: artifact.accent }}
            className="px-3 py-1 rounded-full font-mono text-xs font-bold text-white"
          >
            {artifact.code}
          </span>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full border transition-colors ${
              darkMode
                ? 'border-white/15 hover:bg-white hover:text-black'
                : 'border-black/15 hover:bg-black hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">{artifact.title}</h2>
          <p className="text-sm opacity-70 mt-1">{artifact.tag}</p>
        </div>

        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl font-mono text-xs ${
            darkMode ? 'bg-white/5' : 'bg-black/5'
          }`}
        >
          <span>STATUS: SHIPPED</span>
          <span style={{ color: artifact.accent }} className="font-bold">
            {artifact.metric}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {artifacts.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`flex-1 py-2 rounded-xl font-mono text-xs border transition-colors ${
                item.id === artifact.id
                  ? 'border-[#FF552E] bg-[#FF552E]/10 font-bold'
                  : darkMode
                  ? 'border-white/10 opacity-70 hover:opacity-100'
                  : 'border-black/10 opacity-70 hover:opacity-100'
              }`}
            >
              {item.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}