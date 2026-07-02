import { useEffect, useRef } from "react";
import gsap from "gsap";
import { bootLines } from "../lib/data";

export function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const lines = root.querySelectorAll<HTMLElement>(".line");
    const pctEl = root.querySelector<HTMLElement>(".pct")!;
    const barEl = root.querySelector<HTMLElement>(".bar i")!;
    const counter = { v: 0 };

    const tl = gsap.timeline();
    tl.to(lines, { opacity: 1, duration: 0.01, stagger: 0.24 }, 0.2);
    tl.to(
      counter,
      {
        v: 100,
        duration: 2.7,
        ease: "power2.inOut",
        onUpdate: () => {
          pctEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
          barEl.style.transform = `scaleX(${counter.v / 100})`;
        },
      },
      0.2
    );
    tl.to(lines, { opacity: 0.25, duration: 0.4 });
    tl.to(root, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: onDone,
    });

    return () => {
      tl.kill();
    };
  }, [onDone]);

  return (
    <div className="preloader" ref={rootRef}>
      <div className="boot-log">
        {bootLines.map((l, i) => {
          const [head, tail] = splitTail(l);
          return (
            <div className="line" key={i}>
              {head}
              {tail && <em>{tail}</em>}
            </div>
          );
        })}
      </div>
      <div className="pct">000</div>
      <div className="bar">
        <i />
      </div>
    </div>
  );
}

/** Color the value after the dotted leader ("OK", "47", "UNBOUNDED"…). */
function splitTail(line: string): [string, string | null] {
  const m = line.match(/^(.*\.{2,} )(.+)$/);
  return m ? [m[1], m[2]] : [line, null];
}
