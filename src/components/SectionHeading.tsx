import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  heading,
  number,
  align = "left",
  className = "",
}: {
  eyebrow: string;
  heading: ReactNode;
  number?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${align === "center" ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      <div className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-rust uppercase">
        {number && <span className="text-ink-faint">{number}</span>}
        <span className="h-px w-8 bg-rust/50" />
        {eyebrow}
      </div>
      <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] font-medium text-ink">
        {heading}
      </h2>
    </div>
  );
}
