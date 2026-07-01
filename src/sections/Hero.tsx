import { lazy, Suspense, useRef } from "react";
import { gsap, useGSAP, SplitText } from "../lib/gsap";
import { profile } from "../lib/data";

const HeroScene = lazy(() =>
  import("../components/three/HeroScene").then((m) => ({ default: m.HeroScene })),
);

export function Hero({ start }: { start: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!start || !nameRef.current) return;

      gsap.set(
        [volumeRef.current, eyebrowRef.current, taglineRef.current, sublineRef.current, figureRef.current, scrollCueRef.current],
        { opacity: 0 },
      );

      SplitText.create(nameRef.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.08,
            delay: 0.2,
          });
        },
      });

      gsap.to(volumeRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
      gsap.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 0.55 });
      gsap.to([taglineRef.current, sublineRef.current], {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        delay: 0.7,
        ease: "power2.out",
      });
      gsap.to(figureRef.current, { opacity: 1, duration: 1.1, delay: 0.5, ease: "power2.out" });
      gsap.to(scrollCueRef.current, { opacity: 1, duration: 1, delay: 1.4, ease: "power2.out" });
    },
    { scope: rootRef, dependencies: [start] },
  );

  return (
    <section
      ref={rootRef}
      id="top"
      className="relative w-full bg-bone px-6 pt-28 pb-16 md:px-12 md:pt-36 md:pb-20"
    >
      <div className="grid min-w-0 gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
        <div className="flex min-w-0 flex-col gap-5">
          <div
            ref={volumeRef}
            className="font-mono text-xs tracking-[0.3em] text-rust uppercase"
          >
            {profile.volume}
          </div>

          <h1
            ref={nameRef}
            className="font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.98] font-medium text-ink"
          >
            {profile.name}
          </h1>

          <div
            ref={eyebrowRef}
            className="font-mono text-[11px] tracking-[0.25em] text-ink-dim uppercase md:text-xs"
          >
            {profile.eyebrow}
          </div>

          <p
            ref={taglineRef}
            className="pull-quote max-w-xl text-[clamp(1.3rem,2.6vw,1.9rem)]"
          >
            &ldquo;{profile.tagline}&rdquo;
          </p>

          <p ref={sublineRef} className="max-w-md text-sm text-ink-dim md:text-base">
            {profile.subline}
          </p>
        </div>

        <div ref={figureRef} className="flex min-w-0 flex-col gap-3">
          <div className="aspect-[4/5] w-full border border-line bg-paper">
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
          <div className="flex items-center justify-between gap-2 font-mono text-[10px] tracking-[0.15em] text-ink-faint uppercase">
            <span className="truncate">{profile.figureCaption}</span>
            <span className="shrink-0">R3F / WebGL</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollCueRef}
        className="mt-16 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-ink-faint uppercase md:mt-24"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute top-0 h-full w-full origin-top animate-[scrollLine_2s_ease-in-out_infinite] bg-rust" />
        </span>
      </div>
    </section>
  );
}
