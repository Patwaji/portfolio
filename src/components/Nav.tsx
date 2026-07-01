import { useRef, type MouseEvent } from "react";
import { ScrollTrigger, useGSAP } from "../lib/gsap";
import { useLenis } from "../hooks/useLenis";
import { navLinks, profile } from "../lib/data";
import { MagneticButton } from "./MagneticButton";

export function Nav() {
  const progressRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${self.progress})`;
        }
      },
    });
  }, []);

  const goTo = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(href === "#top" ? 0 : href, { offset: -32, duration: 1.4 });
    } else {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        ref={progressRef}
        className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-violet via-violet-soft to-cyan"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 backdrop-blur-md [background:linear-gradient(to_bottom,var(--color-void)_0%,var(--color-void)_55%,transparent_100%)]"
      />
      <nav className="relative flex items-center justify-between px-6 py-5 md:px-12">
        <a
          href="#top"
          onClick={goTo("#top")}
          data-cursor-hover
          className="font-display text-lg font-medium tracking-wide text-ink"
          aria-label={`${profile.name} — back to top`}
        >
          {profile.initials}
          <span className="text-violet-soft">.</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={goTo(link.href)}
              data-cursor-hover
              className="font-mono text-xs tracking-[0.2em] text-ink-dim uppercase transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <MagneticButton>
          <a
            href="#contact"
            onClick={goTo("#contact")}
            className="rounded-full border border-line px-4 py-2 font-mono text-xs tracking-[0.2em] text-ink uppercase transition-colors hover:border-violet-soft hover:text-violet-soft"
          >
            Say Hi
          </a>
        </MagneticButton>
      </nav>
    </header>
  );
}
