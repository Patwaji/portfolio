# Inside a Mind — Suryansh Patwa

Not the résumé portfolio. The other one.

An explorable 3D "mind" built as a personal portfolio: an aurora-colored
particle consciousness at the center, and five glowing nodes orbiting it —
Philosophy, Arsenal, Cogniflow (flagship), The Lab, and Signal. First visit
runs a scroll-driven guided tour (you drive — nothing moves without you, and
you can skip at any time); after that the mind unlocks into free-roam: drag to
orbit, scroll to zoom, click a node to fly in and open its dossier.

## Stack

- **Vite + React 19 + TypeScript**
- **Three.js** — custom GLSL particle shaders (52k particles), synapse pulse
  lines, billboard glows, UnrealBloom postprocessing
- **GSAP** — camera flights, panel choreography, preloader
- **WebAudio** — fully synthesized ambient drone + UI pings (no audio files)

## Run

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # type-check + production build
```

## Anatomy

| Path | What it is |
| --- | --- |
| `src/three/MindScene.ts` | The world: particles, nodes, tour path, orbit, focus camera |
| `src/three/shaders.ts` | All GLSL — the aurora palette lives here |
| `src/lib/data.ts` | **All content.** Copy, node definitions, links |
| `src/lib/audio.ts` | Synthesized ambience + pings |
| `src/App.tsx` | State machine: boot → tour → free-roam → focus |
| `src/components/` | Preloader, HUD, cursor, captions, labels, panels |

## Adding a future node (a game, an experiment)

1. Add an entry to `nodes` in `src/lib/data.ts` — position, accent color, copy.
2. Add its panel content in `src/components/NodePanel.tsx`.

That's it — the tour path, links, labels, hit-testing, and HUD tracker all
derive from the `nodes` array.

## Craft & usability layer

- **Honest preloader** — progress reflects real work: font loading +
  `renderer.compileAsync` shader warm-up. No fake timers.

- **Adaptive quality** — FPS is measured continuously; pixel ratio steps down
  under sustained load and back up when there's headroom.
- **Cross-device parity** — pinch-zoom and gyroscope parallax on touch
  devices; keyboard navigation (arrows/Tab cycle nodes, Enter opens) on
  desktop.
- **Deep links** — every node has a hash URL (`/#cogniflow`); back button
  closes panels; cold-loading a hash boots straight to that node.
- **Kinetic type** — per-character staggered reveals on captions and panel
  headings; the HUD status line scrambles terminal-style on change.
- **Sound choreography** — pentatonic node tones, panel whooshes, a rising
  triad at the genesis moment, chapter ticks during the tour.
- **Whisper mode** — 45s idle and the mind falls asleep (dim, slow); any
  input wakes it with a pulse.
- **Pre-JS shell** — index.html paints a branded frame before the bundle
  arrives; vendor chunks split for long-term caching.

## Interactive layer

- **Neural terminal** — press <code>~</code> (or the `>_ TERMINAL` HUD button).
  `help`, `whoami`, `nodes`, `open <node>`, `tour`, `fingerprint`, `catch`,
  `destabilize`, `gravity`, `excite`, `calm`, `matrix`, `aurora`,
  `sound on|off` — plus a few commands that aren't listed. Commands genuinely
  alter the 3D world.
- **Achievements** — 14 unlockables (one secret), persisted in localStorage,
  toast on unlock, counter in the HUD, full list via `achievements` in the
  terminal. Defined in `src/lib/achievements.ts`.
- **Physics toys** — double-click anywhere in free-roam to send a shockwave
  through the particle field; click empty space to drop a gravity well (up to
  4 at once, each fades over ~9s, real multi-body pull via `uWellPos[4]` in
  the core shader). Nodes get knocked off their anchors and spring back,
  synapses stretching with them.
- **Mind seed** — a deterministic PRNG keyed to the visitor's local calendar
  day (`src/lib/seed.ts`) reshapes the particle field, starting hue, and
  ambient drone detune. Never quite the same mind two days running.
- **Playable nodes** — hovering the five nodes plays a real C-major-pentatonic
  tone per node (`NODE_SCALE` in `src/lib/audio.ts`), so exploring composes.
- **Cognitive Fingerprint** (`fingerprint` in the terminal) — an honestly
  labeled, *real* session readout (dwell time per node, curiosity latency,
  interaction rhythm) — the mouse/scroll analog of what Cogniflow does with a
  camera, not a simulation of Cogniflow itself.
- **Restore the Mind** — clicking DESTABILIZE in The Lab doesn't just kick the
  particles, it launches a real minigame: 12 "lost thought" motes eject from
  the core, you have ~24s to click them all back in. Results screen, best
  score in localStorage, `FULL RESTORATION` achievement for a clean sweep.
- **Catch the Thought** (`catch` in the terminal) — an endless arcade mode.
  Phrases in the site's own voice drift out of the core as DOM labels and
  fade; catch them before they're lost. Three misses ends the round, combo
  scoring, best score persisted.

## Notes

- The guided tour plays once per browser (localStorage `sp-mind-tour-v3`);
  after that you boot straight into free-roam. Use **↻ REPLAY TOUR** in the
  HUD, or clear localStorage, to see it again.
- `prefers-reduced-motion` skips the tour and calms the particle field.
- Sound is off until toggled (SND) — browsers require a gesture anyway.
