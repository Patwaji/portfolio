import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MindScene, TOUR_SEGMENTS } from "./three/MindScene";
import { nodes, signal } from "./lib/data";
import type { MindNode } from "./lib/data";
import { mindAudio } from "./lib/audio";
import { ach } from "./lib/achievements";
import type { Achievement } from "./lib/achievements";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { Hud } from "./components/Hud";
import { TourCaptions, type TourCaptionsHandle } from "./components/TourCaptions";
import { NodeLabels } from "./components/NodeLabels";
import { NodePanel } from "./components/NodePanel";
import { Terminal, type TerminalApi } from "./components/Terminal";
import { Toasts } from "./components/Toasts";

type Mode = "boot" | "tour" | "free" | "focus";
type NodeId = MindNode["id"];

const TOUR_KEY = "sp-mind-tour-v3";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<MindScene | null>(null);
  const [scene, setScene] = useState<MindScene | null>(null);

  const [mode, setModeState] = useState<Mode>("boot");
  const modeRef = useRef<Mode>("boot");
  const setMode = (m: Mode) => {
    modeRef.current = m;
    setModeState(m);
  };

  const [booted, setBooted] = useState(false);
  const bootedRef = useRef(false);
  const [focusedId, setFocusedId] = useState<NodeId | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const visitedRef = useRef(visited);
  const [soundOn, setSoundOn] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [achCount, setAchCount] = useState(ach.count);

  const captionsRef = useRef<TourCaptionsHandle>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const tourFinished = useRef(false);
  const hintTimer = useRef(0);

  const reducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const markVisited = (id: NodeId) => {
    if (visitedRef.current.has(id)) return;
    const next = new Set(visitedRef.current);
    next.add(id);
    visitedRef.current = next;
    setVisited(next);
    if (next.size === nodes.length) ach.unlock("synapse-walker");
  };

  const showHint = () => {
    setHintVisible(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHintVisible(false), 7000);
  };

  const focusNode = (id: NodeId) => {
    if (modeRef.current !== "free") return;
    setMode("focus");
    setFocusedId(id);
    markVisited(id);
    sceneRef.current?.focusNode(id);
    mindAudio.ping(880, 0.06);
  };

  const endTour = (animateCamera: boolean) => {
    tourFinished.current = true;
    localStorage.setItem(TOUR_KEY, "1");
    setMode("free");
    sceneRef.current?.enterFreeRoam(animateCamera);
    showHint();
  };

  const destabilize = () => {
    sceneRef.current?.burst();
    mindAudio.thump();
    ach.unlock("destabilizer");
    ach.bump("bursts", 5, "chaos-agent");
  };

  const openTerminal = () => {
    setTermOpen(true);
    ach.unlock("hacker");
  };

  // Keep latest handlers reachable from scene callbacks without re-creating the scene.
  const handlers = useRef({ focusNode, endTour });
  handlers.current = { focusNode, endTour };

  // ------------------------------------------------------------ scene setup

  useEffect(() => {
    const quality =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820
        ? "low"
        : "high";
    const s = new MindScene(canvasRef.current!, {
      quality,
      reducedMotion,
      events: {
        onNodeHover: (id) => {
          document.body.classList.toggle("node-hover", !!id);
          if (id) {
            const n = nodes.find((n) => n.id === id)!;
            mindAudio.ping(520 + n.index * 70, 0.045);
          }
        },
        onNodeClick: (id) => handlers.current.focusNode(id),
        onTourProgress: (p) => {
          captionsRef.current?.setProgress(p);
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${Math.min(p, 1)})`;
          }
          nodes.forEach((n, k) => {
            if (p > (k + 1) / TOUR_SEGMENTS - 0.03) markVisited(n.id);
          });
          if (p >= 0.988 && !tourFinished.current) {
            handlers.current.endTour(true);
          }
        },
        onSignal: (sig) => {
          if (sig === "core-touch") ach.unlock("first-contact");
          if (sig === "zoom-min") ach.unlock("deep-diver");
          if (sig === "shockwave") {
            ach.unlock("ripple");
            mindAudio.ping(300, 0.07);
          }
        },
      },
    });
    sceneRef.current = s;
    setScene(s);
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      s.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------- achievements plumbing

  useEffect(() => {
    const unsub = ach.subscribe((a) => {
      setAchCount(ach.count);
      setToasts((t) => [...t, a]);
      mindAudio.ping(920, 0.06);
      setTimeout(() => mindAudio.ping(1380, 0.05), 130);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== a.id)), 4600);
    });
    const patient = window.setTimeout(
      () => ach.unlock("patient-observer"),
      5 * 60 * 1000
    );
    return () => {
      unsub();
      clearTimeout(patient);
    };
  }, []);

  // ------------------------------------------------------- mode side-effects

  useEffect(() => {
    document.body.classList.toggle("locked", mode !== "tour");
  }, [mode]);

  useEffect(() => {
    document.body.classList.toggle("reduced-motion", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.body.classList.toggle("terminal-open", termOpen);
  }, [termOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "`" || e.key === "~") && bootedRef.current) {
        e.preventDefault();
        setTermOpen((open) => {
          if (!open) ach.unlock("hacker");
          return !open;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mode !== "tour") return;
    window.scrollTo(0, 0);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sceneRef.current?.setTourProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode]);

  // ----------------------------------------------------------------- events

  const onPreloaderDone = useCallback(() => {
    setBooted(true);
    bootedRef.current = true;
    const alreadyToured = localStorage.getItem(TOUR_KEY) === "1";
    if (alreadyToured || reducedMotion) {
      tourFinished.current = true;
      setMode("free");
      sceneRef.current?.enterFreeRoam(false);
      showHint();
    } else {
      setMode("tour");
      sceneRef.current?.setMode("tour");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const skipTour = () => endTour(true);

  const replayTour = () => {
    if (modeRef.current !== "free") return;
    tourFinished.current = false;
    sceneRef.current?.resetTour();
    setMode("tour");
  };

  const toggleSound = () => setSoundOn(mindAudio.toggle());

  const onNodeLabelHover = (id: NodeId | null) => {
    document.body.classList.toggle("node-hover", !!id);
    if (id) {
      const n = nodes.find((n) => n.id === id)!;
      mindAudio.ping(520 + n.index * 70, 0.045);
    }
  };

  const termApi: TerminalApi = {
    openNode: (id) => {
      if (modeRef.current === "focus")
        return "already focused. close the current node first (ESC).";
      if (modeRef.current !== "free") return "finish or skip the tour first.";
      setTermOpen(false);
      setTimeout(() => focusNode(id), 250);
      const n = nodes.find((n) => n.id === id)!;
      return `flying to ${n.code} · ${n.title}…`;
    },
    replayTour: () => {
      if (modeRef.current !== "free") return "can't resync from here.";
      setTermOpen(false);
      setTimeout(() => replayTour(), 250);
      return "resyncing…";
    },
    destabilize,
    gravity: () => {
      sceneRef.current?.gravityFor(10);
      ach.unlock("gravity-bender");
    },
    excite: () => sceneRef.current?.exciteFor(6),
    calm: () => sceneRef.current?.toggleCalm() ?? false,
    matrix: () => sceneRef.current?.matrixFor(12),
    aurora: () => sceneRef.current?.setHueShift(Math.random()),
    sound: (on) => {
      if (on !== mindAudio.isEnabled) setSoundOn(mindAudio.toggle());
    },
    sudoHire: () => {
      ach.unlock("root-access");
      setTimeout(() => window.open(`mailto:${signal.email}`), 900);
    },
    visited: () => visitedRef.current,
    close: () => setTermOpen(false),
  };

  // ----------------------------------------------------------------- render

  return (
    <>
      <canvas className="gl-canvas" ref={canvasRef} />

      {mode === "tour" && (
        <div
          className="tour-spacer"
          style={{ height: `${TOUR_SEGMENTS * 110}vh` }}
        />
      )}

      {scene && (
        <NodeLabels scene={scene} onHover={onNodeLabelHover} onClick={focusNode} />
      )}

      {mode === "tour" && (
        <>
          <TourCaptions ref={captionsRef} />
          <div className="tour-progress">
            <i ref={progressRef} />
          </div>
        </>
      )}

      <div className="vignette" />

      <Hud
        mode={mode}
        focusedId={focusedId}
        visited={visited}
        soundOn={soundOn}
        hintVisible={hintVisible}
        achCount={achCount}
        achTotal={ach.total}
        onToggleSound={toggleSound}
        onSkipTour={skipTour}
        onReplayTour={replayTour}
        onOpenTerminal={openTerminal}
      />

      {focusedId && (
        <NodePanel
          nodeId={focusedId}
          onCloseStart={() => {
            sceneRef.current?.unfocus();
            setMode("free");
          }}
          onClosed={() => setFocusedId(null)}
          onDestabilize={destabilize}
        />
      )}

      {termOpen && <Terminal api={termApi} />}
      <Toasts items={toasts} />

      <div className="noise" />

      {!reducedMotion && <Cursor />}

      {!booted && <Preloader onDone={onPreloaderDone} />}
    </>
  );
}
