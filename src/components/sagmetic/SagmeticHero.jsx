import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import SagmeticLogo3D from './SagmeticLogo3D';
import ShowcaseSliderSection from './ShowcaseSliderSection';

const NAV_ITEMS = [
  { label: 'Home', href: '#home', active: true },
  { label: 'About Us', href: '#about' },
  { label: 'Services', href: '#services', hasDropdown: true },
  { label: 'Case Study', href: '#case-study' },
  { label: 'Careers', href: '#careers' },
  { label: 'FAQ', href: '#faq' },
];

const DIRECTION_VECTORS = [
  { x: 0, y: -130, rot: -8 },
  { x: 0, y: 130, rot: 8 },
  { x: -120, y: 0, rot: -10 },
  { x: 120, y: 0, rot: 10 },
  { x: -95, y: -105, rot: -12 },
  { x: 95, y: -105, rot: 12 },
  { x: -95, y: 105, rot: 9 },
  { x: 95, y: 105, rot: -9 },
];

function SplitHeadlineLine({ text, lineIndex }) {
  const words = text.split(' ');
  let charCounter = lineIndex * 11;

  return (
    <span className="block">
      {words.map((word, wordIdx) => (
        <span
          key={`${word}-${wordIdx}`}
          className="inline-block whitespace-nowrap"
        >
          {Array.from(word).map((char, charIdx) => {
            const vec = DIRECTION_VECTORS[charCounter % DIRECTION_VECTORS.length];
            charCounter += 1;

            return (
              <span
                key={`${char}-${charIdx}`}
                data-hero-char="true"
                data-from-x={vec.x}
                data-from-y={vec.y}
                data-from-rot={vec.rot}
                className="inline-block will-change-transform"
              >
                {char}
              </span>
            );
          })}
          {wordIdx < words.length - 1 && (
            <span
              data-hero-char="true"
              data-from-x={0}
              data-from-y={70}
              data-from-rot={0}
              className="inline-block w-[0.26em]"
              aria-hidden="true"
            >
              {'\u00A0'}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

const SagmeticHero = ({ onContactClick, onLearnMoreClick }) => {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [loadingReflectionBoost, setLoadingReflectionBoost] = useState(1.65);

  const heroRef = useRef(null);
  const splashRef = useRef(null);
  const splashRedGlowRef = useRef(null);
  const splashLogoRef = useRef(null);
  const heroLogoSlotRef = useRef(null);

  useEffect(() => {
    const rootEl = heroRef.current;
    const splashEl = splashRef.current;
    const splashRedGlowEl = splashRedGlowRef.current;
    const splashLogoEl = splashLogoRef.current;
    const slotEl = heroLogoSlotRef.current;
    if (!rootEl || !splashEl || !splashLogoEl || !slotEl) return;

    let cancelled = false;
    let hasStarted = false;
    let ctx;
    const boostState = { value: 0.7 };
    let lastBoost = 0.7;

    const syncBoost = () => {
      if (Math.abs(boostState.value - lastBoost) > 0.02) {
        lastBoost = boostState.value;
        setLoadingReflectionBoost(boostState.value);
      }
    };

    const startTimeline = () => {
      if (cancelled || hasStarted) return;
      hasStarted = true;

      ctx = gsap.context(() => {
        const chars = gsap.utils.toArray('[data-hero-char="true"]', rootEl);

        gsap.set(chars, {
          opacity: 0,
          x: (_, el) => Number(el.dataset.fromX || 0),
          y: (_, el) => Number(el.dataset.fromY || 0),
          rotation: (_, el) => Number(el.dataset.fromRot || 0),
          scale: 0.85,
        });

        gsap.set('[data-hero-eyebrow="true"]', {
          opacity: 0,
          y: 16,
        });

        gsap.set(slotEl, {
          opacity: 0,
          scale: 1,
        });

        const getMetrics = () => {
          const slotRect = slotEl.getBoundingClientRect();
          const splashRect = splashLogoEl.getBoundingClientRect();
          const slotCenterX = slotRect.left + slotRect.width / 2;
          const slotCenterY = slotRect.top + slotRect.height / 2;
          const winCenterX = window.innerWidth / 2;
          const winCenterY = window.innerHeight / 2;
          const downScale = Math.min(1, slotRect.width / Math.max(splashRect.width, 1));

          return {
            dx: slotCenterX - winCenterX,
            dy: slotCenterY - winCenterY,
            downScale,
          };
        };

        const { dx, dy, downScale } = getMetrics();

        gsap.set(splashEl, { opacity: 1, display: 'flex', pointerEvents: 'auto' });
        gsap.set(splashLogoEl, {
          x: 0,
          y: 0,
          scale: 1,
          transformOrigin: 'center center',
          opacity: 1,
        });

        if (splashRedGlowEl) {
          gsap.set(splashRedGlowEl, {
            x: 0,
            y: 0,
            opacity: 0.65,
            scale: 1,
            transformOrigin: 'center center',
          });
        }

        boostState.value = 0.7;
        lastBoost = 0.7;
        setLoadingReflectionBoost(0.7);

        const tl = gsap.timeline();

        // 1. Ramp reflection up on loading screen, then ease down smoothly
        tl.to(boostState, {
          value: 1.9,
          duration: 0.55,
          ease: 'sine.inOut',
          onUpdate: syncBoost,
        })
          .to(
            splashRedGlowEl,
            {
              opacity: 0.95,
              duration: 0.55,
              ease: 'sine.inOut',
            },
            '<'
          )
          .to(boostState, {
            value: 0.15,
            duration: 0.75,
            ease: 'sine.inOut',
            onUpdate: syncBoost,
          })
          .to(
            splashRedGlowEl,
            {
              opacity: 0.25,
              duration: 0.75,
              ease: 'sine.inOut',
            },
            '<'
          )

          // 2. Gentle, unhurried shrink into hero slot with soft crossfade
          .to(splashLogoEl, {
            x: dx,
            y: dy,
            scale: downScale,
            duration: 1.65,
            ease: 'sine.inOut',
          })
          .to(
            splashRedGlowEl,
            {
              x: dx,
              y: dy,
              scale: 0.7,
              opacity: 0,
              duration: 1.45,
              ease: 'sine.inOut',
            },
            '<'
          )
          .to(
            boostState,
            {
              value: 0,
              duration: 1.1,
              ease: 'sine.out',
              onUpdate: syncBoost,
            },
            '<'
          )
          .to(
            slotEl,
            {
              opacity: 1,
              duration: 0.5,
              ease: 'sine.inOut',
            },
            '-=0.55'
          )
          .to(
            splashEl,
            {
              opacity: 0,
              duration: 0.45,
              ease: 'sine.out',
              onComplete: () => {
                setLoadingReflectionBoost(0);
                gsap.set(splashEl, { pointerEvents: 'none', display: 'none' });
              },
            },
            '-=0.35'
          )

          // 3. Reveal eyebrow and animate each character from its direction
          .to(
            '[data-hero-eyebrow="true"]',
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power3.out',
            },
            '-=0.1'
          )
          .to(
            chars,
            {
              opacity: 1,
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: 1.0,
              ease: 'power4.out',
              stagger: {
                amount: 0.45,
                from: 'random',
              },
            },
            '-=0.35'
          );
      }, rootEl);
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const safetyTimer = window.setTimeout(startTimeline, 1000);

    fontsReady.then(() => {
      window.clearTimeout(safetyTimer);
      requestAnimationFrame(startTimeline);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimer);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full overflow-hidden bg-[#000000] text-white selection:bg-[#DE2D26] selection:text-white"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Loading Splash Layer */}
      <div
        ref={splashRef}
        aria-hidden="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]"
      >
        <div
          ref={splashRedGlowRef}
          className="pointer-events-none absolute w-[714px] h-[714px] rounded-full blur-[130px] will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(222,45,38,0.78) 0%, rgba(220,46,39,0.34) 45%, rgba(0,0,0,0) 74%)',
          }}
        />

        <div
          ref={splashLogoRef}
          className="relative z-10 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] will-change-transform"
        >
          <SagmeticLogo3D loadingReflectionBoost={loadingReflectionBoost} />
        </div>
      </div>

      {/* Top #DE2D26 Red Radial Blur Glow (714px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-[260px] -translate-x-1/2 w-[714px] h-[714px] rounded-full opacity-55 blur-[150px]"
        style={{
          background:
            'radial-gradient(circle, rgba(222,45,38,0.72) 0%, rgba(220,46,39,0.28) 48%, rgba(0,0,0,0) 75%)',
        }}
      />

      {/* Subtle Perspective Wireframe Grid Overlay */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 520"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 w-full h-[520px] opacity-[0.14]"
      >
        <defs>
          <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DE2D26" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#gridFade)" strokeWidth="1" fill="none">
          {Array.from({ length: 19 }).map((_, idx) => {
            const x = idx * 80;
            return (
              <path
                key={`v-${idx}`}
                d={`M ${x} 0 Q ${x + (idx - 9) * 14} 220 ${x} 520`}
              />
            );
          })}
          {Array.from({ length: 9 }).map((_, idx) => {
            const y = 36 + idx * 54;
            const arch = Math.sin((idx / 8) * Math.PI) * 55;
            return (
              <path
                key={`h-${idx}`}
                d={`M 0 ${y + arch * 0.4} Q 420 ${y - arch} 720 ${y + arch * 0.35} T 1440 ${y}`}
              />
            );
          })}
        </g>
      </svg>

      {/* Pill Navigation Bar */}
      <header className="relative z-30 max-w-[1040px] mx-auto px-4 pt-6">
        <nav className="flex items-center justify-between rounded-full border border-white/[0.09] bg-[#0c0606]/70 backdrop-blur-md px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.65)]">
          <a href="#home" className="flex items-center gap-2.5 group">
            <svg
              width="28"
              height="24"
              viewBox="0 0 270 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M216.503 48.1351C225.747 35.4787 237.009 36.5951 237.076 36.6019C274.174 69.3195 235.479 121.111 235.479 121.111C183.412 188.109 102.169 203.567 102.169 203.567C123.865 195.315 142.147 185.78 157.213 176.347C156.665 176.69 156.113 177.035 155.556 177.378L111.794 183.596L126.347 152.994L200.805 142.415C209.057 134.321 213.01 129.061 213.01 129.061L212.599 129.589C211.775 130.63 209.705 133.163 206.33 136.768C206.733 132.945 205.523 128.174 197.492 127.052L133.112 136.199C132.973 136.19 104.228 134.163 101.296 109.714C98.4127 85.1939 125.33 72.5043 125.44 72.4524L219.932 58.7248L205.848 90.104L136.511 99.9556C136.489 99.962 132.811 101.033 133.279 104.329C133.739 107.566 138.203 107.777 138.226 107.778L199.892 99.0168C199.892 99.0168 219.688 99.3464 223.798 111.992C222.4 114.59 220.83 117.283 219.075 120.075C253.428 65.4619 216.637 48.1975 216.503 48.1351Z"
                fill="#FFFFFF"
              />
              <circle cx="213" cy="40" r="6" fill="#DE2D26" />
              <circle cx="223" cy="31" r="5" fill="#DE2D26" />
              <circle cx="203" cy="36" r="4.5" fill="#DE2D26" />
              <circle cx="195" cy="28" r="4" fill="#DE2D26" />
              <circle cx="213" cy="30" r="3.5" fill="#DE2D26" />
            </svg>
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold tracking-[0.14em] text-white">
                SAGMETIC INFOTECH
              </span>
              <span className="text-[7px] tracking-[0.18em] text-zinc-400 text-right mt-0.5">
                vivid creations
              </span>
            </div>
          </a>

          <ul className="hidden md:flex items-center gap-7 text-[12px] font-medium text-zinc-400">
            {NAV_ITEMS.map((item) => (
              <li key={item.label} className="relative">
                {item.hasDropdown ? (
                  <button
                    type="button"
                    onClick={() => setServicesOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1 hover:text-white transition cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px]">⌄</span>
                  </button>
                ) : (
                  <a
                    href={item.href}
                    className={`transition ${
                      item.active ? 'text-zinc-200' : 'hover:text-white'
                    }`}
                  >
                    {item.label}
                  </a>
                )}

                {item.hasDropdown && servicesOpen && (
                  <div className="absolute left-0 top-8 w-44 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-md p-2 text-xs text-zinc-300 shadow-xl">
                    <a
                      href="#services"
                      className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white"
                    >
                      UI/UX &amp; Brand Design
                    </a>
                    <a
                      href="#services"
                      className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white"
                    >
                      3D &amp; WebGL Experiences
                    </a>
                    <a
                      href="#services"
                      className="block rounded-lg px-3 py-2 hover:bg-white/5 hover:text-white"
                    >
                      Full-Stack Development
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onContactClick}
            className="rounded-full bg-[#241616] hover:bg-[#DE2D26] border border-white/10 px-5 py-2 text-[12px] font-medium text-white transition cursor-pointer"
          >
            Contact Us
          </button>
        </nav>
      </header>

      {/* Main Hero Display Block */}
      <div className="relative z-20 max-w-[1360px] mx-auto px-4 pt-16 sm:pt-20 pb-14 flex flex-col items-center text-center">
        <span
          data-hero-eyebrow="true"
          className="text-[14px] font-semibold tracking-[0.04em] bg-clip-text text-transparent mb-3"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            backgroundImage: 'linear-gradient(90deg, #DE2D26 0%, #FFFFFF 50%, #DC2D26 100%)',
          }}
        >
          Design In Details
        </span>

        <div className="relative w-full flex items-center justify-center select-none">
          <h1
            className="uppercase text-[#FFFFFF] font-medium tracking-[-0.01em] text-[64px] leading-[64px] sm:text-[116px] sm:leading-[112px] lg:text-[164px] lg:leading-[156px] xl:text-[196px] xl:leading-[186px]"
            style={{
              fontFamily: "'OPTIGaucho', 'Arial Narrow', sans-serif",
              fontWeight: 500,
              fontSynthesis: 'none',
            }}
          >
            <SplitHeadlineLine text="HIGH END" lineIndex={0} />
            <SplitHeadlineLine text="CREATIVE AGENCY" lineIndex={1} />
          </h1>

          <div
            ref={heroLogoSlotRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] pointer-events-auto">
              <SagmeticLogo3D />
            </div>
          </div>
        </div>
      </div>

      {/* Showcase + About + Marquee Section */}
      <ShowcaseSliderSection
        onContactClick={onContactClick}
        onLearnMoreClick={onLearnMoreClick}
      />
    </section>
  );
};

export default SagmeticHero;