import { bootLines } from "../lib/data";

export type BootPhase = "loading" | "leaving" | "done";

/**
 * Real preloader: progress reflects actual work (font load + shader
 * compilation), then fades out to reveal the already-running mind.
 */
export function Preloader({
  progress,
  phase,
}: {
  progress: number;
  phase: BootPhase;
}) {
  const pct = Math.round(progress * 100);
  const visibleLines = Math.ceil(progress * bootLines.length);

  return (
    <div className={`preloader phase-${phase}`}>
      <div className="preloader-bg" />
      <div className="preloader-ui" style={{ opacity: phase === "loading" ? 1 : 0 }}>
        <div className="boot-log">
          {bootLines.map((l, i) => {
            const [head, tail] = splitTail(l);
            return (
              <div
                className="line"
                key={i}
                style={{ opacity: i < visibleLines ? 1 : 0 }}
              >
                {head}
                {tail && <em>{tail}</em>}
              </div>
            );
          })}
        </div>
        <div className="pct">{String(pct).padStart(3, "0")}</div>
        <div className="bar">
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  );
}

/** Color the value after the dotted leader ("OK", "47", "UNBOUNDED"…). */
function splitTail(line: string): [string, string | null] {
  const m = line.match(/^(.*\.{2,} )(.+)$/);
  return m ? [m[1], m[2]] : [line, null];
}
