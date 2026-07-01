export const profile = {
  name: "Suryansh Patwa",
  initials: "SP",
  eyebrow: "A THINKER. A BUILDER. NO FIXED STACK.",
  tagline: "I don't collect frameworks. I collect questions worth sitting with.",
  subline:
    "Currently obsessing over Cogniflow — reading cognitive load off a webcam feed. Everything else, I'll learn the moment it's needed.",
};

export const manifesto = {
  eyebrow: "PHILOSOPHY",
  heading: "Limitless isn't a claim. It's a method.",
  paragraph:
    "Most people pick a lane and stay in it. I never have — and I'm not going to start. Hand me a problem in Python, in C++, in cognitive science, in some language I've never even opened, and the stack stops mattering. What matters is whether the question is worth sitting with. I learn what a problem demands, build what doesn't exist yet, and hold a standard high enough that most of what I make quietly stays in the lab. That isn't indecision. That's R&D, applied to a life.",
};

export type SkillRow = {
  label: string;
  items: string[];
  direction: "left" | "right";
};

export const skillRows: SkillRow[] = [
  {
    label: "Languages",
    direction: "left",
    items: ["JavaScript", "TypeScript", "Python", "C", "C++"],
  },
  {
    label: "Frameworks & Motion",
    direction: "right",
    items: ["React", "Next.js", "React Native", "Vite", "GSAP", "HTML", "CSS"],
  },
  {
    label: "Data & Infra",
    direction: "left",
    items: ["MongoDB", "PostgreSQL", "REST APIs", "GraphQL", "Axios"],
  },
];

export const arsenal = {
  eyebrow: "ARSENAL",
  heading: "Not a checklist. A toolbox.",
  sub: "Fluency isn't the goal, capability is. If a problem needs a tool I don't have yet, I pick it up and keep moving.",
};

export const cogniflow = {
  status: "RESEARCH · IN PROGRESS · NOT YET LIVE",
  eyebrow: "FLAGSHIP WORK",
  name: "Cogniflow",
  oneLiner: "Reading cognitive load off a webcam.",
  abstract:
    "Cogniflow estimates cognitive engagement in real time using nothing but a standard webcam — tracking pupil dynamics, blink behaviour, gaze stability, and facial tension to infer how hard a mind is working, moment to moment.",
  closingLine:
    "No wearables. No lab equipment. Just a camera, a hypothesis, and the data to back it up.",
  method: [
    "Pupil dynamics",
    "Blink behaviour",
    "Gaze stability",
    "Facial tension",
  ],
  validation: [
    "NASA-TLX questionnaires",
    "N-back cognitive tests",
    "Retrospective user confirmation",
  ],
  tags: ["Computer Vision", "Cognitive Science", "Python", "Applied Research"],
  readouts: [
    { label: "Engagement", value: 74, unit: "%" },
    { label: "Blink Rate", value: 14, unit: "/min" },
    { label: "Gaze Stability", value: 82, unit: "%" },
  ],
};

export const lab = {
  heading: "More is brewing.",
  paragraph:
    "I build constantly — most of it never leaves the lab. What's not here yet isn't gone; it's either still cooking, or it didn't survive contact with my own standards. Cogniflow made the cut. More will, eventually.",
};

export const contact = {
  eyebrow: "GET IN TOUCH",
  heading: "Got a question worth sitting with?",
  sub: "This isn't the résumé version of me — I've already got one of those for job hunting. This is where the interesting stuff goes.",
  email: "hello@suryanshpatwa.dev",
  links: [
    { label: "GitHub", href: "https://github.com/suryanshpatwa" },
    { label: "LinkedIn", href: "https://linkedin.com/in/suryanshpatwa" },
    { label: "X / Twitter", href: "https://x.com/suryanshpatwa" },
  ],
};

export const navLinks = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Arsenal", href: "#arsenal" },
  { label: "Cogniflow", href: "#cogniflow" },
  { label: "Contact", href: "#contact" },
];
