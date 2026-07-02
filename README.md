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

## Interactive layer

- **Neural terminal** — press <code>~</code> (or the `>_ TERMINAL` HUD button).
  `help`, `whoami`, `nodes`, `open <node>`, `tour`, `destabilize`, `gravity`,
  `excite`, `calm`, `matrix`, `aurora`, `sound on|off` — plus a few commands
  that aren't listed. Commands genuinely alter the 3D world.
- **Achievements** — 11 unlockables (one secret), persisted in localStorage,
  toast on unlock, counter in the HUD, full list via `achievements` in the
  terminal. Defined in `src/lib/achievements.ts`.
- **Physics toys** — double-click anywhere in free-roam to send a shockwave
  through the particle field; nodes get knocked off their anchors and spring
  back, synapses stretching with them. The Lab's DESTABILIZE button and the
  terminal's `gravity` well stack on top.

## Notes

- The guided tour plays once per browser (localStorage `sp-mind-tour-v3`);
  after that you boot straight into free-roam. Use **↻ REPLAY TOUR** in the
  HUD, or clear localStorage, to see it again.
- `prefers-reduced-motion` skips the tour and calms the particle field.
- Sound is off until toggled (SND) — browsers require a gesture anyway.
