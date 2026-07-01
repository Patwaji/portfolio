import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

export function GazeScanner() {
  const sweepRef = useRef<SVGGElement>(null);
  const pupilRef = useRef<SVGCircleElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.to(sweepRef.current, {
        rotate: 360,
        duration: 6,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });

      const wander = gsap.timeline({ repeat: -1, yoyo: true });
      for (let i = 0; i < 5; i++) {
        wander.to(pupilRef.current, {
          x: gsap.utils.random(-14, 14),
          y: gsap.utils.random(-14, 14),
          duration: gsap.utils.random(1, 2),
          ease: "sine.inOut",
        });
      }
    },
    { dependencies: [reducedMotion] },
  );

  return (
    <svg viewBox="0 0 240 240" className="h-full w-full">
      <defs>
        <linearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {[100, 76, 52, 28].map((r) => (
        <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#1e1e30" strokeWidth="1" />
      ))}
      <line x1="120" y1="8" x2="120" y2="232" stroke="#1e1e30" strokeWidth="1" />
      <line x1="8" y1="120" x2="232" y2="120" stroke="#1e1e30" strokeWidth="1" />

      <g ref={sweepRef}>
        <path
          d="M120 120 L120 20 A100 100 0 0 1 190 50 Z"
          fill="url(#sweepGradient)"
          opacity="0.35"
        />
      </g>

      <circle cx="120" cy="120" r="100" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />
      <circle ref={pupilRef} cx="120" cy="120" r="5" fill="#22d3ee" />
      <circle cx="120" cy="120" r="2" fill="#f5f4f8" />
    </svg>
  );
}
