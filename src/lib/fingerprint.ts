import { nodes } from "./data";
import type { MindNode } from "./data";

/**
 * Real session telemetry — dwell time, curiosity latency, interaction
 * rhythm. No camera, no simulation: this is the honest, mouse/scroll-only
 * analog of what Cogniflow does with vision, turned on the visitor.
 */
class SessionTracker {
  private startedAt = 0;
  private dwell: Record<string, number> = {};
  private nodeEnteredAt: number | null = null;
  private currentNode: MindNode["id"] | null = null;
  private firstFocusAt: number | null = null;
  private interactions = 0;
  private chaos = 0; // shockwaves + wells + destabilizes

  start() {
    this.startedAt = performance.now();
  }

  enterNode(id: MindNode["id"]) {
    this.flush();
    this.currentNode = id;
    this.nodeEnteredAt = performance.now();
    if (this.firstFocusAt === null) this.firstFocusAt = performance.now();
  }

  exitNode() {
    this.flush();
    this.currentNode = null;
    this.nodeEnteredAt = null;
  }

  private flush() {
    if (this.currentNode && this.nodeEnteredAt !== null) {
      const delta = performance.now() - this.nodeEnteredAt;
      this.dwell[this.currentNode] = (this.dwell[this.currentNode] ?? 0) + delta;
    }
  }

  interact() {
    this.interactions++;
  }

  chaosEvent() {
    this.chaos++;
    this.interact();
  }

  summary() {
    this.flush();
    if (this.currentNode && this.nodeEnteredAt !== null) {
      // re-arm so a still-open node keeps counting after summary() is read
      this.nodeEnteredAt = performance.now();
    }
    const sessionMs = this.startedAt ? performance.now() - this.startedAt : 0;
    const entries = Object.entries(this.dwell) as [MindNode["id"], number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const topNode = top ? nodes.find((n) => n.id === top[0]) ?? null : null;
    const latencyMs = this.firstFocusAt ? this.firstFocusAt - this.startedAt : null;

    return {
      sessionMs,
      topNode,
      topNodeMs: top?.[1] ?? 0,
      dwell: this.dwell,
      interactions: this.interactions,
      chaos: this.chaos,
      latencyMs,
      nodesVisited: entries.length,
    };
  }
}

export const tracker = new SessionTracker();
export type SessionSummary = ReturnType<SessionTracker["summary"]>;
