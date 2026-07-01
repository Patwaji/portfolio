import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "../lib/gsap";
import { manifesto } from "../lib/data";
import { SectionHeading } from "../components/SectionHeading";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const paraRef = useRef<HTMLSpanElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
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

      gsap.from(quoteRef.current, {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: quoteRef.current,
          start: "top 85%",
        },
      });

      if (!paraRef.current) return;

      const split = SplitText.create(paraRef.current, { type: "words" });

      if (reducedMotion) {
        gsap.set(split.words, { opacity: 1 });
        return;
      }

      gsap.set(split.words, { opacity: 0.16 });

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
      className="relative border-t border-line bg-bone px-6 py-28 md:px-12 md:py-40"
    >
      <div ref={headingWrapRef}>
        <SectionHeading
          number="01"
          eyebrow={manifesto.eyebrow}
          heading={manifesto.heading}
          className="mb-16 md:mb-20"
        />
      </div>

      <p className="max-w-3xl text-[clamp(1.2rem,2.4vw,1.6rem)] leading-[1.55] text-ink">
        <span className="dropcap-letter">{manifesto.paragraph[0]}</span>
        <span ref={paraRef}>{manifesto.paragraph.slice(1)}</span>
      </p>

      <p
        ref={quoteRef}
        className="pull-quote mt-12 max-w-2xl text-[clamp(1.6rem,3.4vw,2.4rem)] md:ml-16"
      >
        {manifesto.pullQuote}
      </p>
    </section>
  );
}
