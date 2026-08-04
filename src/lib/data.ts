export const profile = {
  name: "Suryansh Patwa",
  initials: "SP",
  system: "SP//MIND",
  version: "v3.0",
  eyebrow: "A THINKER. A BUILDER. NO FIXED STACK.",
  tagline: "I don't collect frameworks. I collect questions worth sitting with.",
};

/** Loose half-formed thoughts for the Catch the Thought minigame. */
export const thoughtFragments = [
  "no fixed stack",
  "worth sitting with",
  "build first, ask later",
  "most of this stays in the lab",
  "still not sure this works",
  "the question, not the answer",
  "i'll learn it when i need it",
  "not for a job",
  "a mind, not a resume",
  "cogniflow, unfinished",
  "hold a standard, not a title",
  "curiosity over completion",
  "what if the stack doesn't matter",
  "R&D, applied to a life",
];

export type MindNode = {
  id: "philosophy" | "arsenal" | "cogniflow" | "lab" | "signal";
  index: number;
  code: string;
  title: string;
  /** short line shown in the HUD caption during the guided tour */
  blurb: string;
  position: [number, number, number];
  /** accent color for the node's glow + panel */
  accent: string;
  scale: number;
};

export const nodes: MindNode[] = [
  {
    id: "philosophy",
    index: 0,
    code: "N-01 · AXIOMS",
    title: "PHILOSOPHY",
    blurb: "The operating principles. Why 'no fixed stack' is a method, not a mood.",
    position: [-7.6, 2.4, -3.2],
    accent: "#4ff0d1",
    scale: 1,
  },
  {
    id: "arsenal",
    index: 1,
    code: "N-02 · TOOLKIT",
    title: "ARSENAL",
    blurb: "Not a checklist — a toolbox. Picked up when a problem demanded it.",
    position: [6.9, -1.8, -5.2],
    accent: "#9d7bff",
    scale: 1,
  },
  {
    id: "cogniflow",
    index: 2,
    code: "N-03 · FLAGSHIP",
    title: "COGNIFLOW",
    blurb: "Reading cognitive load off a webcam. The question I'm sitting with right now.",
    position: [8.2, 1.9, 3.4],
    accent: "#ff5fd2",
    scale: 1.45,
  },
  {
    id: "lab",
    index: 3,
    code: "N-04 · SEALED",
    title: "THE LAB",
    blurb: "Where most of my work lives — and stays, until it survives my own standards.",
    position: [-6.2, -2.9, 5.0],
    accent: "#5fb8ff",
    scale: 1,
  },
  {
    id: "signal",
    index: 4,
    code: "N-05 · UPLINK",
    title: "SIGNAL",
    blurb: "Open channel. For questions worth sitting with — not for résumés.",
    position: [1.4, 4.8, -8.2],
    accent: "#b8ff5f",
    scale: 1,
  },
];

export const bootLines = [
  "> initializing mind_core .............. OK",
  "> loading axioms ...................... OK",
  "> calibrating gaze tracker ............ OK",
  "> hypotheses loaded ................... 47",
  "> fixed stack ......................... NOT FOUND",
  "> curiosity ........................... UNBOUNDED",
  "> mounting consciousness ..............",
];

export const tour = {
  intro: {
    kicker: "SUBJECT: SURYANSH PATWA",
    title: "You are inside a mind.",
    sub: "Scroll to move through it. You drive — nothing moves without you.",
  },
  outro: {
    kicker: "SYNC COMPLETE",
    title: "The mind is yours now.",
    sub: "Drag to orbit. Click any node to open it.",
  },
};

