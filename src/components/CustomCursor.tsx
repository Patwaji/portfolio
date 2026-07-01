import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useIsFinePointer, usePrefersReducedMotion } from "../hooks/useMediaQuery";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isFinePointer = useIsFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const active = isFinePointer && !reducedMotion;

  useEffect(() => {
    if (!active) return;

    document.body.classList.add("cursor-none-fine");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor-hover]")) {
        gsap.to(ring, { scale: 2.2, opacity: 0.5, duration: 0.35, ease: "power3.out" });
        gsap.to(dot, { scale: 0, duration: 0.25 });
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cursor-hover]")) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.25 });
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.body.classList.remove("cursor-none-fine");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-soft/70"
      />
    </>
  );
}
