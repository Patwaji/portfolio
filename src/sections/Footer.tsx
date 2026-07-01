import type { MouseEvent } from "react";
import { colophon } from "../lib/data";
import { useLenis } from "../hooks/useLenis";

export function Footer() {
  const lenis = useLenis();

  const backToTop = (e: MouseEvent) => {
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-line bg-bone-deep px-6 py-12 md:px-12">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-display text-lg text-ink italic">{colophon.heading}</div>
          <ul className="mt-3 flex flex-col gap-1">
            {colophon.lines.map((line) => (
              <li key={line} className="font-mono text-[11px] tracking-wide text-ink-faint uppercase">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <a
          href="#top"
          onClick={backToTop}
          data-cursor-hover
          className="border-b border-transparent pb-0.5 font-mono text-[11px] tracking-[0.2em] text-ink-dim uppercase transition-colors hover:border-rust hover:text-ink"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
