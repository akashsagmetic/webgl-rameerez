import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CHIP_LINES = [
  // Left bus lines
  'M 540 365 L 430 365 L 385 320 L 170 320 L 110 260 L 0 260',
  'M 540 410 L 390 410 L 340 460 L 140 460 L 85 515 L 0 515',
  'M 540 455 L 450 455 L 405 500 L 220 500',
  // Right bus lines
  'M 900 365 L 1010 365 L 1055 320 L 1270 320 L 1330 260 L 1440 260',
  'M 900 410 L 1050 410 L 1100 460 L 1300 460 L 1355 515 L 1440 515',
  'M 900 455 L 990 455 L 1035 500 L 1220 500',
  // Top & bottom chip leads
  'M 620 290 L 620 195 L 560 135 L 360 135',
  'M 720 290 L 720 150 L 720 60',
  'M 820 290 L 820 195 L 880 135 L 1080 135',
  'M 640 530 L 640 635 L 580 695 L 380 695',
  'M 800 530 L 800 635 L 860 695 L 1060 695',
  // Bottom center exit trace feeding into the next section
  'M 720 530 L 720 820',
];

const CHIP_PINS = [
  // Left pins
  [524, 365], [524, 390], [524, 415], [524, 440], [524, 465],
  // Right pins
  [900, 365], [900, 390], [900, 415], [900, 440], [900, 465],
  // Top pins
  [620, 274], [653, 274], [686, 274], [720, 274], [753, 274], [786, 274], [820, 274],
  // Bottom pins
  [620, 530], [653, 530], [686, 530], [720, 530], [753, 530], [786, 530], [820, 530],
];

export default function AiChipCurrentBg({ triggerRef }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const pulses = gsap.utils.toArray('[data-current-pulse="true"]', el);

      pulses.forEach((path, idx) => {
        const length = path.getTotalLength();
        const segLen = Math.min(90, length * 0.28);
        const gapLen = Math.max(length + segLen, 260);

        gsap.set(path, {
          strokeDasharray: `${segLen} ${gapLen}`,
          strokeDashoffset: segLen,
        });

        gsap.to(path, {
          strokeDashoffset: -gapLen,
          duration: 2.1 + (idx % 4) * 0.35,
          repeat: -1,
          ease: 'none',
          delay: (idx % 5) * 0.28,
        });
      });

      // Subtle core pulse on the AI chip frame
      gsap.to('[data-chip-core-pulse="true"]', {
        opacity: 0.75,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Gentle scroll expansion on the chip assembly
      if (triggerRef?.current) {
        gsap.to('[data-chip-assembly="true"]', {
          scale: 1.12,
          y: -24,
          ease: 'none',
          scrollTrigger: {
            trigger: triggerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, [triggerRef]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-10 flex items-center justify-center"
    >
      <svg
        viewBox="0 0 1440 820"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="chipBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(222,45,38,0.08)" />
          </linearGradient>
        </defs>

        <g data-chip-assembly="true" style={{ transformOrigin: '720px 410px' }}>
          {/* Base circuit traces */}
          <g stroke="rgba(255,255,255,0.09)" strokeWidth="1.2" fill="none">
            {CHIP_LINES.map((d, i) => (
              <path key={`base-line-${i}`} d={d} />
            ))}
          </g>

          {/* Chip pins */}
          <g stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round">
            {CHIP_PINS.map(([x, y], i) => (
              <line
                key={`pin-${i}`}
                x1={x}
                y1={y}
                x2={
                  x < 560
                    ? x + 16
                    : x > 880
                    ? x + 16
                    : x
                }
                y2={
                  y < 300
                    ? y + 16
                    : y > 515
                    ? y + 16
                    : y
                }
              />
            ))}
          </g>

          {/* Central AI Chip Package */}
          <rect
            x="540"
            y="290"
            width="360"
            height="240"
            rx="20"
            fill="url(#chipBodyGrad)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1.5"
          />
          <rect
            data-chip-core-pulse="true"
            x="585"
            y="330"
            width="270"
            height="160"
            rx="12"
            fill="none"
            stroke="#DE2D26"
            strokeWidth="1.2"
            strokeDasharray="8 6"
            opacity="0.35"
          />

          {/* Flowing electric current along the traces */}
          <g
            stroke="#DE2D26"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          >
            {CHIP_LINES.map((d, i) => (
              <path
                key={`current-line-${i}`}
                data-current-pulse="true"
                d={d}
              />
            ))}
          </g>

          {/* Bright current head markers */}
          <g fill="#ff6b66" opacity="0.85">
            <circle cx="540" cy="365" r="3" />
            <circle cx="540" cy="410" r="3" />
            <circle cx="900" cy="365" r="3" />
            <circle cx="900" cy="410" r="3" />
            <circle cx="720" cy="290" r="3" />
          </g>
        </g>
      </svg>
    </div>
  );
}