import { forwardRef, useImperativeHandle, useRef } from "react";
import { nodes, tour } from "../lib/data";
import { TOUR_SEGMENTS } from "../three/MindScene";
import { Chars } from "./Chars";

export type TourCaptionsHandle = { setProgress: (p: number) => void };

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Chapter captions for the guided tour. Opacity is driven imperatively every
 * frame from scroll progress — no React re-renders.
 */
export const TourCaptions = forwardRef<TourCaptionsHandle>(function TourCaptions(
  _props,
  ref
) {
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const activeIdx = useRef(-1);

  useImperativeHandle(ref, () => ({
    setProgress(p: number) {
      // index 0: intro · 1..N: nodes · N+1: outro
      const ops: number[] = [];
      const set = (i: number, o: number) => {
        ops[i] = o;
        const el = els.current[i];
        if (el) el.style.opacity = o.toFixed(3);
      };
      set(0, 1 - ss(0.025, 0.075, p));
      nodes.forEach((_, k) => {
        const c = (k + 1) / TOUR_SEGMENTS;
        set(k + 1, ss(c - 0.085, c - 0.035, p) * (1 - ss(c + 0.035, c + 0.085, p)));
      });
      set(nodes.length + 1, ss(0.945, 0.985, p));
      if (cueRef.current) {
        cueRef.current.style.opacity = (1 - ss(0.86, 0.94, p)).toFixed(3);
      }
      // per-character reveal fires as a caption becomes the dominant one
      let best = -1;
      ops.forEach((o, i) => {
        if (o > 0.5 && (best === -1 || o > ops[best])) best = i;
      });
      if (best !== activeIdx.current) {
        activeIdx.current = best;
        els.current.forEach((el, i) => {
          if (!el) return;
          el.classList.remove("kinetic-run");
          if (i === best) {
            void el.offsetWidth; // restart the CSS animation
            el.classList.add("kinetic-run");
          }
        });
      }
    },
  }));

  return (
    <div className="captions">
      <div className="caption" ref={(el) => void (els.current[0] = el)}>
        <div className="kicker">{tour.intro.kicker}</div>
        <h2>
          You are <span className="aurora-text">inside a mind</span>.
        </h2>
        <p>{tour.intro.sub}</p>
      </div>

      {nodes.map((n, k) => (
        <div
          className="caption"
          key={n.id}
          ref={(el) => void (els.current[k + 1] = el)}
        >
          <div className="kicker" style={{ color: n.accent }}>
            {n.code}
          </div>
          <h2>
            <Chars text={n.title} />
          </h2>
          <p>{n.blurb}</p>
        </div>
      ))}

      <div
        className="caption"
        ref={(el) => void (els.current[nodes.length + 1] = el)}
      >
        <div className="kicker">{tour.outro.kicker}</div>
        <h2>
          The mind is <span className="aurora-text">yours</span> now.
        </h2>
        <p>{tour.outro.sub}</p>
      </div>

      <div className="scroll-cue" ref={cueRef}>
        SCROLL ▾
      </div>
    </div>
  );
});
