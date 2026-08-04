import { useEffect, useMemo, useRef, useState } from "react";
import { MindScene, TOUR_SEGMENTS } from "./three/MindScene";
import type { RestoreResult } from "./three/MindScene";
import { nodes, signal } from "./lib/data";
import type { MindNode } from "./lib/data";
import { mindAudio, NODE_SCALE } from "./lib/audio";
import { ach } from "./lib/achievements";
import type { Achievement } from "./lib/achievements";
import { getMindSeed } from "./lib/seed";
import { tracker } from "./lib/fingerprint";
import { FingerprintPanel } from "./components/FingerprintPanel";
import { Preloader, type BootPhase } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { Hud } from "./components/Hud";
import { TourCaptions, type TourCaptionsHandle } from "./components/TourCaptions";
import { NodeLabels } from "./components/NodeLabels";
import { NodePanel } from "./components/NodePanel";
import { Terminal, type TerminalApi } from "./components/Terminal";
import { Toasts } from "./components/Toasts";
import {
  RestoreGameHud,
  RestoreResults,
  type RestoreGameHudHandle,
} from "./components/RestoreGameHud";
import { ThoughtCatcher, ThoughtHud, ThoughtResults } from "./components/ThoughtCatcher";

const RESTORE_SECONDS = 24;

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

  const bootedRef = useRef(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootPhase, setBootPhase] = useState<BootPhase>("loading");
  const [drowsy, setDrowsy] = useState(false);
  const drowsyRef = useRef(false);
  const lastActivity = useRef(Date.now());
  const kbIdx = useRef(-1);
  const lastTourSeg = useRef(-1);
  const [focusedId, setFocusedId] = useState<NodeId | null>(null);
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const visitedRef = useRef(visited);
  const [soundOn, setSoundOn] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [fingerprintOpen, setFingerprintOpen] = useState(false);
  const [restoreActive, setRestoreActive] = useState(false);
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null);
  const restoreHudRef = useRef<RestoreGameHudHandle>(null);
  const restoreCaughtPrev = useRef(0);

  const [thoughtActive, setThoughtActive] = useState(false);
  const [thoughtList, setThoughtList] = useState<{ id: number; phrase: string }[]>([]);
  const [thoughtStats, setThoughtStats] = useState({ score: 0, combo: 0, misses: 0 });
  const [thoughtGameOver, setThoughtGameOver] = useState<number | null>(null);
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
  const mindSeed = useMemo(() => getMindSeed(), []);

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
    tracker.enterNode(id);
    tracker.interact();
    if (location.hash.slice(1) !== id) {
      history.pushState({ node: id }, "", `#${id}`);
    }
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
    tracker.chaosEvent();

    // Destabilizing isn't just a toy — it launches Restore the Mind: close
    // whatever's open, pull back to a clear view, then spawn the motes.
    setFocusedId(null);
    setMode("free");
    sceneRef.current?.unfocus();
    setRestoreResult(null);
    restoreCaughtPrev.current = 0;
    window.setTimeout(() => {
      sceneRef.current?.startRestoreGame(12, RESTORE_SECONDS);
      setRestoreActive(true);
    }, 700);
  };

  const openTerminal = () => {
    setTermOpen(true);
    ach.unlock("hacker");
  };

  const openFingerprint = () => {
    setTermOpen(false);
    setFingerprintOpen(true);
    ach.unlock("self-aware");
  };

  const startThoughtGame = () => {
    setThoughtList([]);
    setThoughtStats({ score: 0, combo: 0, misses: 0 });
    setThoughtGameOver(null);
    sceneRef.current?.startThoughtGame();
    setThoughtActive(true);
  };

  /** After the genesis morph: route to tour, free-roam, or a deep-linked node. */
  const finishBoot = () => {
    bootedRef.current = true;
    const hashNode = nodes.find((n) => n.id === location.hash.slice(1));
    const alreadyToured = localStorage.getItem(TOUR_KEY) === "1";
    if (hashNode) {
      tourFinished.current = true;
      setMode("free");
      sceneRef.current?.enterFreeRoam(false);
      window.setTimeout(() => focusNode(hashNode.id), 700);
    } else if (alreadyToured || reducedMotion) {
      tourFinished.current = true;
      setMode("free");
      sceneRef.current?.enterFreeRoam(false);
      showHint();
    } else {
      setMode("tour");
      sceneRef.current?.setMode("tour");
    }
  };

  // Keep latest handlers reachable from scene callbacks without re-creating the scene.
  const handlers = useRef({ focusNode, endTour, finishBoot });
  handlers.current = { focusNode, endTour, finishBoot };

  // ------------------------------------------------------------ scene setup

  useEffect(() => {
    // day-stable mind seed: shifts the CSS hue-drift start point and the
    // ambient drone's detune so the mind looks/sounds slightly different
    // than it did yesterday, without breaking anything spatial.
    mindAudio.setSeed(mindSeed.detune);
    document.documentElement.style.animationDelay = `${-mindSeed.hue * 30}s`;
    tracker.start();

    const quality =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 820
        ? "low"
        : "high";
    const s = new MindScene(canvasRef.current!, {
      quality,
      reducedMotion,
      rand: mindSeed.rand,
      hueSeed: mindSeed.hue,
      events: {
        onNodeHover: (id) => {
          document.body.classList.toggle("node-hover", !!id);
          if (id) {
            const n = nodes.find((n) => n.id === id)!;
            mindAudio.note(NODE_SCALE[n.index], 0.07);
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
          // soft tick as each chapter arrives
          const seg = Math.min(Math.floor(p * TOUR_SEGMENTS + 0.5), TOUR_SEGMENTS);
          if (seg !== lastTourSeg.current) {
            if (lastTourSeg.current >= 0 && p > 0.02) mindAudio.ping(460 + seg * 50, 0.035);
            lastTourSeg.current = seg;
          }
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
            tracker.chaosEvent();
          }
          if (sig === "well-drop") {
            ach.unlock("gravity-bender");
            mindAudio.note(NODE_SCALE[3], 0.06, 1.4);
            tracker.chaosEvent();
          }
        },
        onRestoreTick: (caught, total, msLeft) => {
          restoreHudRef.current?.tick(caught, total, msLeft, RESTORE_SECONDS * 1000);
          if (caught > restoreCaughtPrev.current) {
            const step = NODE_SCALE[(caught - 1) % NODE_SCALE.length];
            mindAudio.note(step * (1 + Math.floor((caught - 1) / NODE_SCALE.length) * 0.5), 0.08, 0.5);
          }
          restoreCaughtPrev.current = caught;
        },
        onRestoreEnd: (result) => {
          setRestoreActive(false);
          setRestoreResult(result);
          if (result.total > 0 && result.caught === result.total) {
            ach.unlock("full-restoration");
          }
        },
        onThoughtSpawn: (id, phrase) => {
          setThoughtList((list) => [...list, { id, phrase }]);
        },
        onThoughtGone: (id) => {
          setThoughtList((list) => list.filter((t) => t.id !== id));
        },
        onThoughtScore: (score, combo, misses) => {
          setThoughtStats({ score, combo, misses });
          if (combo > 0) mindAudio.note(NODE_SCALE[combo % NODE_SCALE.length], 0.07, 0.4);
          if (score >= 10) ach.unlock("quick-mind");
        },
        onThoughtGameOver: (score) => {
          setThoughtActive(false);
          setThoughtGameOver(score);
        },
      },
    });
    sceneRef.current = s;
    setScene(s);
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    if (window.matchMedia("(pointer: coarse)").matches) s.enableGyro();

    // ---- real boot: progress reflects fonts + shader compilation ----
    let cancelled = false;
    const prog = { fonts: 0, warm: 0, time: 0 };
    const update = () =>
      setBootProgress(Math.min(1, prog.fonts * 0.3 + prog.warm * 0.55 + prog.time * 0.15));
    document.fonts.ready.then(() => {
      prog.fonts = 1;
      update();
    });
    const t0 = performance.now();
    const ticker = window.setInterval(() => {
      prog.time = Math.min(1, (performance.now() - t0) / 1500);
      update();
      if (prog.time >= 1) window.clearInterval(ticker);
    }, 90);

    (async () => {
      await s.warmup();
      prog.warm = 1;
      update();
      await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 350)); // let the bar land on 100
      if (cancelled) return;
      setBootPhase("leaving");
      await new Promise((r) => setTimeout(r, 900)); // fade out
      if (cancelled) return;
      setBootPhase("done");
      handlers.current.finishBoot();
    })();

    return () => {
      cancelled = true;
      window.clearInterval(ticker);
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
        return;
      }
      // keyboard navigation of the constellation (free-roam only)
      if (
        modeRef.current !== "free" ||
        document.body.classList.contains("terminal-open") ||
        (e.target as HTMLElement)?.tagName === "INPUT"
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Tab") {
        e.preventDefault();
        const dir = e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey) ? -1 : 1;
        kbIdx.current = (kbIdx.current + dir + nodes.length) % nodes.length;
        const n = nodes[kbIdx.current];
        sceneRef.current?.setExternalHover(n.id);
        document.body.classList.add("node-hover");
        mindAudio.note(NODE_SCALE[n.index], 0.07);
      } else if (e.key === "Enter" && kbIdx.current >= 0) {
        e.preventDefault();
        const n = nodes[kbIdx.current];
        sceneRef.current?.setExternalHover(null);
        document.body.classList.remove("node-hover");
        handlers.current.focusNode(n.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------- deep links (back/forward)

  useEffect(() => {
    const onPop = () => {
      const id = location.hash.slice(1);
      const node = nodes.find((n) => n.id === id);
      if (!node && modeRef.current === "focus") {
        // back button while a panel is open: close it
        sceneRef.current?.unfocus();
        tracker.exitNode();
        setMode("free");
        setFocusedId(null);
      } else if (node && modeRef.current === "free") {
        handlers.current.focusNode(node.id);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------- whisper mode (idle)

  useEffect(() => {
    const wake = () => {
      lastActivity.current = Date.now();
      if (drowsyRef.current) {
        drowsyRef.current = false;
        setDrowsy(false);
        sceneRef.current?.setDrowsy(false);
        sceneRef.current?.exciteFor(1.2);
      }
    };
    const check = window.setInterval(() => {
      if (
        !drowsyRef.current &&
        modeRef.current === "free" &&
        Date.now() - lastActivity.current > 45000
      ) {
        drowsyRef.current = true;
        setDrowsy(true);
        sceneRef.current?.setDrowsy(true);
      }
    }, 5000);
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("wheel", wake);
    return () => {
      window.clearInterval(check);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("wheel", wake);
    };
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
      mindAudio.note(NODE_SCALE[n.index], 0.07);
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
    fingerprint: () => {
      setTimeout(openFingerprint, 200);
      return "compiling your session into a readout…";
    },
    playCatch: () => {
      if (modeRef.current !== "free") return "finish or skip the tour first.";
      setTermOpen(false);
      setTimeout(startThoughtGame, 200);
      return "loosening a few thoughts…";
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
        drowsy={drowsy}
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
            tracker.exitNode();
            if (location.hash) {
              history.replaceState(null, "", location.pathname + location.search);
            }
          }}
          onClosed={() => setFocusedId(null)}
          onDestabilize={destabilize}
        />
      )}

      {termOpen && <Terminal api={termApi} />}
      {fingerprintOpen && (
        <FingerprintPanel onClose={() => setFingerprintOpen(false)} />
      )}
      {restoreActive && <RestoreGameHud ref={restoreHudRef} />}
      {restoreResult && (
        <RestoreResults
          caught={restoreResult.caught}
          total={restoreResult.total}
          ms={restoreResult.ms}
          onClose={() => setRestoreResult(null)}
        />
      )}

      {scene && thoughtActive && (
        <ThoughtCatcher
          scene={scene}
          thoughts={thoughtList}
          onCatch={(id) => sceneRef.current?.catchThought(id)}
        />
      )}
      {thoughtActive && (
        <ThoughtHud
          score={thoughtStats.score}
          combo={thoughtStats.combo}
          misses={thoughtStats.misses}
        />
      )}
      {thoughtGameOver !== null && (
        <ThoughtResults score={thoughtGameOver} onClose={() => setThoughtGameOver(null)} />
      )}

      <Toasts items={toasts} />

      <div className="noise" />

      {!reducedMotion && <Cursor />}

      {bootPhase !== "done" && <Preloader progress={bootProgress} phase={bootPhase} />}
    </>
  );
}
