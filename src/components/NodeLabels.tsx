import type { CSSProperties } from "react";
import { nodes } from "../lib/data";
import type { MindNode } from "../lib/data";
import type { MindScene } from "../three/MindScene";

/**
 * DOM labels floating above each node in the 3D world. The scene projects
 * their positions into screen space every frame via registerLabel().
 */
export function NodeLabels({
  scene,
  onHover,
  onClick,
}: {
  scene: MindScene;
  onHover: (id: MindNode["id"] | null) => void;
  onClick: (id: MindNode["id"]) => void;
}) {
  return (
    <>
      {nodes.map((n) => (
        <div
          key={n.id}
          className="node-label"
          style={{ "--node-accent": n.accent } as CSSProperties}
          ref={(el) => scene.registerLabel(n.id, el)}
          onPointerEnter={() => {
            scene.setExternalHover(n.id);
            onHover(n.id);
          }}
          onPointerLeave={() => {
            scene.setExternalHover(null);
            onHover(null);
          }}
          onClick={() => onClick(n.id)}
        >
          <div className="inner">
            <span className="code">{n.code}</span>
            <span className="title">{n.title}</span>
          </div>
        </div>
      ))}
    </>
  );
}
