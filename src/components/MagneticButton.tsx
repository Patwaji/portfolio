import { useRef, type MouseEvent, type ReactNode } from "react";
import { gsap } from "../lib/gsap";
import { useIsFinePointer } from "../hooks/useMediaQuery";

export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isFinePointer = useIsFinePointer();
  const quickX = useRef<((v: number) => void) | null>(null);
  const quickY = useRef<((v: number) => void) | null>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !isFinePointer) return;
    quickX.current ??= gsap.quickTo(ref.current, "x", { duration: 0.5, ease: "power3" });
    quickY.current ??= gsap.quickTo(ref.current, "y", { duration: 0.5, ease: "power3" });

    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    quickX.current(relX * strength);
    quickY.current(relY * strength);
  };

  const handleLeave = () => {
    quickX.current?.(0);
    quickY.current?.(0);
  };

  return (
    <div
      ref={ref}
      data-cursor-hover
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}
