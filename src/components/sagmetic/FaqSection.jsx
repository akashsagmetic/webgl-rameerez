import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const FAQ_ITEMS = [
  {
    id: "ai-services",
    question: "What AI services do you offer?",
    answer:
      "We build custom AI agents, RAG knowledge assistants, workflow automation pipelines, LLM integrations, and AI-powered web and mobile features tailored to your business operations.",
  },
  {
    id: "integrate-ai",
    question: "Can you integrate AI into my existing product?",
    answer:
      "Yes. We audit your current architecture, data flow, and UI touchpoints, then integrate AI search, smart recommendations, copilot assistants, or automated pipelines without disrupting existing users.",
  },
  {
    id: "technologies",
    question: "Which technologies do you use?",
    answer:
      "Our core stack includes React, Next.js, TypeScript, Python, Node.js, Tailwind CSS, GSAP, Three.js, OpenAI, LangChain, LlamaIndex, vector databases, and cloud infrastructure like Firebase and AWS.",
  },
  {
    id: "custom-models",
    question: "Do you build custom AI models?",
    answer:
      "When off-the-shelf foundation models aren't enough for domain accuracy, latency, or privacy, we fine-tune specialized models, build evaluation benchmarks, and design hybrid retrieval workflows.",
  },
  {
    id: "timeline",
    question: "How long does a typical project take?",
    answer:
      "Focused AI integrations or MVPs usually take 3 to 6 weeks, while full-scale web/app products with custom design systems and multi-step AI workflows typically span 6 to 12 weeks.",
  },
  {
    id: "post-launch",
    question: "Do you provide post-launch support?",
    answer:
      "Yes. Every launch includes performance and prompt/model monitoring, bug fixes, iterative UX refinements, and ongoing retainer support as your product scales.",
  },
];

