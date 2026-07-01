import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "../lib/gsap";
import { manifesto } from "../lib/data";
import { SectionHeading } from "../components/SectionHeading";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      gsap.from(headingWrapRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingWrapRef.current,
          start: "top 80%",
        },
      });

      if (!paraRef.current) return;

      const split = SplitText.create(paraRef.current, { type: "words" });

      if (reducedMotion) {
        gsap.set(split.words, { opacity: 1 });
        return;
      }

      gsap.set(split.words, { opacity: 0.14 });

      gsap.to(split.words, {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: {
          trigger: paraRef.current,
          start: "top 75%",
          end: "bottom 45%",
          scrub: 0.4,
        },
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="relative bg-void px-6 py-32 md:px-12 md:py-44"
    >
      <div ref={headingWrapRef}>
        <SectionHeading
          eyebrow={manifesto.eyebrow}
          heading={manifesto.heading}
          className="mb-16 md:mb-24"
        />
      </div>

      <p
        ref={paraRef}
        className="max-w-4xl font-display text-[clamp(1.4rem,3.4vw,2.6rem)] leading-[1.35] font-normal text-ink"
      >
        {manifesto.paragraph}
      </p>
    </section>
  );
}
