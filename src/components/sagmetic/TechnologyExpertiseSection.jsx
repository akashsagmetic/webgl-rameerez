import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function TechnologyExpertiseSection() {
  const sectionRef = useRef(null);
  const incomingLineRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const line4Ref = useRef(null);
  const paraRef = useRef(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    let isCancelled = false;
    let ctx;

    const init = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      ctx = gsap.context(() => {
        const split1 = SplitText.create(line1Ref.current, { type: "chars" });
        const split2 = SplitText.create(line2Ref.current, { type: "chars" });
        const split3 = SplitText.create(line3Ref.current, { type: "chars" });
        const split4 = SplitText.create(line4Ref.current, { type: "chars" });
        const splitPara = SplitText.create(paraRef.current, {
          type: "lines",
          mask: "lines",
        });

        const headingChars = [
          ...(split1.chars || []),
          ...(split2.chars || []),
          ...(split3.chars || []),
          ...(split4.chars || []),
        ];
        const paraLines = splitPara.lines || [];

        if (incomingLineRef.current) {
          const len = incomingLineRef.current.getTotalLength();
          gsap.set(incomingLineRef.current, {
            strokeDasharray: len,
            strokeDashoffset: len,
          });
        }

        gsap.set(headingChars, {
          y: 28,
          autoAlpha: 0,
        });

        gsap.set(paraLines, {
          yPercent: 105,
          autoAlpha: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 88%",
            end: "bottom 45%",
            scrub: 0.65,
          },
        });

        if (incomingLineRef.current) {
          tl.to(
            incomingLineRef.current,
            {
              strokeDashoffset: 0,
              duration: 0.25,
              ease: "none",
            },
            0
          );
        }

        tl.to(
          headingChars,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            stagger: { each: 0.01, from: "start" },
            ease: "power3.out",
          },
          0.12
        ).to(
          paraLines,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.28,
            stagger: 0.07,
            ease: "power3.out",
          },
          0.28
        );

        return () => {
          split1.revert();
          split2.revert();
          split3.revert();
          split4.revert();
          splitPara.revert();
        };
      }, root);
    };

    init();

    return () => {
      isCancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="technology-expertise"
      className="relative z-10 w-full overflow-hidden bg-white text-[#000000] -mt-px pt-24 pb-20 lg:pt-32 lg:pb-24"
    >
      {/* Circuit line starting flush at the top seam so it touches the line above with zero displacement */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1600 680"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      >
        <path
          d="M 1248 0 L 1248 90 L 1040 160 L 800 160"
          fill="none"
          stroke="rgba(220,45,38,0.12)"
          strokeWidth="1.5"
        />
        <path
          ref={incomingLineRef}
          d="M 1248 0 L 1248   90 L 1040 160 L 800 160"
          fill="none"
          stroke="#DC2D26"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="max-w-[1160px] mx-auto text-center">
          <h2 className="overflow-visible font-futura-headline font-extrabold text-[#000000] text-[44px] leading-[1.05] sm:text-[78px] lg:text-[118px] lg:leading-[1.04] tracking-[0]">
            <span ref={line1Ref} className="block">
              Bring To
            </span>
            <span ref={line2Ref} className="block">
              Gether Technology,
            </span>
            <span ref={line3Ref} className="block">
              Creativity And
            </span>
            <span
              ref={line4Ref}
              className="block font-instrument-serif italic font-normal text-[#DC2D26] text-[48px] sm:text-[82px] lg:text-[116px] lg:leading-[148px] tracking-[0]"
            >
              AI Expertise
            </span>
          </h2>

          <p
            ref={paraRef}
            className="mt-5 max-w-[680px] mx-auto text-[#524E4E] text-[18px] leading-[28px] sm:text-[22px] sm:leading-[32px] tracking-[0]"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
            }}
          >
            We blend design, development and artificial intelligence to craft
            digital products that are modern, scalable and result-driven.
          </p>
        </div>
      </div>
    </section>
  );
}