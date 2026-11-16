import { useEffect, useRef, useState } from "react";
import { createJavi } from "../plush/javi.js";
import "../plush/face.css";

export default function PlushPortrait({
  imagesPath = "/images/face",
  frame = "circle",
  width = 380,
  pitchHref = "https://railsfast.com",
  pitchLine = "Buy my template",
}) {
  const rootRef = useRef(null);
  const instanceRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let cancelled = false;
    let javiInstance = null;

    createJavi(el, { frameName: frame })
      .then((instance) => {
        if (cancelled) {
          instance.destroy();
          return;
        }
        javiInstance = instance;
        instanceRef.current = instance;
      })
      .catch((err) => {
        console.warn("WebGL Plushie fallback to static photo:", err);
      });

    return () => {
      cancelled = true;
      if (javiInstance) {
        javiInstance.destroy();
        instanceRef.current = null;
      }
    };
  }, [frame]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (instanceRef.current?.squeak) {
      instanceRef.current.squeak.enabled = next;
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        ref={rootRef}
        className="plush hero-portrait"
        data-frame={frame}
        data-images={imagesPath}
        data-poke="Poke Javi"
        style={{ width }}
      >
        <div className="plush-frame" />

        <a className="hero-pitch" href={pitchHref} target="_blank" rel="noopener noreferrer">
          <span className="hero-pitch-depth">
            <span className="hero-pitch-bubble">
              <span className="hero-pitch-kicker">
                <span className="hero-pitch-calm">Psst.</span>
                <span className="hero-pitch-hurt" aria-hidden="true">Ow! Fine,</span>
              </span>
              <span className="hero-pitch-line">
                {pitchLine}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </span>
        </a>

        <img
          src={`${imagesPath}/smile.webp`}
          alt="Javier Ramirez, smiling"
          width="1254"
          height="1254"
          loading="eager"
          decoding="async"
          crossOrigin="anonymous"
        />
      </div>

      {/* Optional sound toggle button to enable Web Audio rubber squeaks & whistling */}
      <button
        type="button"
        onClick={toggleSound}
        style={{
          padding: "0.4rem 0.85rem",
          borderRadius: "999px",
          border: "1px solid #d4d4d4",
          background: soundOn ? "#fa5b01" : "#fff",
          color: soundOn ? "#fff" : "#0a0a0a",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {soundOn ? "🔊 Squeak On" : "🔇 Enable Squeak"}
      </button>
    </div>
  );
}