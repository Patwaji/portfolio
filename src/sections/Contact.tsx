import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "../lib/gsap";
import { contact } from "../lib/data";
import { MagneticButton } from "../components/MagneticButton";

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from("[data-reveal]", {
        opacity: 0,
        y: 30,
        duration: 1,
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
      id="contact"
      className="relative overflow-hidden bg-void px-6 py-32 text-center md:px-12 md:py-48"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(139,92,246,0.14),transparent_70%)]"
      />

      <div className="relative z-10 flex flex-col items-center">
        <div
          data-reveal
          className="mb-6 font-mono text-xs tracking-[0.3em] text-violet-soft uppercase"
        >
          {contact.eyebrow}
        </div>
        <h2
          data-reveal
          className="max-w-3xl font-display text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.05] font-medium text-ink"
        >
          {contact.heading}
        </h2>
        <p data-reveal className="mt-6 max-w-lg text-sm text-ink-dim md:text-base">
          {contact.sub}
        </p>

        <MagneticButton className="mt-12" strength={0.25}>
          <a
            href={`mailto:${contact.email}`}
            className="group flex items-center gap-3 rounded-full border border-line bg-surface px-8 py-4 font-display text-lg text-ink transition-colors hover:border-violet-soft md:text-2xl"
          >
            {contact.email}
            <ArrowUpRight className="h-5 w-5 text-violet-soft transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </MagneticButton>

        <div data-reveal className="mt-14 flex items-center gap-8">
          {contact.links.map((link) => (
            <MagneticButton key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs tracking-[0.2em] text-ink-dim uppercase transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </MagneticButton>
          ))}
        </div>
      </div>
    </section>
  );
}
