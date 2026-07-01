import { skillRows, arsenal } from "../lib/data";
import { SectionHeading } from "../components/SectionHeading";

export function Arsenal() {
  return (
    <section id="arsenal" className="relative overflow-hidden border-t border-line bg-bone-deep py-28 md:py-40">
      <div className="px-6 md:px-12">
        <SectionHeading number="02" eyebrow={arsenal.eyebrow} heading={arsenal.heading} className="mb-6" />
        <p className="max-w-xl text-sm text-ink-dim md:text-base">{arsenal.sub}</p>
      </div>

      <div className="mt-16 flex flex-col md:mt-20">
        {skillRows.map((row) => (
          <div
            key={row.label}
            className="group relative flex overflow-hidden border-t border-line py-5 last:border-b"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bone-deep to-transparent md:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bone-deep to-transparent md:w-32" />
            <div
              className={`flex shrink-0 flex-nowrap items-center gap-4 pr-4 will-change-transform ${
                row.direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
              } group-hover:[animation-play-state:paused]`}
            >
              {[...row.items, ...row.items].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="flex items-center gap-4 font-mono text-sm tracking-wide text-ink-dim whitespace-nowrap uppercase md:text-base"
                >
                  {item}
                  <span className="force-circle h-1 w-1 bg-rust" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
