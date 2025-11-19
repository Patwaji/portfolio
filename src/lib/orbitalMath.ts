// Utility functions for orbital math and animations
export function mapCursorToTilt(
  event: MouseEvent,
  element: HTMLElement
): { rx: number; ry: number } {
  const rect = element.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = event.clientX - cx;
  const dy = event.clientY - cy;
  
  // Map cursor position to rotation (max 8 degrees)
  const rx = -dy / (rect.height / 2) * 8;
  const ry = dx / (rect.width / 2) * 8;
  
  return { rx, ry };
}

export function calculateDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function mapProximityToGlow(
  distance: number,
  maxDistance: number = 200
): number {
  // Map distance to glow intensity (0 to 1)
  const normalizedDistance = Math.min(distance / maxDistance, 1);
  return Math.max(0, 1 - normalizedDistance);
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
