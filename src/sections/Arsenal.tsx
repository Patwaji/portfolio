import { skillRows, arsenal } from "../lib/data";
import { SectionHeading } from "../components/SectionHeading";

export function Arsenal() {
  return (
    <section id="arsenal" className="relative overflow-hidden bg-void-soft py-32 md:py-44">
      <div className="px-6 md:px-12">
        <SectionHeading eyebrow={arsenal.eyebrow} heading={arsenal.heading} className="mb-6" />
        <p className="max-w-xl text-sm text-ink-dim md:text-base">{arsenal.sub}</p>
      </div>

      <div className="mt-16 flex flex-col gap-5 md:mt-20 md:gap-6">
        {skillRows.map((row) => (
          <div key={row.label} className="group relative flex overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-void-soft to-transparent md:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-void-soft to-transparent md:w-32" />
            <div
              className={`flex shrink-0 flex-nowrap gap-4 pr-4 will-change-transform ${
                row.direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
              } group-hover:[animation-play-state:paused]`}
            >
              {[...row.items, ...row.items].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 font-mono text-xs tracking-wide text-ink-dim whitespace-nowrap uppercase md:text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-violet to-cyan" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
