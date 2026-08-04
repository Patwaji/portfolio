/**
 * "Mind seed" — a deterministic PRNG keyed to the visitor's local calendar
 * day, so the particle field, palette start, and drone detune are stable
 * within a day but genuinely different tomorrow. Never the same mind twice.
 */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good-enough distribution for visuals. */
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type MindSeed = {
  key: string;
  rand: () => number;
  /** stable 0..1 offsets derived from the seed, for quick cosmetic use */
  hue: number;
  detune: number;
};

export function getMindSeed(): MindSeed {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const base = hashString(key);
  const rand = mulberry32(base);
  return { key, rand, hue: rand(), detune: rand() };
}
