/**
 * Javi — the portrait: the plushie engine set up with his faces, his eyes,
 * the things he does when he's left alone, and the props that go with them.
 *
 * The page provides an element holding the plain photograph (the theme's
 * template-parts/content/portrait.php):
 *
 *     <div class="plush" data-images="/…/assets/images/face" data-version="…"><img src="…/smile.webp"></div>
 *
 * and this builds the rest inside it. Styles are in assets/css/face.css.
 *
 *     const { plush, squeak, setFrame, destroy, eyes } = await createJavi(element);
 *
 * He is handed over as soon as he's up; `eyes` is a promise that settles
 * once his eyes have been fitted (or turned out not to be available).
 *
 * Everything in `overrides` is passed to the engine on top of what's here.
 */
import { createPlushie } from "./plushie.js";
import { attachSqueak } from "./squeak.js";

// The shapes he can sit in: the bust is clipped to it and the head pops out.
// Their geometry is in assets/css/face.css, which draws the shape and clips
// the plain photograph; the engine is given the same numbers, read from there.
export const FRAMES = { circle: "Circle", square: "Block", none: "None" };

// Where things are on this particular photograph, in image space.
const SPOT = {
  nose: [0.5, 0.455],
  brow: [0.57, 0.3],
  cheek: [0.63, 0.51],
  mouth: [0.5, 0.535],
};

const FACES = ["smile", "annoyed-2", "shock", "ouch", "dizzy", "deadpan", "yawn-1", "yawn-2", "yawn-3", "yawn-4", "whistle-1", "whistle-2"];

// The faces he pulls when he's handled (see `reactions` in the engine).
const REACTIONS = {
  hovered: ["annoyed-2", "deadpan"],
  held: ["shock", "ouch"],
  pulled: ["ouch", "shock"],
  tapped: ["shock"],
  dazed: ["dizzy", "ouch"],
  fedUp: ["deadpan", "dizzy"],
};

// What he does when the page goes quiet. Frames are [show, fade ms, hold ms]
// or { show, fade, hold, … }; see the engine for what the extras mean.
// `label` is what the act is called and `doing` what he's up to during it,
// for anything that lists or reports them (the Face Lab).
export const ACTS = {
  yawn: {
    label: "Yawn",
    doing: "Yawning",
    frames: [["yawn-1", 140, 220], ["yawn-2", 140, 180], ["yawn-3", 160, 850], ["yawn-2", 150, 120], ["yawn-4", 180, 650]],
  },
  whistle: {
    label: "Whistle",
    doing: "Whistling",
    frames: [["whistle-1", 160, 760], ["whistle-2", 110, 760], ["whistle-1", 110, 700], ["whistle-2", 110, 640]],
    bob: 1,
  },
  // The next two need no pictures of their own: they pose the eyes with
  // cells from the eye sheet.
  shifty: {
    label: "Shifty eyes",
    doing: "Being shifty",
    frames: [["look-w", 60, 560], ["look-e", 60, 620], ["look-w", 60, 420], ["rest", 60, 300]],
  },
  eyeroll: {
    label: "Eye roll",
    doing: "Rolling his eyes",
    frames: [
      ["look-w", 70, 220], ["look-wnw", 60, 60], ["look-nw", 60, 60], ["look-nnw", 60, 70],
      ["look-n", 60, 150], ["look-ne", 60, 70], ["look-ene", 60, 60], ["look-e", 60, 260], ["rest", 90, 250],
    ],
  },
  // Dozing off: lids droop, he fights it, loses, and his head sinks to one
  // side until he jolts awake — at once if the visitor does anything,
  // otherwise by himself.
  doze: {
    label: "Doze off",
    doing: "Dozing off",
    frames: [
      { show: "half", fade: 500, hold: 800, tilt: 0.02 },
      { show: "closed", fade: 350, hold: 550, tilt: 0.05, drop: 0.008 },
      { show: "half", fade: 220, hold: 380, tilt: 0.015 },
      { show: "closed", fade: 450, hold: 4200, tilt: 0.09, drop: 0.016, wake: true },
      { show: "shock", fade: 60, hold: 700, jolt: true },
    ],
  },
  // Somebody else's cursor wanders in, takes him by the cheek, pulls it out,
  // gives it a waggle and lets go. The grip is the same physics as a
  // visitor's grab.
  tug: {
    label: "Cheek tug",
    doing: "Being tugged",
    handFrom: [1.3, 0.86],
    frames: [
      // (The glance is a nicety; the tug must play even if his eyes never arrive.)
      { show: "look-ese", fade: 60, hold: 700, hand: SPOT.cheek, optional: true },
      { show: "shock", fade: 70, hold: 240, hand: SPOT.cheek, grip: true },
      { show: "ouch", fade: 80, hold: 560, hand: [0.93, 0.49], grip: true },
      { show: "ouch", fade: 0, hold: 230, hand: [0.86, 0.54], grip: true },
      { show: "ouch", fade: 0, hold: 230, hand: [0.96, 0.47], grip: true },
      { show: "ouch", fade: 0, hold: 260, hand: [0.9, 0.5], grip: true },
      { show: "dizzy", fade: 90, hold: 950, hand: [1.35, 0.25] },
    ],
  },
  // A fly. It buzzes around him while his eyes follow it, lands on his nose,
  // and has to be blown off — twice, because the first puff only makes it hop.
  fly: {
    label: "Fly",
    doing: "Bothered by a fly",
    prop: "fly",
    handFrom: [1.45, 0.05],
    frames: [
      { show: "rest", watch: true, fade: 60, hold: 560, hand: [0.93, 0.2] },
      { show: "rest", watch: true, fade: 60, hold: 600, hand: [0.1, 0.34] },
      { show: "rest", watch: true, fade: 60, hold: 560, hand: [0.88, 0.66] },
      { show: "rest", watch: true, fade: 60, hold: 520, hand: [0.2, 0.62] },
      { show: "rest", watch: true, fade: 60, hold: 420, hand: SPOT.nose },
      { show: "deadpan", fade: 110, hold: 950, hand: SPOT.nose, jolt: [...SPOT.nose, 0, 0.012] },
      { show: "whistle-1", fade: 90, hold: 330, hand: SPOT.nose },
      { show: "whistle-1", fade: 0, hold: 300, hand: SPOT.brow },
      { show: "deadpan", fade: 110, hold: 420, hand: SPOT.nose },
      { show: "deadpan", fade: 0, hold: 520, hand: SPOT.nose, jolt: [...SPOT.nose, 0, 0.012] },
      { show: "whistle-2", fade: 90, hold: 300, hand: SPOT.nose },
      { show: "whistle-2", fade: 0, hold: 520, hand: [1.5, -0.35] },
      { show: "rest", watch: true, fade: 120, hold: 500, hand: [1.7, -0.5] },
    ],
  },
};