export const philosophy = {
  heading: "Limitless isn't a claim. It's a method.",
  body: "Most people pick a lane and stay in it. I never have — and I'm not going to start. Hand me a problem in Python, in C++, in cognitive science, in some language I've never even opened, and the stack stops mattering. What matters is whether the question is worth sitting with. I learn what a problem demands, build what doesn't exist yet, and hold a standard high enough that most of what I make quietly stays in the lab.",
  pullQuote: "That isn't indecision. That's R&D, applied to a life.",
  originHeading: "HOW I GOT HERE",
  originParagraphs: [
    "I started coding for the obvious reason — a good package, a good company. Then college happened, and it taught me the opposite of what I actually wanted: assignments instead of skill, a technical degree that technically taught nothing.",
    "Somewhere in the middle of it, I fell for someone. I told her. She said yes, and she started pushing me toward goals I'd quietly stopped chasing. Right in the middle of that, I hit the darkest period of my life — real depression, the kind that changes how you see everything that comes after. She stayed through it. I'm on the other side now, and I see things differently because of it.",
    "The first thing I saw clearly: college wasn't building anything in me, just burying it under coursework. So I left — my family didn't support it, and I made the call anyway, on my own terms. Not long after, I lost my grandfather, and I moved to Bengaluru to actually build something instead of talking about it.",
    "The turn that mattered most: I built an app for Katha, a rough beta full of holes. Fixing it properly meant researching for the first time — and I fell for the research harder than I'd fallen for the app. That became my style.",
  ],
  originQuote: "Cogniflow is what happens when that style finally meets a question worth years, not weeks.",
};

export type SkillRow = { label: string; items: string[] };

export const arsenal = {
  heading: "Not a checklist. A toolbox.",
  sub: "Fluency isn't the goal — capability is. If a problem needs a tool I don't have yet, I pick it up and keep moving.",
  rows: [
    {
      label: "LANGUAGES",
      items: ["JavaScript", "TypeScript", "Python", "C", "C++"],
    },
    {
      label: "FRAMEWORKS & MOTION",
      items: ["React", "Next.js", "React Native", "Vite", "GSAP", "Three.js"],
    },
    {
      label: "DATA & INFRA",
      items: ["MongoDB", "PostgreSQL", "REST APIs", "GraphQL", "Axios"],
    },
  ] as SkillRow[],
};

export const cogniflow = {
  status: "RESEARCH · IN PROGRESS · NOT YET LIVE",
  oneLiner: "Reading cognitive load off a webcam.",
  abstract:
    "Cogniflow estimates cognitive engagement in real time using nothing but a standard webcam — tracking pupil dynamics, blink behaviour, gaze stability, and facial tension to infer how hard a mind is working, moment to moment.",
  closingLine:
    "No wearables. No lab equipment. Just a camera, a hypothesis, and the data to back it up.",
  method: ["Pupil dynamics", "Blink behaviour", "Gaze stability", "Facial tension"],
  validation: ["NASA-TLX questionnaires", "N-back cognitive tests", "Retrospective user confirmation"],
  tags: ["Computer Vision", "Cognitive Science", "Python", "Applied Research"],
};

export const lab = {
  heading: "More is brewing.",
  body: "I build constantly — most of it never leaves this room. What's not here isn't gone; it's either still cooking, or it didn't survive contact with my own standards. Cogniflow made the cut. More will.",
  teaser:
    "Coming to this space: playable experiments. Games, toys, things you can break. Each one will dock here as a new node in the mind.",
  buttonLabel: "DESTABILIZE THE MIND",
  buttonHint: "go on. poke it.",
};

export const signal = {
  heading: "Got a question worth sitting with?",
  sub: "This isn't the résumé version of me — I've got one of those elsewhere. This channel is for the interesting stuff.",
  email: "hello@suryanshpatwa.dev",
  links: [
    { label: "GitHub", href: "https://github.com/suryanshpatwa" },
    { label: "LinkedIn", href: "https://linkedin.com/in/suryanshpatwa" },
    { label: "X / Twitter", href: "https://x.com/suryanshpatwa" },
  ],
};

export const colophon = [
  "Set in Space Grotesk & JetBrains Mono.",
  "Built with Vite, React, Three.js & GSAP.",
  "Suryansh Patwa © 2026.",
];
