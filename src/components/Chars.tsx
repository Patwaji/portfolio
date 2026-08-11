import { Fragment } from "react";
import type { CSSProperties } from "react";

/**
 * Splits text into per-character spans for staggered kinetic reveals.
 * Characters are grouped per word (each word is inline-block) so a word never
 * breaks mid-way across lines — only the spaces between words wrap.
 * Parent controls the animation by carrying the `kinetic-run` class.
 */
export function Chars({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(" ");
  let i = delay;
  return (
    <span className="chars" aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className="word" style={{ display: "inline-block" }}>
            {word.split("").map((c) => (
              <span
                key={i}
                className="ch"
                aria-hidden
                style={{ "--i": i++ } as CSSProperties}
              >
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