// Everything the engine draws into or the acts put in front of him.
const PARTS = `
  <canvas></canvas>
  <!-- What takes the pointer. A button, so that he can be reached and poked
       without one: by keyboard, or by a screen reader's double tap. -->
  <button type="button" class="plush-hit"></button>
  <!-- Head up. Each wing is drawn lying straight out to its side and hinged
       (in CSS) at the point where it joins the body. -->
  <svg class="plush-fly" viewBox="0 0 32 32" aria-hidden="true">
    <path class="wing left" d="M15 15C12 9.5 4.5 8.5 2 13c2.5 4.5 10 4.5 13 2z"/>
    <path class="wing right" d="M17 15c3-5.5 10.5-6.5 13-2-2.5 4.500-10 4.500-13 2z"/>
    <ellipse class="body" cx="16" cy="19.5" rx="4" ry="6.5"/>
    <circle class="body" cx="16" cy="11.5" r="3.3"/>
    <circle class="eye" cx="14.4" cy="10.6" r="1.15"/><circle class="eye" cx="17.6" cy="10.6" r="1.15"/>
  </svg>
  <!-- Somebody else's hand. Where there's a mouse it's a cursor, macOS style:
       open while it travels, closed while it holds on. On a touch screen it's
       a fingertip, which presses in when it takes hold (the stylesheet picks). -->
  <svg class="plush-ghost" viewBox="0 0 32 32" aria-hidden="true">
    <circle class="tip" cx="16" cy="16" r="12"/>
    <path class="open" d="M10.5 16.5V8.2a1.8 1.8 0 0 1 3.6 0V14v-8a1.8 1.8 0 0 1 3.6 0V14 7a1.8 1.8 0 0 1 3.6 0v8-5a1.8 1.8 0 0 1 3.6 0v10.5c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-3.5-5.6c-.6-1 .1-2.2 1.2-2.4 1-.2 1.9.2 2.6 1z"/>
    <path class="grab" d="M10.5 17v-3.3a1.8 1.8 0 0 1 3.6 0V14v-1.800a1.8 1.8 0 0 1 3.6 0V14v-1.300a1.8 1.8 0 0 1 3.6 0V14v-.3a1.8 1.8 0 0 1 3.6 0v6.800c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-2.300-3.700c-.6-1 .1-2.2 1.2-2.400 1-.2 1.900.2 2.700 1z"/>
  </svg>`;

const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };

const percent = (n) => n * 100 + "%";

// A device whose main pointer is a finger.
const coarse = matchMedia("(pointer: coarse)");

// ms he stays `is-handled` after his skin is back in place (see the props).
const SETTLE = 450;

