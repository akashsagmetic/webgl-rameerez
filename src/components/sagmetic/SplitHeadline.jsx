import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export default function SplitHeadline({ agencyRef }) {
  const headingRef = useRef(null);
  const boldLine1Ref = useRef(null);
  const boldLine2Ref = useRef(null);
  const serifLineRef = useRef(null);

  useEffect(() => {
    const root = headingRef.current;
    if (!root) return;

    let isCancelled = false;
    let ctx;

    const initAnimation = async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (isCancelled) return;

      ctx = gsap.context(() => {
        const splitLine1 = SplitText.create(boldLine1Ref.current, {
          type: 'chars',
        });
        const splitLine2 = SplitText.create(boldLine2Ref.current, {
          type: 'chars',
        });
        const splitSerif = SplitText.create(serifLineRef.current, {
          type: 'chars',
        });

        const allChars = [
          ...(splitLine1.chars || []),
          ...(splitLine2.chars || []),
          ...(splitSerif.chars || []),
        ];

        // Hide initially via GSAP so it won't fight Tailwind utility classes on clearProps
        gsap.set(root, {
          x: -64,
          autoAlpha: 0,
        });

        allChars.forEach((char, idx) => {
          gsap.set(char, {
            y: idx % 2 === 0 ? -36 : 36,
            autoAlpha: 0,
          });
        });

        const tl = gsap.timeline();

        tl.to(
          root,
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0
        ).to(
          allChars,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: {
              each: 0.025,
              from: 'start',
            },
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.08
        );

        return () => {
          splitLine1.revert();
          splitLine2.revert();
          splitSerif.revert();
        };
      }, root);
    };

    initAnimation();

    return () => {
      isCancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <h1
      ref={headingRef}
      className="overflow-visible font-futura-headline font-extrabold text-white text-[56px] leading-[54px] sm:text-[104px] sm:leading-[96px] lg:text-[166px] lg:leading-[148px]"
    >
      <span ref={boldLine1Ref} className="block">
        AI-Powered
      </span>
      <span ref={boldLine2Ref} className="block">
        Creative
      </span>
      <span
        ref={(node) => {
          serifLineRef.current = node;
          if (agencyRef) agencyRef.current = node;
        }}
        className="inline-block font-instrument-serif italic font-normal text-[#DE2D26] text-[56px] leading-[54px] sm:text-[104px] sm:leading-[96px] lg:text-[166px] lg:leading-[148px] will-change-transform"
      >
        Agency
      </span>
    </h1>
  );
}