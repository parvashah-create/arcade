import type { Rect, SweepTarget } from '../../core/geometry';
import { findVerticalSweepHit } from '../../core/geometry';

export interface ProjectileCollision<T> {
  target: T;
  previousY: number;
  nextY: number;
}

export function findProjectileCollision<T>(
  projectile: Rect,
  previousY: number,
  nextY: number,
  targets: readonly SweepTarget<T>[],
): ProjectileCollision<T> | null {
  const target = findVerticalSweepHit(projectile, previousY, nextY, targets);
  return target === null ? null : { target, previousY, nextY };
}
