import { profile } from "../lib/data";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-line bg-void px-6 py-8 text-center font-mono text-[11px] tracking-wide text-ink-faint uppercase md:flex-row md:justify-between md:px-12">
      <span>
        {profile.initials} © 2026 {profile.name}
      </span>
      <span>Built with React Three Fiber, GSAP &amp; too much coffee.</span>
    </footer>
  );
}
