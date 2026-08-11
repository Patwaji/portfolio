import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import {
  nodes,
  philosophy,
  arsenal,
  cogniflow,
  lab,
  signal,
  blog,
  colophon,
} from "../lib/data";
import type { MindNode } from "../lib/data";
import { mindAudio } from "../lib/audio";
import { Chars } from "./Chars";

export function NodePanel({
  nodeId,
  onCloseStart,
  onClosed,
  onDestabilize,
}: {
  nodeId: MindNode["id"];
  onCloseStart: () => void;
  onClosed: () => void;
  onDestabilize: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const node = nodes.find((n) => n.id === nodeId)!;
  const mobile = window.innerWidth < 760;

  useLayoutEffect(() => {
    const panel = panelRef.current!;
    const items = panel.querySelectorAll("[data-anim]");
    mindAudio.whoosh(true);
    gsap.fromTo(
      panel,
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
    onCloseStart();
    mindAudio.whoosh(false);
    gsap.to(scrimRef.current, { opacity: 0, duration: 0.5 });
    gsap.to(panelRef.current, {
      ...(mobile ? { yPercent: 100 } : { xPercent: 100 }),
      duration: 0.65,
      ease: "power3.in",
      onComplete: onClosed,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // terminal gets first claim on Escape
      if (e.key === "Escape" && !document.body.classList.contains("terminal-open"))
        close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="panel-scrim" ref={scrimRef} onClick={close} />
      <div
        className="panel"
        ref={panelRef}
        style={{ "--panel-accent": node.accent } as CSSProperties}
      >
        <button className="panel-close" onClick={close}>
          [ CLOSE × ]
        </button>
        <div className="p-code" data-anim>
          {node.code}
        </div>
        <PanelBody nodeId={nodeId} onDestabilize={onDestabilize} />
      </div>
    </>
  );
}

function PanelBody({
  nodeId,
  onDestabilize,
}: {
  nodeId: MindNode["id"];
  onDestabilize: () => void;
}) {
  switch (nodeId) {
    case "philosophy":
      return (
        <>
          <h2 data-anim className="kinetic-run"><Chars text={philosophy.heading} /></h2>
          <div className="p-section" data-anim>
            THE METHOD
          </div>
          <p className="p-body" data-anim>
            {philosophy.body}
          </p>
          <blockquote className="p-quote aurora-text" data-anim>
            {philosophy.pullQuote}
          </blockquote>
          <div className="p-section" data-anim>
            {philosophy.originHeading}
          </div>
          {philosophy.originParagraphs.map((p, i) => (
            <p className="p-body" data-anim key={i}>
              {p}
            </p>
          ))}
          <blockquote className="p-quote aurora-text" data-anim>
            {philosophy.originQuote}
          </blockquote>
        </>
      );

    case "arsenal":
      return (
        <>
          <h2 data-anim className="kinetic-run"><Chars text={arsenal.heading} /></h2>
          <p className="p-body" data-anim>
            {arsenal.sub}
          </p>
          {arsenal.rows.map((row) => (
            <div className="skill-row" key={row.label} data-anim>
              <div className="p-section">{row.label}</div>
              <div className="chips">
                {row.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </>
      );

    case "cogniflow":
      return (
        <>
          <div className="p-status" data-anim>
            {cogniflow.status}
          </div>
          <h2 data-anim className="kinetic-run"><Chars text="Cogniflow" /></h2>
          <p className="p-oneliner" data-anim>
            {cogniflow.oneLiner}
          </p>
          <div data-anim>
            <CogniflowInstrument />
          </div>
          <div className="p-section" data-anim>
            ABSTRACT
          </div>
          <p className="p-body" data-anim>
            {cogniflow.abstract}
          </p>
          <div className="p-section" data-anim>
            WHAT IT READS
          </div>
          <ul className="p-list" data-anim>
            {cogniflow.method.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="p-section" data-anim>
            DELIBERATELY WON'T DO
          </div>
          <ul className="p-list" data-anim>
            {cogniflow.wontDo.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <div className="p-section" data-anim>
            THE PAPER
          </div>
          <p className="p-body" data-anim>
            {cogniflow.paper}
          </p>
          <p className="p-body" data-anim style={{ marginTop: 22 }}>
            {cogniflow.closingLine}
          </p>
          <div className="signal-links" data-anim style={{ marginTop: 18 }}>
            {cogniflow.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
          <div className="chips" data-anim>
            {cogniflow.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </>
      );

    case "lab":
      return (
        <>
          <h2 data-anim className="kinetic-run"><Chars text={lab.heading} /></h2>
          <p className="p-body" data-anim>
            {lab.body}
          </p>
          <div className="p-section" data-anim>
            INCOMING
          </div>
          <p className="p-body" data-anim>
            {lab.teaser}
          </p>
          <div data-anim>
            <button className="destabilize" onClick={onDestabilize}>
              {lab.buttonLabel}
            </button>
            <div className="destabilize-hint">{lab.buttonHint}</div>
          </div>
        </>
      );

    case "signal":
      return (
        <>
          <h2 data-anim className="kinetic-run"><Chars text={signal.heading} /></h2>
          <p className="p-body" data-anim>
            {signal.sub}
          </p>
          <a className="signal-email aurora-text" href={`mailto:${signal.email}`} data-anim>
            {signal.email}
          </a>
          <div className="signal-links" data-anim>
            {signal.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
          <div className="colophon" data-anim>
            {colophon.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </>
      );

    case "blog":
      return (
        <>
          <h2 data-anim className="kinetic-run"><Chars text={blog.heading} /></h2>
          <p className="p-body" data-anim>
            {blog.sub}
          </p>
          <div className="p-section" data-anim>
            LATEST
          </div>
          <div className="blog-list" data-anim>
            {blog.posts.map((post) => (
              <a
                key={post.href}
                className="blog-post"
                href={post.href}
                target="_blank"
                rel="noreferrer"
              >
                {post.title}
              </a>
            ))}
          </div>
          <a
            className="signal-email aurora-text"
            href={blog.href}
            target="_blank"
            rel="noreferrer"
            data-anim
          >
            {blog.cta}
          </a>
        </>
      );
  }
}

/** Fake-live telemetry: a drawing waveform + drifting readouts. */
const ATTENTION_STATES = ["Focused", "Focused", "Drifting", "Drowsy", "Away"] as const;

function CogniflowInstrument() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readouts, setReadouts] = useState({ state: "Focused", confidence: 88, onTask: 91 });

  useEffect(() => {
    const id = setInterval(() => {
      const state = ATTENTION_STATES[Math.floor(Math.random() * ATTENTION_STATES.length)];
      const focused = state === "Focused";
      setReadouts({
        state,
        confidence: (focused ? 82 : 64) + Math.round(Math.random() * 12),
        onTask: (focused ? 84 : 40) + Math.round(Math.random() * 12),
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const t = now / 1000;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(233,236,255,0.08)";
      ctx.lineWidth = 1;
      for (let gy = 1; gy < 4; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, (h / 4) * gy);
        ctx.lineTo(w, (h / 4) * gy);
        ctx.stroke();
      }

      ctx.strokeStyle = "#ff5fd2";
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const u = x / w;
        const y =
          h / 2 +
          Math.sin(t * 1.6 + u * 9) * h * 0.2 +
          Math.sin(t * 3.7 + u * 23) * h * 0.09 +
          Math.sin(t * 9.1 + u * 51) * h * 0.03;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="instrument">
      <div className="inst-head">
        <span>ATTENTION STATE — ILLUSTRATIVE</span>
        <span className="rec">DEMO</span>
      </div>
      <canvas ref={canvasRef} />
      <div className="readouts">
        <div className="r">
          <b>{readouts.state}</b>
          <i>Current state</i>
        </div>
        <div className="r">
          <b>{readouts.confidence}%</b>
          <i>Confidence</i>
        </div>
        <div className="r">
          <b>{readouts.onTask}%</b>
          <i>On task</i>
        </div>
      </div>
    </div>
  );
}
