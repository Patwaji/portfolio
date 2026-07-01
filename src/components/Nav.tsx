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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bone">
      <div
        ref={progressRef}
        className="h-[2px] w-full origin-left scale-x-0 bg-rust"
      />
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <a
          href="#top"
          onClick={goTo("#top")}
          data-cursor-hover
          className="font-display text-xl text-ink italic"
          aria-label={`${profile.name} — back to top`}
        >
          {profile.initials}
          <span className="text-rust">.</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={goTo(link.href)}
              data-cursor-hover
              className="border-b border-transparent pb-0.5 font-mono text-xs tracking-[0.2em] text-ink-dim uppercase transition-colors hover:border-rust hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <MagneticButton>
          <a
            href="#contact"
            onClick={goTo("#contact")}
            className="border border-ink px-4 py-2 font-mono text-xs tracking-[0.2em] text-ink uppercase transition-colors hover:bg-ink hover:text-bone"
          >
            Say Hi
          </a>
        </MagneticButton>
      </nav>
    </header>
  );
}
