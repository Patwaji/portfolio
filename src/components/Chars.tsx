import type { CSSProperties } from "react";

/**
 * Splits text into per-character spans for staggered kinetic reveals.
 * Parent controls the animation by carrying the `kinetic-run` class.
 */
export function Chars({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="chars" aria-label={text}>
      {text.split("").map((c, i) => (
        <span
          key={i}
          className="ch"
          aria-hidden
          style={{ "--i": i + delay } as CSSProperties}
        >
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
