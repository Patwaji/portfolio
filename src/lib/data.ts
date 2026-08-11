export const profile = {
  name: "Suryansh Patwa",
  initials: "SP",
  system: "SP//MIND",
  version: "v3.0",
  eyebrow: "BUILDER. RESEARCHER. NO FIXED STACK.",
  // the one place the signature line lives — used once, on purpose
  tagline: "I don't collect frameworks. I collect questions worth sitting with.",
};

/** Loose half-formed thoughts for the Catch the Thought minigame. */
export const thoughtFragments = [
  "no fixed stack",
  "build first, name it later",
  "most of this stays in the lab",
  "still not sure this works",
  "i'll learn it when the problem needs it",
  "not chasing a title",
  "a mind, not a resume",
  "cogniflow, still cooking",
  "the camera only sees where you look",
  "curiosity over completion",
  "what if the stack doesn't matter",
  "left college, kept building",
  "R&D, pointed at a life",
  "go on, poke it",
];

export type MindNode = {
  id: "philosophy" | "arsenal" | "cogniflow" | "lab" | "signal" | "blog";
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
    blurb: "Why 'no fixed stack' is a working method, not a mood.",
    position: [-7.6, 2.4, -3.2],
    accent: "#4ff0d1",
    scale: 1,
  },
  {
    id: "arsenal",
    index: 1,
    code: "N-02 · TOOLKIT",
    title: "ARSENAL",
    blurb: "Not a checklist. A toolbox I pick from when a problem asks for it.",
    position: [6.9, -1.8, -5.2],
    accent: "#9d7bff",
    scale: 1,
  },
  {
    id: "cogniflow",
    index: 2,
    code: "N-03 · FLAGSHIP",
    title: "COGNIFLOW",
    blurb: "A local, webcam-only study companion. The thing I'm building right now.",
    position: [8.2, 1.9, 3.4],
    accent: "#ff5fd2",
    scale: 1.45,
  },
  {
    id: "lab",
    index: 3,
    code: "N-04 · SEALED",
    title: "THE LAB",
    blurb: "Where most of my work lives, until it's good enough to leave.",
    position: [-6.2, -2.9, 5.0],
    accent: "#5fb8ff",
    scale: 1,
  },
  {
    id: "signal",
    index: 4,
    code: "N-05 · UPLINK",
    title: "SIGNAL",
    blurb: "Open channel. Say hello, ask something, or just poke around.",
    position: [1.4, 4.8, -8.2],
    accent: "#b8ff5f",
    scale: 1,
  },
  {
    id: "blog",
    index: 5,
    code: "N-06 · LOGBOOK",
    title: "SP//LOG",
    blurb: "Field notes from building software. What I'm learning, in the open.",
    position: [-3.6, -5.0, -5.6],
    accent: "#ffc24d",
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
  body: "Most people pick a lane and stay in it. I never have, and I'm not going to start. Hand me a problem in Python, in C++, in cognitive science, in a language I've never opened, and the stack stops mattering. What matters is whether the question is worth the time. I learn what the problem needs, build the part that doesn't exist yet, and hold the bar high enough that most of what I make quietly stays in the lab.",
  pullQuote: "That isn't indecision. It's R&D, pointed at a life.",
  originHeading: "HOW I GOT HERE",
  originParagraphs: [
    "I started coding for the obvious reason: a good job at a good company. Then college taught me the opposite of what I wanted. Assignments instead of skill. A technical degree that technically taught nothing.",
    "Somewhere in the middle of it I fell for someone. I told her, she said yes, and she started pushing me back toward goals I'd quietly given up on. Then I hit the darkest stretch of my life. Real depression, the kind that changes how you see everything that comes after. She stayed through it. I'm on the other side now, and I see things differently because of it.",
    "The first thing I saw clearly: college wasn't building anything in me, it was burying it under coursework. So I left. My family didn't back the call. I made it anyway. Not long after, I lost my grandfather, and I moved to Bengaluru to actually build something instead of talking about it.",
    "The turn that mattered most was a rough app I built for Katha, full of holes. Fixing it properly meant doing real research for the first time, and I fell for the research harder than I'd fallen for the app. That's been my way of working ever since.",
  ],
  originQuote: "CogniFlow is what happens when that way of working finally meets a question worth years, not weeks.",
};