export default function FaqSection({
  items = FAQ_ITEMS,
  onViewAllClick,
}) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingLine1Ref = useRef(null);
  const headingLine2Ref = useRef(null);
  const questionsWordRef = useRef(null);
  const viewAllBtnRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const panelRefs = useRef([]);

  const [openId, setOpenId] = useState(null);

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
        const splitLine1 = headingLine1Ref.current
          ? SplitText.create(headingLine1Ref.current, { type: "chars" })
          : null;
        const splitLine2 = headingLine2Ref.current
          ? SplitText.create(headingLine2Ref.current, { type: "chars" })
          : null;
        const splitQuestions = questionsWordRef.current
          ? SplitText.create(questionsWordRef.current, { type: "chars" })
          : null;

        const headingChars = [
          ...(splitLine1?.chars || []),
          ...(splitLine2?.chars || []),
          ...(splitQuestions?.chars || []),
        ];

        if (eyebrowRef.current) {
          gsap.set(eyebrowRef.current, { y: 16, autoAlpha: 0 });
        }
        if (headingChars.length) {
          gsap.set(headingChars, { y: 28, autoAlpha: 0 });
        }
        if (viewAllBtnRef.current) {
          gsap.set(viewAllBtnRef.current, { y: 18, scale: 0.96, autoAlpha: 0 });
        }

        if (headerRef.current) {
          const headerTl = gsap.timeline({
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 92%",
              end: "bottom 55%",
              scrub: 0.45,
            },
          });

          if (eyebrowRef.current) {
            headerTl.to(
              eyebrowRef.current,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.2,
                ease: "power2.out",
              },
              0
            );
          }

          if (headingChars.length) {
            headerTl.to(
              headingChars,
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.34,
                stagger: { each: 0.01, from: "start" },
                ease: "power3.out",
              },
              0.08
            );
          }

          if (viewAllBtnRef.current) {
            headerTl.to(
              viewAllBtnRef.current,
              {
                y: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.24,
                ease: "power2.out",
              },
              0.16
            );
          }
        }

        if (gridRef.current) {
          const cardsTl = gsap.timeline({
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 92%",
              end: "bottom 52%",
              scrub: 0.45,
            },
          });

          items.forEach((item, idx) => {
            const el = cardRefs.current[idx];
            if (!el) return;

            const isLeftCol = idx % 2 === 0;
            gsap.set(el, {
              x: isLeftCol ? -56 : 56,
              y: 32,
              autoAlpha: 0,
            });

            cardsTl.to(
              el,
              {
                x: 0,
                y: 0,
                autoAlpha: 1,
                duration: 0.36,
                ease: "power2.out",
              },
              idx * 0.04
            );
          });
        }

        return () => {
          splitLine1?.revert();
          splitLine2?.revert();
          splitQuestions?.revert();
        };
      }, root);
    };

    init();

    return () => {
      isCancelled = true;
      ctx?.revert();
    };
  }, [items]);

  const handleToggleItem = (id, idx) => {
    const nextId = openId === id ? null : id;
    setOpenId(nextId);

    items.forEach((item, panelIdx) => {
      const panelEl = panelRefs.current[panelIdx];
      if (!panelEl) return;

      const shouldOpen = item.id === nextId;
      gsap.to(panelEl, {
        height: shouldOpen ? panelEl.scrollHeight : 0,
        opacity: shouldOpen ? 1 : 0,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative z-10 w-full bg-white text-[#050505] overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32"
    >
      {/* Subtle Ambient Accent Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-120px] w-[420px] h-[420px] rounded-full blur-[130px] opacity-25 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(220,45,38,0.35) 0%, rgba(220,45,38,0) 72%)",
        }}
      />

      <div className="relative z-10 max-w-[1470px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* Header Row: Left Eyebrow + Headings | Right CTA Button */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 lg:mb-14"
        >
          <div>
            {/* Get answers to questions: Montserrat, weight=600, size=14px, lh=100%, ls=0% */}
            <p
              ref={eyebrowRef}
              className="text-[#DC2D26] text-[14px] leading-none tracking-[0] mb-3"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
              }}
            >
              Get answers to questions
            </p>

            {/* Heading: Futura Now Headline, weight=700, size=60px, lh=73px, ls=-2% */}
            <h2 className="overflow-visible font-futura-headline font-bold text-[#050505] text-[40px] leading-[48px] sm:text-[52px] sm:leading-[62px] lg:text-[60px] lg:leading-[73px] tracking-[-0.02em]">
              <span ref={headingLine1Ref} className="block">
                Frequently  Asked
              </span>
        
            </h2>

            {/* Questions: Instrument Serif, weight=400, size=60px, lh=100%, ls=0% */}
            <div
              ref={questionsWordRef}
              className="overflow-visible font-instrument-serif italic font-normal text-[#DC2D26] text-[44px] sm:text-[54px] lg:text-[60px] leading-none tracking-[0] mt-1"
            >
              Questions
            </div>
          </div>

          {/* Right Button: width=172px, height=54px, radius=160px, bg=#DC2D26 */}
          <button
            ref={viewAllBtnRef}
            type="button"
            onClick={onViewAllClick}
            className="w-[172px] h-[54px] rounded-[160px] bg-[#DC2D26] hover:bg-[#c3231d] active:scale-[0.98] transition-[background-color,transform] duration-200 text-white text-[13px] font-medium flex items-center justify-center shrink-0 cursor-pointer shadow-[0_10px_24px_rgba(220,45,38,0.22)] will-change-transform"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            View All FAQs
          </button>
        </div>

        {/* 2-Column Questions Grid (705px max card width, 149px min height, 25px radius, #DC2D261C 11% border) */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 xl:grid-cols-2 items-start gap-6 lg:gap-7 justify-items-center"
        >
          {items.map((item, idx) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                style={{
                  borderColor: "rgba(220, 45, 38, 0.11)",
                }}
                className="w-full max-w-[705px] min-h-[149px] rounded-[25px] border bg-white px-6 sm:px-8 py-6 flex flex-col justify-center will-change-transform"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => handleToggleItem(item.id, idx)}
                  className="w-full flex items-center justify-between gap-5 text-left cursor-pointer group"
                >
                  <span
                    className="text-[#111111] text-[18px] sm:text-[21px] leading-[1.35] font-medium group-hover:text-[#DC2D26] transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {item.question}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`shrink-0 w-9 h-9 rounded-full border border-[#DC2D26]/25 flex items-center justify-center text-[#111111] transition-transform duration-300 ${
                      isOpen ? "rotate-180 border-[#DC2D26] text-[#DC2D26]" : ""
                    }`}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      className="w-4 h-4"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <div
                  id={`faq-panel-${item.id}`}
                  ref={(el) => {
                    panelRefs.current[idx] = el;
                  }}
                  style={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p
                    className="pt-4 pr-2 text-[#524E4E] text-[15px] sm:text-[16px] leading-[25px]"
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}