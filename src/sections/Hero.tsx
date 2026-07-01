import { lazy, Suspense, useRef } from "react";
import { gsap, useGSAP, SplitText } from "../lib/gsap";
import { profile } from "../lib/data";

const HeroScene = lazy(() =>
  import("../components/three/HeroScene").then((m) => ({ default: m.HeroScene })),
);

export function Hero({ start }: { start: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!start || !nameRef.current) return;

      gsap.set([eyebrowRef.current, taglineRef.current, sublineRef.current, scrollCueRef.current], {
        opacity: 0,
      });

      SplitText.create(nameRef.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            rotate: 2,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.08,
          });
        },
      });

      gsap.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.1 });
      gsap.to([taglineRef.current, sublineRef.current], {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        delay: 0.7,
        ease: "power2.out",
      });
      gsap.to(scrollCueRef.current, { opacity: 1, duration: 1, delay: 1.4, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [start] },
  );

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative flex h-svh min-h-[720px] w-full flex-col justify-end overflow-hidden bg-void px-6 pb-16 md:px-12 md:pb-20"
    >
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_100%,rgba(139,92,246,0.18),transparent_70%)]"
      />

      <div className="relative z-10 flex flex-col gap-6">
        <div
          ref={eyebrowRef}
          className="font-mono text-[11px] tracking-[0.35em] text-violet-soft uppercase md:text-xs"
        >
          {profile.eyebrow}
        </div>

        <h1
          ref={nameRef}
          className="font-display text-[clamp(2.75rem,11vw,8.5rem)] leading-[0.95] font-medium text-ink uppercase"
        >
          {profile.name}
        </h1>

        <p
          ref={taglineRef}
          className="max-w-2xl font-display text-[clamp(1.15rem,2.6vw,1.85rem)] leading-snug text-gradient"
        >
          {profile.tagline}
        </p>

        <p ref={sublineRef} className="max-w-xl text-sm text-ink-dim md:text-base">
          {profile.subline}
        </p>
      </div>

      <div
        ref={scrollCueRef}
        className="absolute right-6 bottom-6 z-10 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-ink-faint uppercase md:right-12"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute top-0 h-full w-full origin-top animate-[scrollLine_2s_ease-in-out_infinite] bg-gradient-to-b from-cyan to-transparent" />
        </span>
      </div>
    </section>
  );
}
