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
      className="relative border-t border-line bg-bone px-6 py-28 md:px-12 md:py-40"
    >
      <div
        data-reveal
        className="mb-10 inline-flex items-center gap-3 border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.25em] text-rust uppercase"
      >
        <span className="force-circle h-1.5 w-1.5 animate-pulse bg-rust" />
        {cogniflow.status}
      </div>

      <div className="grid min-w-0 gap-16 lg:grid-cols-2 lg:gap-16">
        <div className="flex min-w-0 flex-col gap-8">
          <div data-reveal>
            <div className="mb-3 flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-rust uppercase">
              <span className="text-ink-faint">03</span>
              <span className="h-px w-8 bg-rust/50" />
              {cogniflow.eyebrow}
            </div>
            <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-none font-medium text-ink">
              {cogniflow.name}
            </h2>
            <p className="pull-quote mt-4 text-lg md:text-xl">{cogniflow.oneLiner}</p>
          </div>

          <p data-reveal className="dropcap max-w-xl text-base leading-relaxed text-ink md:text-lg">
            {cogniflow.abstract}
          </p>

          <div data-reveal className="grid grid-cols-2 gap-8 border-t border-line pt-8">
            <div>
              <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase">
                Measuring
              </div>
              <ul className="flex flex-col gap-2">
                {cogniflow.method.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-ink">
                    <span className="force-circle h-1 w-1 bg-rust" />
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
                    <span className="force-circle h-1 w-1 bg-ink-faint" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p data-reveal className="border-t border-line pt-6 text-sm text-ink-faint italic">
            {cogniflow.closingLine}
          </p>

          <div data-reveal className="flex flex-wrap gap-2">
            {cogniflow.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line px-3 py-1 font-mono text-[10px] tracking-wide text-ink-dim uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div data-reveal className="flex min-w-0 flex-col gap-3">
          <div className="aspect-square w-full border border-line bg-paper p-6">
            <GazeScanner />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
            <span className="truncate">FIG. 02 — GAZE TRACKING, SIMULATED</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {cogniflow.readouts.map((r) => (
              <Readout key={r.label} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
