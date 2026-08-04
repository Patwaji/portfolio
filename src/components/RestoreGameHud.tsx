import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import gsap from "gsap";

export type RestoreGameHudHandle = {
  tick: (caught: number, total: number, msLeft: number, totalMs: number) => void;
};

/** Timer/score overlay while a Restore-the-Mind round is active. */
export const RestoreGameHud = forwardRef<RestoreGameHudHandle>(function RestoreGameHud(
  _props,
  ref
) {
  const [caught, setCaught] = useState(0);
  const [total, setTotal] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(rootRef.current, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
  }, []);

  useImperativeHandle(ref, () => ({
    tick(c, t, msLeft, totalMs) {
      setCaught(c);
      setTotal(t);
      if (barRef.current) {
        const frac = Math.max(0, Math.min(1, msLeft / totalMs));
        barRef.current.style.transform = `scaleX(${frac})`;
      }
    },
  }));

  return (
    <div className="restore-hud" ref={rootRef}>
      <div className="restore-title">RESTORE THE MIND</div>
      <div className="restore-bar">
        <i ref={barRef} />
      </div>
      <div className="restore-count">
        {caught}
        <span>/{total || "…"}</span>
      </div>
      <div className="restore-hint">click the drifting lights before they're lost</div>
    </div>
  );
});

export function RestoreResults({
  caught,
  total,
  ms,
  onClose,
}: {
  caught: number;
  total: number;
  ms: number;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wasBest = useRef(false);
  const best = useRef(0);

  if (best.current === 0) {
    const prevBest = Number(localStorage.getItem("sp-mind-restore-best") ?? 0);
    if (caught > prevBest) {
      localStorage.setItem("sp-mind-restore-best", String(caught));
      wasBest.current = true;
    }
    best.current = Math.max(caught, prevBest);
  }
  const full = caught === total && total > 0;

  useEffect(() => {
    gsap.fromTo(
      rootRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="restore-results-scrim" onClick={onClose}>
      <div className="restore-results" ref={rootRef} onClick={(e) => e.stopPropagation()}>
        <div className="kicker">{full ? "FULL RESTORATION" : "SESSION CLOSED"}</div>
        <div className="restore-score">
          {caught}
          <span>/{total}</span>
        </div>
        <div className="restore-meta">
          {(ms / 1000).toFixed(1)}s · best {best.current}/{total}
          {wasBest.current && <em> · new best</em>}
        </div>
        <button className="hud-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
