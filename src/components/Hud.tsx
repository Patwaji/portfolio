import { useEffect, useState } from "react";
import { nodes, profile } from "../lib/data";
import type { MindNode } from "../lib/data";

type Mode = "boot" | "tour" | "free" | "focus";

const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#";

/** Terminal-style text scramble whenever the value changes. */
function useScramble(value: string) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    let frame = 0;
    const iv = window.setInterval(() => {
      frame++;
      const reveal = Math.ceil((frame * value.length) / 12);
      if (reveal >= value.length) {
        setDisplay(value);
        window.clearInterval(iv);
        return;
      }
      setDisplay(
        value
          .split("")
          .map((c, i) =>
            i < reveal || c === " "
              ? c
              : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]
          )
          .join("")
      );
    }, 30);
    return () => window.clearInterval(iv);
  }, [value]);
  return display;
}

export function Hud({
  mode,
  focusedId,
  visited,
  soundOn,
  drowsy,
  hintVisible,
  achCount,
  achTotal,
  onToggleSound,
  onSkipTour,
  onReplayTour,
  onOpenTerminal,
}: {
  mode: Mode;
  focusedId: MindNode["id"] | null;
  visited: Set<string>;
  soundOn: boolean;
  drowsy: boolean;
  hintVisible: boolean;
  achCount: number;
  achTotal: number;
  onToggleSound: () => void;
  onSkipTour: () => void;
  onReplayTour: () => void;
  onOpenTerminal: () => void;
}) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", { hour12: false })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const focusedNode = nodes.find((n) => n.id === focusedId);
  const status = useScramble(
    drowsy
      ? "DRIFTING… // TOUCH TO WAKE"
      : mode === "boot"
        ? "BOOTING…"
        : mode === "tour"
          ? "GUIDED SYNC // YOU DRIVE"
          : mode === "focus" && focusedNode
            ? `FOCUS // ${focusedNode.code}`
            : "FREE ROAM // MIND UNLOCKED"
  );

  return (
    <div className="hud">
      <div className="corner-tl">
        <div className="logo">
          {profile.system} <span>{profile.version}</span>
        </div>
        <div className="status">
          <span className="dot" />
          {status}
        </div>
      </div>

      <div className="corner-tr">
        <div className="row">
          <button className="hud-btn" onClick={onToggleSound}>
            SND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
        <div className="clock">{clock} · LOCAL</div>
      </div>

      <div className="corner-bl">
        <div className="nodes-tracker">
          {nodes.map((n) => (
            <span
              key={n.id}
              className={`tick${visited.has(n.id) ? " visited" : ""}`}
            >
              <i>{String(n.index + 1).padStart(2, "0")}</i>
              {visited.has(n.id) ? "●" : "○"}
            </span>
          ))}
        </div>
        <div className="tracker-caption">NODES EXPLORED</div>
        <div className="ach-count">ACH {achCount}/{achTotal}</div>
      </div>

      <div className="corner-br">
        <div className="row">
          {mode === "tour" && (
            <button className="hud-btn" onClick={onSkipTour}>
              SKIP TOUR →
            </button>
          )}
          {(mode === "free" || mode === "focus") && (
            <button className="hud-btn" onClick={onOpenTerminal}>
              &gt;_ TERMINAL
            </button>
          )}
          {mode === "free" && (
            <button className="hud-btn" onClick={onReplayTour}>
              ↻ REPLAY TOUR
            </button>
          )}
        </div>
      </div>

      <div className="hint" style={{ opacity: hintVisible ? 1 : 0 }}>
        DRAG TO ORBIT · SCROLL TO ZOOM · CLICK A NODE
      </div>
    </div>
  );
}
