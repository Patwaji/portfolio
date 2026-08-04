import { useEffect, useState } from "react";
import type { MindScene } from "../three/MindScene";

type ThoughtItem = { id: number; phrase: string };

/**
 * Renders the floating catchable phrases for "Catch the Thought". Position,
 * fade and lifespan are driven imperatively by MindScene every frame (same
 * projection technique as NodeLabels) — this component only mounts/unmounts
 * the DOM nodes and forwards clicks.
 */
export function ThoughtCatcher({
  scene,
  thoughts,
  onCatch,
}: {
  scene: MindScene;
  thoughts: ThoughtItem[];
  onCatch: (id: number) => void;
}) {
  return (
    <>
      {thoughts.map((th) => (
        <div
          key={th.id}
          className="thought-label"
          ref={(el) => scene.registerThoughtLabel(th.id, el)}
          onClick={() => onCatch(th.id)}
        >
          {th.phrase}
        </div>
      ))}
    </>
  );
}

export function ThoughtHud({
  score,
  combo,
  misses,
}: {
  score: number;
  combo: number;
  misses: number;
}) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    setPulse(true);
    const id = window.setTimeout(() => setPulse(false), 260);
    return () => clearTimeout(id);
  }, [score]);

  return (
    <div className="thought-hud">
      <div className="thought-title">CATCH THE THOUGHT</div>
      <div className={`thought-score${pulse ? " pulse" : ""}`}>{score}</div>
      {combo >= 3 && <div className="thought-combo">×{combo} combo</div>}
      <div className="thought-lives">
        {[0, 1, 2].map((i) => (
          <i key={i} className={i < 3 - misses ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}

export function ThoughtResults({
  score,
  onClose,
}: {
  score: number;
  onClose: () => void;
}) {
  const best = Math.max(score, Number(localStorage.getItem("sp-mind-thought-best") ?? 0));
  const isBest = score >= best && score > 0;
  if (isBest) localStorage.setItem("sp-mind-thought-best", String(score));

  return (
    <div className="restore-results-scrim" onClick={onClose}>
      <div
        className="restore-results thought-results"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kicker">THREE LOST · SESSION OVER</div>
        <div className="restore-score">{score}</div>
        <div className="restore-meta">
          best {best}
          {isBest && <em> · new best</em>}
        </div>
        <button className="hud-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
}
