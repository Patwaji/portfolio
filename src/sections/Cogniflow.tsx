import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { cogniflow } from "../lib/data";
import { GazeScanner } from "../components/GazeScanner";

function Readout({ label, value, unit }: { label: string; value: number; unit: string }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const counter = { value: 0 };
      gsap.to(counter, {
        value,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 90%",
          once: true,
        },
        onUpdate: () => {
          if (valueRef.current) valueRef.current.textContent = String(Math.round(counter.value));
        },
      });
    },
    { scope: wrapRef },
  );

  return (
    <div ref={wrapRef} className="flex flex-col gap-1 border-l border-line pl-4">
      <div className="font-mono text-2xl text-ink md:text-3xl">
        <span ref={valueRef}>0</span>
        <span className="text-ink-faint">{unit}</span>
      </div>
      <div className="font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
        {label}
      </div>
    </div>
  );
}

export function Cogniflow() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-reveal]", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="cogniflow"
      className="relative bg-surface px-6 py-32 md:px-12 md:py-44"
    >
      <div
        data-reveal
        className="mb-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-amber uppercase"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
        {cogniflow.status}
      </div>

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-8">
          <div data-reveal>
            <div className="mb-3 font-mono text-xs tracking-[0.3em] text-violet-soft uppercase">
              {cogniflow.eyebrow}
            </div>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-medium text-ink">
              {cogniflow.name}
            </h2>
            <p className="mt-3 font-display text-lg text-gradient md:text-xl">
              {cogniflow.oneLiner}
            </p>
          </div>

          <p data-reveal className="max-w-xl text-base leading-relaxed text-ink-dim md:text-lg">
            {cogniflow.abstract}
          </p>

          <div data-reveal className="grid grid-cols-2 gap-8">
            <div>
              <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                Measuring
              </div>
              <ul className="flex flex-col gap-2">
                {cogniflow.method.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-ink">
                    <span className="h-1 w-1 rounded-full bg-cyan" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                Validated against
              </div>
              <ul className="flex flex-col gap-2">
                {cogniflow.validation.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm text-ink">
                    <span className="h-1 w-1 rounded-full bg-violet-soft" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p data-reveal className="text-sm text-ink-faint italic">
            {cogniflow.closingLine}
          </p>

          <div data-reveal className="flex flex-wrap gap-2">
            {cogniflow.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-wide text-ink-dim uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div data-reveal className="flex flex-col gap-8">
          <div className="aspect-square w-full rounded-2xl border border-line bg-void-soft p-6">
            <GazeScanner />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {cogniflow.readouts.map((r) => (
              <Readout key={r.label} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
