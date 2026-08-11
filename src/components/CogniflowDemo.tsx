import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * A real, in-browser slice of CogniFlow. It loads MediaPipe's Face Landmarker
 * (the same engine CogniFlow uses), reads the webcam locally, and derives the
 * four coarse attention states — exactly the honest signals the project is
 * built on. No frame ever leaves the page: this IS the privacy pitch, live.
 */

type Attn = "Focused" | "Drifting" | "Drowsy" | "Away";
type Phase = "idle" | "loading" | "running" | "error";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// anti-flicker: a candidate state must hold this long before it's committed
const HYSTERESIS_MS = 500;
const YAW_AWAY_DEG = 22;
const EYES_CLOSED = 0.5;

export function CogniflowDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const lastVideoTime = useRef(-1);
  const candidate = useRef<{ state: Attn; since: number }>({ state: "Away", since: 0 });

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [state, setState] = useState<Attn>("Away");
  const [confidence, setConfidence] = useState(0);
  const [signals, setSignals] = useState({ present: false, eyesOpen: false, facing: false });

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    lastVideoTime.current = -1;
    setPhase("idle");
  }, []);

  useEffect(() => () => stop(), [stop]);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const lm = landmarkerRef.current;
    if (!video || !lm) return;
    rafRef.current = requestAnimationFrame(loop);
    if (video.currentTime === lastVideoTime.current) return;
    lastVideoTime.current = video.currentTime;

    const res = lm.detectForVideo(video, performance.now());
    const present = res.faceLandmarks.length > 0;

    let eyesOpen = false;
    let facing = false;
    let candidateState: Attn = "Away";
    let conf = 55;

    if (present) {
      const blends = res.faceBlendshapes?.[0]?.categories ?? [];
      const b = (name: string) => blends.find((c) => c.categoryName === name)?.score ?? 0;
      const closed = (b("eyeBlinkLeft") + b("eyeBlinkRight")) / 2;
      eyesOpen = closed < EYES_CLOSED;

      // head yaw from the facial transformation matrix (column-major 4x4)
      const m = res.facialTransformationMatrixes?.[0]?.data;
      let yawDeg = 0;
      if (m) {
        const r02 = m[8];
        const r22 = m[10];
        yawDeg = Math.abs((Math.atan2(r02, r22) * 180) / Math.PI);
      }
      facing = yawDeg < YAW_AWAY_DEG; // looking down at the desk still counts as facing

      if (!eyesOpen) {
        candidateState = "Drowsy";
        conf = 70 + Math.round(Math.min((closed - EYES_CLOSED) * 60, 28));
      } else if (!facing) {
        candidateState = "Drifting";
        conf = 68 + Math.round(Math.min((yawDeg - YAW_AWAY_DEG) * 1.5, 28));
      } else {
        candidateState = "Focused";
        conf = 82 + Math.round(Math.min((YAW_AWAY_DEG - yawDeg) * 0.6, 15));
      }
    }

    // hysteresis — hold a candidate briefly before committing (kills flicker)
    const now = performance.now();
    if (candidateState !== candidate.current.state) {
      candidate.current = { state: candidateState, since: now };
    }
    const committed = now - candidate.current.since >= HYSTERESIS_MS;

    setSignals({ present, eyesOpen, facing });
    setConfidence(Math.max(0, Math.min(99, conf)));
    if (committed) setState(candidateState);
  }, []);

  const start = useCallback(async () => {
    setPhase("loading");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 360 },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
      let lm: FaceLandmarker;
      try {
        lm = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
      } catch {
        lm = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
      }
      landmarkerRef.current = lm;
      setPhase("running");
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const denied = e instanceof DOMException && (e.name === "NotAllowedError" || e.name === "NotFoundError");
      setError(
        denied
          ? "No camera access. That's fine — the point stands: nothing to allow, nothing to upload."
          : "Couldn't start the demo in this browser. The real app runs natively via Tauri."
      );
      setPhase("error");
    }
  }, [loop]);

  const dot = (on: boolean) => (
    <span className="cf-dot" data-on={on ? "1" : "0"} aria-hidden />
  );

  return (
    <div className="cf-demo">
      <div className="cf-head">
        <span>LIVE ATTENTION READ — RUNS IN YOUR BROWSER</span>
        {phase === "running" && <span className="rec">● LOCAL</span>}
      </div>

      <div className="cf-stage" data-phase={phase}>
        <video
          ref={videoRef}
          className="cf-video"
          playsInline
          muted
          data-live={phase === "running" ? "1" : "0"}
        />
        {phase !== "running" && (
          <div className="cf-overlay">
            {phase === "idle" && (
              <>
                <p>See it work on you. Your webcam, read entirely on this page — no video is sent anywhere, exactly how CogniFlow runs.</p>
                <button className="cf-btn" onClick={start}>Start live demo</button>
              </>
            )}
            {phase === "loading" && <p className="cf-load">Loading the model, locally…</p>}
            {phase === "error" && (
              <>
                <p>{error}</p>
                <button className="cf-btn" onClick={start}>Try again</button>
              </>
            )}
          </div>
        )}
      </div>

      {phase === "running" && (
        <>
          <div className="cf-readout">
            <div className="cf-state" data-state={state}>{state}</div>
            <div className="cf-conf"><b>{confidence}%</b><i>confidence</i></div>
          </div>
          <div className="cf-signals">
            <span>{dot(signals.present)} Present</span>
            <span>{dot(signals.eyesOpen)} Eyes open</span>
            <span>{dot(signals.facing)} On the work</span>
          </div>
          <button className="cf-stop" onClick={stop}>Stop &amp; release camera</button>
        </>
      )}
    </div>
  );
}
