
import './App.css'
import './plush/face.css'
import PlushPortrait from './components/PlushPortrait'
import IndieApp from './components/indiemaker/IndieApp'
import ShibaMascot from './components/Shiba/ShibaMascot'
import MochiMascot from './components/mochimascot/MochiMascot'
import RobotMascot from './components/robotmascot/RobotMascot'
import { useState } from 'react'

export default function App() {
  const [active, setActive] = useState('robot');

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-white">
      <div className="p-4 flex gap-3 z-10">
        <button
          type="button"
          onClick={() => setActive('shiba')}
          className={`px-4 py-2 rounded ${active === 'shiba' ? 'bg-amber-500 text-black' : 'bg-slate-800'}`}
        >
          Shiba Mascot
        </button>
        <button
          type="button"
          onClick={() => setActive('robot')}
          className={`px-4 py-2 rounded ${active === 'robot' ? 'bg-emerald-400 text-black' : 'bg-slate-800'}`}
        >
          Robot Mascot
        </button>
      </div>

      <div className="flex-1 w-full">
        {active === 'shiba' ? (
          <ShibaMascot className="w-full h-[calc(100vh-4.5rem)]" />
        ) : (
          <RobotMascot className="w-full h-[calc(100vh-4.5rem)]" />
        )}
      </div>
    </div>
  );
}
