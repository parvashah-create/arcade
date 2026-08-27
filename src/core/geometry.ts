export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SweepTarget<T> {
  value: T;
  rect: Rect;
}

export function intersects(first: Rect, second: Rect): boolean {
  return (
    first.x < right(second) &&
    right(first) > second.x &&
    first.y < bottom(second) &&
    bottom(first) > second.y
  );
}

export function right(rect: Rect): number {
  return rect.x + rect.width;
}

export function bottom(rect: Rect): number {
  return rect.y + rect.height;
}

export function findVerticalSweepHit<T>(
  projectile: Rect,
  previousY: number,
  nextY: number,
  targets: readonly SweepTarget<T>[],
): T | null {
  if (previousY === nextY) {
    return null;
  }

  const previousRect = { ...projectile, y: previousY };
  const nextRect = { ...projectile, y: nextY };
  let nearest: { distance: number; value: T } | null = null;

  for (const target of targets) {
    if (!horizontalOverlap(projectile, target.rect)) {
      continue;
    }

    const distance = verticalCollisionDistance(previousRect, nextRect, target.rect);
    if (distance === null || (nearest !== null && distance >= nearest.distance)) {
      continue;
    }

    nearest = { distance, value: target.value };
  }

  return nearest?.value ?? null;
}

function horizontalOverlap(first: Rect, second: Rect): boolean {
  return first.x < right(second) && right(first) > second.x;
}

function verticalCollisionDistance(previous: Rect, next: Rect, target: Rect): number | null {
  if (intersects(previous, target)) {
    return 0;
  }

  if (next.y < previous.y) {
    const crossedTargetBottom = next.y < bottom(target) && previous.y >= bottom(target);
    return crossedTargetBottom ? previous.y - bottom(target) : null;
  }

  const crossedTargetTop = bottom(next) > target.y && bottom(previous) <= target.y;
  return crossedTargetTop ? target.y - bottom(previous) : null;
}
