import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { tracker } from "../lib/fingerprint";
import { mindAudio } from "../lib/audio";
import { Chars } from "./Chars";

const fmtTime = (ms: number) => {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

export function FingerprintPanel({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const summary = useRef(tracker.summary()).current;
  const mobile = window.innerWidth < 760;

  useLayoutEffect(() => {
    const items = panelRef.current!.querySelectorAll("[data-anim]");
    mindAudio.whoosh(true);
    gsap.fromTo(
      panelRef.current,
      mobile ? { yPercent: 100 } : { xPercent: 100 },
      { xPercent: 0, yPercent: 0, duration: 0.9, ease: "power4.out" }
    );
    gsap.fromTo(scrimRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    gsap.fromTo(
      items,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.055, delay: 0.28, ease: "power3.out" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    mindAudio.whoosh(false);
    gsap.to(scrimRef.current, { opacity: 0, duration: 0.5 });
    gsap.to(panelRef.current, {
      ...(mobile ? { yPercent: 100 } : { xPercent: 100 }),
      duration: 0.65,
      ease: "power3.in",
      onComplete: onClose,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dwellEntries = Object.entries(summary.dwell) as [string, number][];
  const maxDwell = Math.max(1, ...dwellEntries.map(([, v]) => v));

  return (
    <>
      <div className="panel-scrim" ref={scrimRef} onClick={close} />
      <div className="panel" ref={panelRef} style={{ ["--panel-accent" as string]: "#4ff0d1" }}>
        <button className="panel-close" onClick={close}>
          [ CLOSE × ]
        </button>
        <div className="p-code" data-anim>
          SESSION · YOUR DATA
        </div>
        <div className="p-status" data-anim>
          REAL · NOT SIMULATED · MOUSE &amp; SCROLL ONLY
        </div>
        <h2 data-anim className="kinetic-run">
          <Chars text="Your cognitive fingerprint." />
        </h2>
        <p className="p-oneliner" data-anim>
          What Cogniflow does with a camera, this does honestly with the signals you're already giving off.
        </p>

        <div className="instrument" data-anim>
          <div className="inst-head">
            <span>ATTENTION BY NODE</span>
            <span className="rec">LIVE</span>
          </div>
          <div className="fp-bars">
            {dwellEntries.length === 0 && (
              <div className="fp-empty">no node visited long enough to register yet.</div>
            )}
            {dwellEntries.map(([id, ms]) => (
              <div className="fp-bar-row" key={id}>
                <span className="fp-bar-label">{id}</span>
                <div className="fp-bar-track">
                  <div
                    className="fp-bar-fill"
                    style={{ width: `${Math.max(4, (ms / maxDwell) * 100)}%` }}
                  />
                </div>
                <span className="fp-bar-value">{fmtTime(ms)}</span>
              </div>
            ))}
          </div>
          <div className="readouts">
            <div className="r">
              <b>{fmtTime(summary.sessionMs)}</b>
              <i>Time inside</i>
            </div>
            <div className="r">
              <b>{summary.nodesVisited}/5</b>
              <i>Nodes visited</i>
            </div>
            <div className="r">
              <b>{summary.latencyMs !== null ? `${(summary.latencyMs / 1000).toFixed(1)}s` : "—"}</b>
              <i>Curiosity latency</i>
            </div>
          </div>
        </div>

        <div className="p-section" data-anim>
          READ
        </div>
        <p className="p-body" data-anim>
          {summary.topNode
            ? `You lingered longest on ${summary.topNode.title} — ${fmtTime(summary.topNodeMs)}. `
            : "You haven't stayed on any one node long enough to read a pattern yet. "}
          {summary.chaos > 3
            ? "You'd rather break something and see what happens than read the instructions."
            : summary.interactions > 6
              ? "You explore by touching things, not just looking."
              : "You move carefully — reading before acting."}
        </p>
      </div>
    </>
  );
}
