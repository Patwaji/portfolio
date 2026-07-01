import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";

const LOADING_LINES = [
  "SETTING THE TYPE",
  "INKING THE PRESS",
  "PROOFING THE PAGE",
];

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const counter = { value: 0 };
      const line = { index: 0 };

      if (lineRef.current) lineRef.current.textContent = LOADING_LINES[0];

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          gsap.to(rootRef.current, {
            yPercent: -100,
            duration: 0.9,
            ease: "power4.inOut",
            delay: 0.15,
            onComplete,
          });
        },
      });

      tl.to(counter, {
        value: 100,
        duration: 1.8,
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.floor(counter.value));
          }
          const nextIndex = Math.min(
            LOADING_LINES.length - 1,
            Math.floor((counter.value / 100) * LOADING_LINES.length),
          );
          if (nextIndex !== line.index) {
            line.index = nextIndex;
            if (lineRef.current) lineRef.current.textContent = LOADING_LINES[nextIndex];
          }
        },
      }).to(
        barRef.current,
        { scaleX: 1, duration: 1.8, ease: "power2.inOut" },
        "<",
      );
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-6 bg-bone"
    >
      <div className="flex items-baseline gap-1 font-display text-[clamp(4rem,14vw,9rem)] font-medium leading-none text-ink">
        <span ref={countRef}>0</span>
        <span className="text-2xl text-ink-faint md:text-4xl">%</span>
      </div>
      <span
        ref={lineRef}
        className="font-mono text-xs tracking-[0.3em] text-ink-faint uppercase"
      />
      <div className="h-px w-48 overflow-hidden bg-line">
        <div
          ref={barRef}
          className="h-full w-full origin-left scale-x-0 bg-rust"
        />
      </div>
    </div>
  );
}