// A tick in the hand, where the phone can give one (Android; iOS has no way
// to ask). Only once the visitor has touched the page, which is the rule.
const buzz = (ms) => { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(ms); };

export async function createJavi(root, { frameName, ...overrides } = {}) {
  // One version for the whole set of pictures, so a new set is never mixed
  // with a cached old one.
  const asset = (file) => `${root.dataset.images}/${file}${root.dataset.version ? "?v=" + root.dataset.version : ""}`;
  const photo = root.querySelector("img");
  root.insertAdjacentHTML("beforeend", PARTS);
  const built = [...root.querySelectorAll("canvas, .plush-hit, .plush-fly, .plush-ghost")];
  const canvas = root.querySelector("canvas"), hit = root.querySelector(".plush-hit");
  // Once he's live the photograph is hidden; the canvas speaks for it.
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", photo ? photo.alt : "");
  hit.setAttribute("aria-label", root.dataset.poke || "Poke him");

  // The frame he's in, as the engine wants it, from the stylesheet's numbers.
  const frameOf = (name) => {
    root.dataset.frame = name;
    const css = getComputedStyle(root);
    const [x, y, r] = ["--frame-x", "--frame-y", "--frame-r"].map((v) => parseFloat(css.getPropertyValue(v)));
    return name === "none" || !(r > 0) ? null : { kind: name, x, y, r };
  };
  const frame = [frameName, root.dataset.frame].find((name) => name && Object.hasOwn(FRAMES, name)) || Object.keys(FRAMES)[0];

  // Every glance and the blink frames live in one sheet of small eye patches;
  // local-dev/face-lab/tools/make-eyes.py builds it and this manifest. It is
  // fetched while the engine starts, not before, and not waited on for ever.
  const giveUp = AbortSignal.timeout ? { signal: AbortSignal.timeout(8000) } : {};
  const manifest = fetch(asset("eyes.json"), giveUp).then((r) => (r.ok ? r.json() : null)).catch(() => null);

  let plush;
  try {
    plush = await createPlushie(canvas, {
      hit,
      faces: Object.fromEntries(FACES.map((name) => [name, asset(`${name}.webp`)])),
      reactions: REACTIONS,
      // A few quiet seconds bring on the cheek tug; after that another act,
      // picked at random, every few seconds for as long as the page stays
      // quiet. On a phone the tug is all there is to say he can be grabbed,
      // and a phone's visitor doesn't sit still for long, so it comes sooner.
      idle: { acts: structuredClone(ACTS), first: "tug", after: coarse.matches ? 2 : 4, every: [2, 4.5] },
      frame: frameOf(frame),
      ...overrides,
    });
  } catch (error) {
    // No engine: put the element back the way it was, a plain photograph.
    built.forEach((node) => node.remove());
    throw error;
  }
  root.classList.add("is-live");

  // The button pressed without a pointer (a key, a screen reader) pokes him
  // on the nose. A click that follows a pointer going down on him or coming
  // up is the engine's business, which has seen the pointer itself.
  let pointed = -Infinity, poked = -Infinity;
  const onPointer = () => { pointed = performance.now(); };
  const onClick = () => {
    const now = performance.now();
    if (now - pointed < 1000 || now - poked < 250) return; // (a key held down repeats)
    poked = now;
    plush.tap(...SPOT.nose);
  };
  hit.addEventListener("click", onClick);
  hit.addEventListener("pointerdown", onPointer);
  window.addEventListener("pointerup", onPointer, { passive: true, capture: true });
  // A finger feels him give: a tick as it takes hold, another as he snaps back.
  plush.on("grab", ({ touch }) => { if (touch) buzz(8); });
  plush.on("release", ({ pulled, cancelled }) => { if (!cancelled && pulled > 0.05) buzz(Math.round(8 + Math.min(1, pulled / 0.5) * 14)); });

  // Sound is off until asked for.
  const squeak = attachSqueak(plush);
  squeak.enabled = false;

  // --- Props ---------------------------------------------------------------
  // An act can put something in front of him — a hand that grabs, a fly —
  // and says where it is in plush.state.ghost. Drawing it happens here.
  // It is redrawn whenever the engine draws a frame, so it rests when he does.
  const ghost = root.querySelector(".plush-ghost"), fly = root.querySelector(".plush-fly");
  let last = null, pursed = false, notes = 0, firstNote = 0, settling = 0;

  // A mark that floats off from a spot on his face and removes itself.
  const float = (html, [u, v]) => {
    const mark = el(html);
    mark.style.left = percent(u); mark.style.top = percent(v);
    mark.addEventListener("animationend", () => mark.remove());
    root.append(mark);
    return mark;
  };
  // Three short streaks of breath, white with a dark edge so they show on
  // skin and beard alike.
  const STREAKS = "M24 42V20 M14 40l-6-15 M34 40l6-15";
  const puff = () => float(`<svg class="plush-puff" viewBox="0 0 48 48" aria-hidden="true"><path class="under" d="${STREAKS}"/><path class="over" d="${STREAKS}"/></svg>`, SPOT.mouth);

  plush.on("frame", () => {
    const g = plush.state.ghost;
    const hand = g && g.prop === "hand", bug = g && g.prop === "fly";
    // Skin that's well out of place may be drawn over whatever is around
    // him, and touched where it has got to (the stylesheet sees to both).
    const stretched = plush.state.grabbing || plush.state.stretch > 0.05;
    root.classList.toggle("is-stretched", stretched);
    // `is-handled` is the same, but only let go of once he has been back
    // in place for a moment: what a page puts him in front of or behind
    // follows this, so it doesn't flip back and forth while he wobbles.
    // `was-handled` stays once he has been.
    if (stretched) {
      clearTimeout(settling); settling = 0;
      root.classList.add("is-handled", "was-handled");
    } else if (!settling && root.classList.contains("is-handled")) {
      settling = setTimeout(() => { settling = 0; root.classList.remove("is-handled"); }, SETTLE);
    }
    // Whoever comes to tug him uses what the visitor last used: a finger or
    // a cursor. Until they've used anything, what the device mostly has.
    root.classList.toggle("is-touch", plush.state.finger ?? coarse.matches);
    ghost.classList.toggle("is-here", !!hand);
    ghost.classList.toggle("is-gripping", !!hand && g.grip);
    fly.classList.toggle("is-here", !!bug);
    const size = root.clientWidth, now = performance.now();
    const x = g ? g.u * size : 0, y = g ? g.v * root.clientHeight : 0;
    // The hand's palm, not its corner, sits on the spot.
    if (hand) ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -45%)`;
    if (bug) {
      // A fly never flies straight: it jitters about its path, faces the way
      // it's going, and only sits still once it has landed. Its speed is in
      // picture widths a second, so it behaves the same at any size and on
      // any screen.
      const speed = last && now > last.at ? Math.hypot(x - last.x, y - last.y) / size / ((now - last.at) / 1000) : 0;
      const landed = speed < 0.03, j = landed ? 0 : size / 80;
      const jx = (Math.sin(now / 37) + Math.sin(now / 13) * 0.45) * j, jy = (Math.cos(now / 29) + Math.sin(now / 17) * 0.45) * j;
      const turn = landed || !last ? 0 : (Math.atan2(y - last.y, x - last.x) * 180) / Math.PI + 90;
      fly.classList.toggle("is-landed", landed);
      fly.style.transform = `translate(${x + jx}px, ${y + jy}px) translate(-50%, -50%) rotate(${turn}deg)`;
      // A puff of breath each time he purses his lips at it.
      const blowing = plush.state.face.startsWith("whistle");
      if (blowing && !pursed) puff();
      pursed = blowing;
    }
    last = g ? { x, y, at: now } : null;
  });

  plush.on("act", ({ name }) => {
    // Whistling: a few notes float away from beside his mouth.
    clearInterval(notes); clearTimeout(firstNote);
    if (name !== "whistle") return;
    let n = 0;
    const note = () => {
      float(`<span class="plush-note" aria-hidden="true">${n % 2 ? "♫" : "♪"}</span>`, [SPOT.mouth[0] + 0.06, SPOT.mouth[1] - 0.065]).style.setProperty("--drift", 0.6 + Math.random() * 0.4);
      if (++n >= 5) clearInterval(notes);
    };
    notes = setInterval(note, 560);
    firstNote = setTimeout(note, 260);
  });
  plush.on("actend", () => {
    pursed = false;
    clearInterval(notes); clearTimeout(firstNote);
  });

  // However he ends — destroyed by the page, or the WebGL context lost —
  // the element goes back to being a plain photograph.
  plush.on("destroy", () => {
    clearInterval(notes); clearTimeout(firstNote); clearTimeout(settling);
    squeak.destroy();
    window.removeEventListener("pointerup", onPointer, { capture: true });
    root.classList.remove("is-live", "is-stretched", "is-handled", "was-handled", "is-touch");
    built.forEach((node) => node.remove());
    root.querySelectorAll(".plush-note, .plush-puff").forEach((node) => node.remove());
  });

  // His eyes arrive when the manifest does; he's already up and about, and
  // knows they are coming.
  const eyes = manifest.then((sheet) => (sheet ? { ...sheet, sheet: asset(sheet.sheet) } : null));
  plush.setGaze(eyes);

  return {
    plush,
    squeak,
    eyes: eyes.then(() => {}),
    setFrame(name) { if (Object.hasOwn(FRAMES, name)) plush.set({ frame: frameOf(name) }); },
    destroy: plush.destroy,
  };
}
