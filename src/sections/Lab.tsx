import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { lab } from "../lib/data";

export function Lab() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-reveal]", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-line bg-bone-deep px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-xl border-l-2 border-rust pl-6 md:pl-8">
        <div data-reveal className="mb-3 font-mono text-[10px] tracking-[0.25em] text-rust uppercase">
          Editor&rsquo;s Note
        </div>
        <h2
          data-reveal
          className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] text-ink italic"
        >
          {lab.heading}
        </h2>
        <p data-reveal className="mt-4 text-sm text-ink-dim md:text-base">
          {lab.paragraph}
        </p>
      </div>
    </section>
  );
}
