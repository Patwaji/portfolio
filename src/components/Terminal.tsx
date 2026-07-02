import { useEffect, useRef, useState } from "react";
import { nodes } from "../lib/data";
import type { MindNode } from "../lib/data";
import { ach } from "../lib/achievements";

export type TerminalApi = {
  openNode: (id: MindNode["id"]) => string;
  replayTour: () => string;
  destabilize: () => void;
  gravity: () => void;
  excite: () => void;
  calm: () => boolean;
  matrix: () => void;
  aurora: () => void;
  sound: (on: boolean) => void;
  sudoHire: () => void;
  visited: () => Set<string>;
  close: () => void;
};

type Line = { text: string; cls?: "in" | "ok" | "err" | "dim" };

const WELCOME: Line[] = [
  { text: "SP//MIND terminal — direct neural access", cls: "ok" },
  { text: "type 'help' to see what this mind responds to.", cls: "dim" },
];

export function Terminal({ api }: { api: TerminalApi }) {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const print = (out: Line[]) => setLines((l) => [...l, ...out]);

  const run = (raw: string) => {
    const input = raw.trim();
    if (!input) return;
    history.current.unshift(input);
    histIdx.current = -1;
    print([{ text: `sp@mind:~$ ${input}`, cls: "in" }]);

    const [cmd, ...rest] = input.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");

    switch (cmd) {
      case "help":
        print(
          [
            "AVAILABLE COMMANDS",
            "  whoami          who is this mind",
            "  nodes           list nodes + status",
            "  open <node>     fly to a node (open cogniflow)",
            "  tour            replay the guided tour",
            "  achievements    what you've earned",
            "  destabilize     shake the mind",
            "  gravity         pull particles to your cursor (10s)",
            "  excite          overclock the core (6s)",
            "  calm            toggle time dilation",
            "  matrix          you already know",
            "  aurora          reshuffle the palette",
            "  sound on|off    ambient audio",
            "  clear · exit",
          ].map((text) => ({ text, cls: "dim" as const }))
        );
        break;

      case "whoami":
        print([
          { text: "subject: SURYANSH PATWA" },
          { text: "class:   thinker / builder" },
          { text: "stack:   NOT FOUND (by design)", cls: "ok" },
          { text: "status:  sitting with questions" },
        ]);
        break;

      case "nodes": {
        const seen = api.visited();
        print(
          nodes.map((n) => ({
            text: `  ${n.code.padEnd(16, " ")} ${n.title.padEnd(12, " ")} ${
              seen.has(n.id) ? "VISITED" : "UNEXPLORED"
            }`,
            cls: seen.has(n.id) ? ("ok" as const) : ("dim" as const),
          }))
        );
        break;
      }

      case "open": {
        const hit = nodes.find(
          (n) =>
            n.id === arg ||
            n.title.toLowerCase() === arg ||
            String(n.index + 1) === arg
        );
        if (!hit) {
          print([{ text: `no node called "${arg}". try 'nodes'.`, cls: "err" }]);
        } else {
          print([{ text: api.openNode(hit.id), cls: "ok" }]);
        }
        break;
      }

      case "tour":
        print([{ text: api.replayTour(), cls: "ok" }]);
        break;

      case "achievements": {
        const list = ach.list().filter((a) => a.earned || !a.secret);
        print([
          { text: `EARNED ${ach.count}/${ach.total}`, cls: "ok" },
          ...list.map((a) => ({
            text: `  ${a.earned ? "●" : "○"} ${a.title.padEnd(18, " ")} ${a.earned ? a.desc : "———"}`,
            cls: a.earned ? undefined : ("dim" as const),
          })),
        ]);
        break;
      }

      case "destabilize":
        api.destabilize();
        print([{ text: "destabilizing… done. it forgives you.", cls: "ok" }]);
        break;

      case "gravity":
        api.gravity();
        print([
          { text: "gravity inverted. the mind is drawn to you now. (10s)", cls: "ok" },
        ]);
        break;

      case "excite":
        api.excite();
        print([{ text: "core overclocked. thoughts racing. (6s)", cls: "ok" }]);
        break;

      case "calm":
        print([
          {
            text: api.calm()
              ? "time dilated. the mind is dreaming."
              : "time restored. back to full speed.",
            cls: "ok",
          },
        ]);
        break;

      case "matrix":
        api.matrix();
        print([{ text: "wake up, visitor… (12s)", cls: "ok" }]);
        break;

      case "aurora":
        api.aurora();
        print([{ text: "palette reshuffled. same mind, different mood.", cls: "ok" }]);
        break;

      case "sound":
        if (arg !== "on" && arg !== "off") {
          print([{ text: "usage: sound on|off", cls: "err" }]);
        } else {
          api.sound(arg === "on");
          print([{ text: `ambient audio ${arg.toUpperCase()}.`, cls: "ok" }]);
        }
        break;

      case "sudo":
        if (arg === "hire") {
          print([
            { text: "[sudo] password for visitor: ********", cls: "dim" },
            { text: "ACCESS GRANTED. root privileges transferred.", cls: "ok" },
            { text: "initiating recruitment protocol…" },
            { text: "> bring a question worth sitting with.", cls: "ok" },
          ]);
          api.sudoHire();
        } else {
          print([{ text: "visitor is not in the sudoers file. this incident will be reported.", cls: "err" }]);
        }
        break;

      case "coffee":
        print([{ text: "caffeine: DETECTED. productivity +14%. jitter +38%.", cls: "ok" }]);
        break;

      case "hello":
      case "hi":
        print([{ text: "hi. i'm listening." }]);
        break;

      case "42":
        print([{ text: "finally. someone asking the right question.", cls: "ok" }]);
        break;

      case "clear":
        setLines([]);
        break;

      case "exit":
        api.close();
        break;

      default:
        print([
          {
            text: `unknown command: "${cmd}" — the mind doesn't know that word yet. try 'help'.`,
            cls: "err",
          },
        ]);
    }
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="term-head">
        <span>SP//MIND — NEURAL TERMINAL</span>
        <button className="term-close" onClick={api.close}>
          [ ESC ]
        </button>
      </div>
      <div className="term-out" ref={outRef}>
        {lines.map((l, i) => (
          <div key={i} className={`term-line ${l.cls ?? ""}`}>
            {l.text}
          </div>
        ))}
      </div>
      <div className="term-prompt">
        <span>sp@mind:~$</span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              run(value);
              setValue("");
            } else if (e.key === "Escape") {
              api.close();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const h = history.current;
              if (h.length) {
                histIdx.current = Math.min(histIdx.current + 1, h.length - 1);
                setValue(h[histIdx.current]);
              }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (histIdx.current > 0) {
                histIdx.current -= 1;
                setValue(history.current[histIdx.current]);
              } else {
                histIdx.current = -1;
                setValue("");
              }
            }
            e.stopPropagation();
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
