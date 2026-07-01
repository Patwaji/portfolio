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
      className="relative bg-void px-6 py-28 text-center md:px-12 md:py-36"
    >
      <h2
        data-reveal
        className="mx-auto max-w-2xl font-display text-[clamp(1.8rem,4.5vw,3rem)] font-medium text-ink"
      >
        {lab.heading}
      </h2>
      <p data-reveal className="mx-auto mt-6 max-w-xl text-sm text-ink-dim md:text-base">
        {lab.paragraph}
      </p>
    </section>
  );
}
