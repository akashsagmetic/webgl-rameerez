import { useState } from 'react';

const DEFAULT_TOP_ROW_ITEMS = [
  {
    title: 'PROJECT 01',
    subtitle: 'Brand System',
    imageUrl: '/images/upimage1.png',
    fallbackGradient:
      'radial-gradient(circle at 40% 50%, rgba(161, 136, 115, 0.35), rgba(20, 20, 23, 0.92) 70%, #000000 100%)',
  },
  {
    title: 'SUSTAINABLE LIVING',
    subtitle: 'Web Experience',
    imageUrl: '/images/upimage2.png',
    fallbackGradient:
      'radial-gradient(circle at 50% 45%, rgba(120, 120, 130, 0.32), rgba(18, 18, 21, 0.94) 72%, #000000 100%)',
  },
  {
    title: 'JUSTINE HONEY',
    subtitle: 'Editorial Direction',
    imageUrl: '/images/upimage3.png',
    fallbackGradient:
      'radial-gradient(circle at 55% 45%, rgba(180, 120, 35, 0.32), rgba(20, 19, 17, 0.94) 72%, #000000 100%)',
  },
  {
    title: 'CLOVIO',
    subtitle: 'Identity & UI',
   imageUrl: '/images/upimage4.png',
    fallbackGradient:
      'radial-gradient(circle at 50% 50%, rgba(222, 45, 38, 0.28), rgba(18, 18, 20, 0.94) 72%, #000000 100%)',
  },
];

const DEFAULT_BOTTOM_ROW_ITEMS = [
  {
    title: 'MOBILE APP 01',
    subtitle: 'Product UI',
    imageUrl: '/images/image.png',
    fallbackGradient:
      'radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.35), rgba(16, 16, 22, 0.95) 72%, #000000 100%)',
  },
  {
    title: 'FINTECH SUITE',
    subtitle: 'iOS & Web',
    imageUrl: '/images/image2.png',
    fallbackGradient:
      'radial-gradient(circle at 45% 45%, rgba(148, 163, 184, 0.34), rgba(17, 17, 20, 0.95) 72%, #000000 100%)',
  },
  {
    title: 'TASKFLOW',
    subtitle: 'Dashboard System',
    imageUrl: '/images/image3.png',
    fallbackGradient:
      'radial-gradient(circle at 55% 50%, rgba(222, 45, 38, 0.32), rgba(16, 15, 18, 0.95) 72%, #000000 100%)',
  },
  {
    title: 'TRADING PRO',
    subtitle: 'Mobile Experience',
    imageUrl: '/images/image4.png',
    fallbackGradient:
      'radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.32), rgba(14, 18, 17, 0.95) 72%, #000000 100%)',
  },
];

const DEFAULT_MARQUEE_ITEMS = [
  { metric: 'Affordable Cost', label: 'Flexible Engagement' },
  { metric: '100%', label: 'Quality of Work' },
  { metric: '200+', label: 'Applications Built' },
  { metric: '20+', label: 'Advanced Certifications' },
  { metric: '10+', label: 'Years of Experience' },
  { metric: '3000+', label: 'Satisfied Customers' },
  { metric: '99%', label: 'Client Retention' },
];