export type SkillRow = { label: string; items: string[] };

export const arsenal = {
  heading: "Not a checklist. A toolbox.",
  sub: "Fluency isn't the point, capability is. If a problem needs a tool I don't have yet, I pick it up and keep moving.",
  rows: [
    {
      label: "LANGUAGES",
      items: ["JavaScript", "TypeScript", "Python", "C", "C++", "Rust"],
    },
    {
      label: "FRAMEWORKS & MOTION",
      items: ["React", "Next.js", "React Native", "Vite", "Tauri", "GSAP", "Three.js"],
    },
    {
      label: "DATA & INFRA",
      items: ["MongoDB", "PostgreSQL", "REST APIs", "GraphQL", "WebAssembly"],
    },
  ] as SkillRow[],
};

export const cogniflow = {
  status: "RESEARCH · WORK IN PROGRESS",
  oneLiner: "A local, webcam-only study companion that reflects your focus back to you.",
  abstract:
    "CogniFlow watches your webcam while you study and reads a few honest attention states — Focused, Drifting, Drowsy, Away. It nudges you only when you've slipped off task, and gives you a calm, honest review after the session. Everything runs on your own machine. No video ever leaves your computer, no accounts, no cloud.",
  closingLine:
    "No wearables, no lab rig. Just a camera, a hypothesis, and a paper documenting the reasoning behind every design choice.",
  /** the four coarse states + the machinery, shown under WHAT IT READS */
  method: [
    "Head direction — are you on the work surface",
    "Eye-closure — blinks and drowsiness",
    "Presence — are you actually there",
    "An anti-flicker state machine so it doesn't twitch",
  ],
  /** what it deliberately refuses to do — the honesty of the project */
  wontDo: [
    "No 'cognitive load' number",
    "No productivity score to feel guilty about",
    "Nothing uploaded, nothing stored beyond local summaries",
    "Shows a confidence level instead of pretending to be certain",
  ],
  paper:
    "It's written up as a full research paper: a working system plus the evidence and honest limits behind every decision. Empirical validation against human ground truth is the next step, not a claim I'm making yet.",
  tags: ["Computer Vision", "MediaPipe", "Tauri", "Privacy-first", "Applied Research"],
  links: [
    { label: "View on GitHub", href: "https://github.com/Patwaji/cogniflow" },
    { label: "Read the paper", href: "https://github.com/Patwaji/cogniflow/blob/main/RESEARCH_PAPER.pdf" },
  ],
};

export const lab = {
  heading: "More is brewing.",
  body: "I build constantly, and most of it never leaves this room. What's missing isn't gone. It's either still cooking, or it didn't survive contact with my own standards. CogniFlow made the cut. More will.",
  teaser:
    "Coming to this space: playable experiments. Games, toys, things you can break. Each one will dock here as a new node in the mind.",
  buttonLabel: "DESTABILIZE THE MIND",
  buttonHint: "go on. poke it.",
};

export const signal = {
  heading: "Got something to build, or just want to talk?",
  sub: "This is the fun channel, not the résumé one. That version of me lives elsewhere.",
  email: "suryanshpatwa261@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/Patwaji" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/suryansh-patwa-089153358/" },
    { label: "X / Twitter", href: "https://x.com/suryansh_gyaani" },
  ],
};

export const blog = {
  heading: "Field notes from building software.",
  sub: "I write while I build — what broke, what I changed my mind about, what the research actually said. Rough, honest, in the open.",
  href: "https://blogs.suryanshpatwa.in",
  cta: "Read the log →",
  posts: [
    {
      title: "What happens after you press Enter in an AI IDE",
      href: "https://blogs.suryanshpatwa.in/articles/what-happens-after-you-press-enter/",
    },
    {
      title: "I built a webcam focus tracker, then deleted the focus score",
      href: "https://blogs.suryanshpatwa.in/articles/quiet-study-companion/deleted-the-score/",
    },
  ],
};

export const colophon = [
  "Set in Space Grotesk & JetBrains Mono.",
  "Built with Vite, React, Three.js & GSAP.",
  "Suryansh Patwa © 2026.",
];
