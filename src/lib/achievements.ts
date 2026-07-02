/**
 * Achievement engine. Pure logic — App subscribes for toasts, the HUD shows
 * the counter, the terminal lists them. Persisted in localStorage.
 */

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  /** hidden from lists until earned */
  secret?: boolean;
};

export const achievements: Achievement[] = [
  { id: "first-contact", title: "FIRST CONTACT", desc: "Touched a live consciousness." },
  { id: "synapse-walker", title: "SYNAPSE WALKER", desc: "Visited all five nodes." },
  { id: "destabilizer", title: "DESTABILIZER", desc: "Poked the mind. It noticed." },
  { id: "chaos-agent", title: "CHAOS AGENT", desc: "Destabilized the mind five times. Why." },
  { id: "ripple", title: "MAKE WAVES", desc: "Sent a shockwave through a thought." },
  { id: "hacker", title: "BACKDOOR FOUND", desc: "Opened the terminal." },
  { id: "root-access", title: "ROOT ACCESS", desc: "sudo hire. Bold. Respected." },
  { id: "gravity-bender", title: "GRAVITY BENDER", desc: "Bent the mind's physics to your will." },
  { id: "deep-diver", title: "DEEP DIVER", desc: "Zoomed all the way into the core." },
  { id: "patient-observer", title: "PATIENT OBSERVER", desc: "Five minutes inside a mind." },
  {
    id: "transcendence",
    title: "TRANSCENDENCE",
    desc: "Earned everything. You know this mind better than most.",
    secret: true,
  },
];

const STORE_KEY = "sp-mind-ach";
const COUNT_KEY = "sp-mind-counters";

type Listener = (a: Achievement) => void;

class AchievementEngine {
  private earned: Set<string>;
  private counters: Record<string, number>;
  private listeners: Listener[] = [];

  constructor() {
    this.earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]"));
    this.counters = JSON.parse(localStorage.getItem(COUNT_KEY) ?? "{}");
  }

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  has(id: string) {
    return this.earned.has(id);
  }

  get count() {
    return this.earned.size;
  }

  get total() {
    return achievements.length;
  }

  list() {
    return achievements.map((a) => ({ ...a, earned: this.earned.has(a.id) }));
  }

  unlock(id: string) {
    if (this.earned.has(id)) return;
    const def = achievements.find((a) => a.id === id);
    if (!def) return;
    this.earned.add(id);
    localStorage.setItem(STORE_KEY, JSON.stringify([...this.earned]));
    this.listeners.forEach((l) => l(def));

    // everything except transcendence itself -> transcendence
    const rest = achievements.filter((a) => a.id !== "transcendence");
    if (rest.every((a) => this.earned.has(a.id))) {
      this.unlock("transcendence");
    }
  }

  /** increment a named counter and unlock when it crosses a threshold */
  bump(counter: string, threshold: number, achievementId: string) {
    this.counters[counter] = (this.counters[counter] ?? 0) + 1;
    localStorage.setItem(COUNT_KEY, JSON.stringify(this.counters));
    if (this.counters[counter] >= threshold) this.unlock(achievementId);
  }
}

export const ach = new AchievementEngine();