function TorchBlendedImage({
  item,
  baseOpacity = 0.75,
  blurPx = 2.5,
  heightClass = 'h-[195px] sm:h-[225px]',
}) {
  const [torch, setTorch] = useState({
    x: 50,
    y: 50,
    active: false,
  });

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTorch({ x, y, active: true });
  };

  const handlePointerLeave = () => {
    setTorch((prev) => ({ ...prev, active: false }));
  };

  const torchMask = torch.active
    ? `radial-gradient(circle 105px at ${torch.x}% ${torch.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0) 100%)`
    : 'radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)';

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative ${heightClass} w-full overflow-hidden rounded-xl select-none`}
    >
      {/* Dim, slightly blurred, background-blended base layer */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: baseOpacity,
          filter: `blur(${blurPx}px)`,
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover brightness-75 contrast-110"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col justify-end p-4"
            style={{ background: item.fallbackGradient }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              {item.subtitle}
            </span>
            <span className="text-sm font-bold tracking-tight text-zinc-200">
              {item.title}
            </span>
          </div>
        )}
      </div>

      {/* Torch / flashlight spotlight: reveals only a crisp circle around the pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          opacity: torch.active ? 1 : 0,
          WebkitMaskImage: torchMask,
          maskImage: torchMask,
        }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover brightness-105 contrast-110"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col justify-end p-4"
            style={{ background: item.fallbackGradient }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-200">
              {item.subtitle}
            </span>
            <span className="text-sm font-bold tracking-tight text-white">
              {item.title}
            </span>
          </div>
        )}
      </div>

      {/* Smooth blend into #000000 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.88) 100%)',
        }}
      />
    </div>
  );
}

const ShowcaseSliderSection = ({
  onContactClick,
  onLearnMoreClick,
  topRowItems = DEFAULT_TOP_ROW_ITEMS,
  bottomRowItems = DEFAULT_BOTTOM_ROW_ITEMS,
  marqueeItems = DEFAULT_MARQUEE_ITEMS,
}) => {
  const repeatedMarquee = [...marqueeItems, ...marqueeItems];

  return (
    <div id="about" className="relative z-20 w-full pt-8 pb-6 bg-[#000000]">
      {/* Floating Circular Contact Badge */}
      <button
        type="button"
        onClick={onContactClick}
        aria-label="Contact Us"
        className="hidden md:flex items-center justify-center absolute right-8 top-6 z-30 w-20 h-20 rounded-full bg-zinc-900/75 border border-white/15 backdrop-blur-md hover:border-[#DE2D26] hover:scale-105 transition cursor-pointer"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-[spin_16s_linear_infinite]"
        >
          <defs>
            <path
              id="contactCirclePath"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            />
          </defs>
          <text
            fill="#d4d4d8"
            fontSize="9.5"
            fontWeight="600"
            letterSpacing="3.4"
          >
            <textPath href="#contactCirclePath">
              CONTACT US • CONTACT US •
            </textPath>
          </text>
        </svg>
        <span className="absolute w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs shadow">
          ✉
        </span>
      </button>

      {/* About Heading, Paragraph & Learn More Button */}
      <div className="relative z-20 max-w-[760px] mx-auto px-6 pt-6 pb-2 text-center flex flex-col items-center">
        <span
          className="text-[14px] font-semibold tracking-[0.04em] bg-clip-text text-transparent"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            backgroundImage:
              'linear-gradient(90deg, #DE2D26 0%, #FFFFFF 50%, #DC2D26 100%)',
          }}
        >
          About Sagmetic Infotech
        </span>

        <h2
          className="mt-2.5 text-[30px] leading-[38px] sm:text-[38px] sm:leading-[46px] font-bold text-white"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          We Do Design, Code &amp;
          <br />
          Develop.
        </h2>

        <p
          className="mt-5 text-[16px] leading-[26px] sm:text-[18px] sm:leading-[28px] font-medium text-zinc-300"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          &ldquo;We do design, code, &amp; develop&rdquo; is more than simply a tagline; it
          captures our enthusiasm for developing creative and significant digital solutions.
          Our team of skilled designers and developers work in perfect harmony to bring your
          ideas to life. From crafting beautiful user interfaces to writing efficient code, we
          approach every project with the same level of dedication and attention to detail.
          Allow us to help turn your dream into a tangible reality.
        </p>

        <button
          type="button"
          onClick={onLearnMoreClick}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#DE2D26] hover:bg-[#c5241e] px-8 py-2.5 text-[16px] leading-[28px] font-medium text-white shadow-[0_10px_30px_rgba(222,45,38,0.35)] transition cursor-pointer"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Learn More
        </button>
      </div>

      {/* Stacked 2 Rows of 4 Individual Images: First row sits higher behind para & Learn More button */}
      <div className="relative w-full overflow-hidden -mt-36 sm:-mt-40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#000000] to-transparent z-10"
        />

        <div className="-mx-10 sm:-mx-16 lg:-mx-24 px-2 flex flex-col gap-3">
          {/* Row 1: Higher up behind paragraph & Learn More button; lower parts show subtly */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {topRowItems.slice(0, 4).map((item) => (
              <TorchBlendedImage
                key={item.title}
                item={item}
                baseOpacity={0.26}
                blurPx={3}
                heightClass="h-[220px] sm:h-[250px]"
              />
            ))}
          </div>

          {/* Row 2: Below first row, higher visibility */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {bottomRowItems.slice(0, 4).map((item) => (
              <TorchBlendedImage
                key={item.title}
                item={item}
                baseOpacity={0.78}
                blurPx={2}
                heightClass="h-[195px] sm:h-[225px]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Continuous Marquee Strip (Pauses on Hover) */}
      <div className="sagmetic-marquee-wrap relative w-full overflow-hidden mt-8 border-y border-white/[0.06] bg-[#070303] py-3.5">
        <div className="sagmetic-marquee-track">
          {repeatedMarquee.map((item, idx) => (
            <div
              key={`${item.metric}-${idx}`}
              className="mx-3 flex items-baseline gap-2.5 rounded-lg bg-[#160707]/80 px-4 py-2 text-left whitespace-nowrap"
            >
              <span className="text-sm font-bold text-white">{item.metric}</span>
              <span className="text-xs text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSliderSection;