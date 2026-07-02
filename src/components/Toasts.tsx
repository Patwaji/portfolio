import type { Achievement } from "../lib/achievements";

export function Toasts({ items }: { items: Achievement[] }) {
  return (
    <div className="toasts">
      {items.map((a) => (
        <div className="toast" key={a.id}>
          <div className="t-kicker">ACHIEVEMENT UNLOCKED</div>
          <div className="t-title">{a.title}</div>
          <div className="t-desc">{a.desc}</div>
        </div>
      ))}
    </div>
  );
}
