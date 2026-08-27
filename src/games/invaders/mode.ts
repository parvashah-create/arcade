import type { InvadersMode } from './types';

export function clampGameNumber(value: number): number {
  return Math.max(1, Math.min(16, Math.floor(value)));
}

export function decodeGameNumber(gameNumber: number): InvadersMode {
  const normalized = clampGameNumber(gameNumber);
  const flags = normalized - 1;

  return {
    gameNumber: normalized,
    movingShields: (flags & 1) !== 0,
    zigzagBombs: (flags & 2) !== 0,
    fastBombs: (flags & 4) !== 0,
    invisibleInvaders: (flags & 8) !== 0,
  };
}
