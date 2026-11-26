import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import RobotMascot from "../robotmascot/RobotMascot";


export default function FloatingMascotDock({
  footerRef,
  splashHoldMs = 1100,
  settleDuration = 1.45,
  onSplashComplete,
}) {
  const dockRef = useRef(null);
  const backdropRef = useRef(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onSplashComplete);
  onCompleteRef.current = onSplashComplete;

  const [hiddenAtFooter, setHiddenAtFooter] = useState(false);
  const [splashActive, setSplashActive] = useState(true);

  const finishSplash = () => {
    setSplashActive(false);
    window.dispatchEvent(new Event("resize"));
    if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  useEffect(() => {
    const dockEl = dockRef.current;
    const backdropEl = backdropRef.current;
    if (!dockEl) return;

    if (window.innerWidth < 1024) {
      gsap.set(dockEl, {
        xPercent: -50,
        yPercent: 0,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });
      if (backdropEl) gsap.set(backdropEl, { autoAlpha: 0 });
      finishSplash();
      return;
    }

    const totalMs = Math.round((splashHoldMs / 1000 + settleDuration) * 1000) + 120;
    const fallbackTimer = window.setTimeout(() => {
      finishSplash();
    }, totalMs);

    const ctx = gsap.context(() => {
      gsap.set(dockEl, {
        xPercent: -50,
        yPercent: -36,
        y: 0,
        scale: 1.75,
        transformOrigin: "center bottom",
        autoAlpha: 1,
      });

      if (backdropEl) {
        gsap.set(backdropEl, { autoAlpha: 1 });
      }

      const tl = gsap.timeline({
        delay: splashHoldMs / 1000,
        onComplete: () => {
          window.clearTimeout(fallbackTimer);
          finishSplash();
        },
      });

      const earlyTriggerOffset = Math.max(0.1, settleDuration - 0.3);

    tl.to(
  dockEl,
  {
    yPercent: 0,
    y: 0,
    scale: 1,
    duration: settleDuration,
    ease: "power3.inOut",
  },
  0
).call(
  () => {
    window.clearTimeout(fallbackTimer);
    finishSplash();
  },
  null,
  earlyTriggerOffset
);

      if (backdropEl) {
        tl.to(
          backdropEl,
          {
            autoAlpha: 0,
            duration: settleDuration * 0.78,
            ease: "power2.out",
          },
          0.25
        );
      }
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      ctx.revert();
    };
  }, [splashHoldMs, settleDuration]);

  useEffect(() => {
    const checkVisibility = () => {
      if (window.innerWidth < 1024) {
        setHiddenAtFooter(true);
        return;
      }

      const footerEl = footerRef?.current;
      const nearBottomOfPage =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 40;

      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        const footerInView =
          rect.top <= window.innerHeight * 0.95 && rect.bottom >= 0;
        setHiddenAtFooter(footerInView || nearBottomOfPage);
      } else {
        setHiddenAtFooter(nearBottomOfPage);
      }
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility);

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [footerRef]);

  useEffect(() => {
    const dockEl = dockRef.current;
    if (!dockEl || splashActive || window.innerWidth < 1024) return;

    gsap.to(dockEl, {
      autoAlpha: hiddenAtFooter ? 0 : 1,
      y: hiddenAtFooter ? 18 : 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  }, [hiddenAtFooter, splashActive]);

  return (
    <>
      <div
        ref={backdropRef}
        aria-hidden={!splashActive}
        className={`hidden lg:flex fixed inset-0 bg-[#050303] items-end justify-center pb-10 ${
          splashActive ? "z-40 pointer-events-auto" : "z-40 pointer-events-none"
        }`}
      >
        <span
          className="text-[11px] uppercase tracking-[0.28em] text-zinc-400"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Sagmetic Infotech
        </span>
      </div>

      <div
        ref={dockRef}
        aria-hidden={hiddenAtFooter && !splashActive}
        className={`hidden lg:block fixed bottom-4 sm:bottom-6 left-1/2 w-[250px] h-[220px] sm:w-[310px] sm:h-[265px] will-change-transform ${
          splashActive ? "z-50" : "z-40"
        } ${hiddenAtFooter && !splashActive ? "pointer-events-none" : ""}`}
      >
        <RobotMascot
          positionX={0}
          splashActive={splashActive}
          className="w-full h-full"
        />
      </div>
    </>
  );
}