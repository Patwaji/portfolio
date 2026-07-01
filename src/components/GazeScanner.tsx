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
          <stop offset="0%" stopColor="#b8502f" stopOpacity="0" />
          <stop offset="100%" stopColor="#b8502f" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {[100, 76, 52, 28].map((r) => (
        <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#ddd5c5" strokeWidth="1" />
      ))}
      <line x1="120" y1="8" x2="120" y2="232" stroke="#ddd5c5" strokeWidth="1" />
      <line x1="8" y1="120" x2="232" y2="120" stroke="#ddd5c5" strokeWidth="1" />

      <g ref={sweepRef}>
        <path
          d="M120 120 L120 20 A100 100 0 0 1 190 50 Z"
          fill="url(#sweepGradient)"
          opacity="0.6"
        />
      </g>

      <circle cx="120" cy="120" r="100" fill="none" stroke="#1c1a17" strokeWidth="1" opacity="0.35" />
      <circle ref={pupilRef} cx="120" cy="120" r="5" fill="#7a3018" />
      <circle cx="120" cy="120" r="2" fill="#1c1a17" />
    </svg>
  );
}
