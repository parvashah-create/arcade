import { describe, expect, it } from 'vitest';
import { formatScore, getPlayerTurretLayers } from '../../src/games/invaders/invaders-renderer';

describe('formatScore', () => {
  it('formats the Atari-style four-digit score display', () => {
    expect(formatScore(0)).toBe('0000');
    expect(formatScore(25)).toBe('0025');
    expect(formatScore(9_999)).toBe('9999');
    expect(formatScore(10_000)).toBe('9999');
  });
});

describe('getPlayerTurretLayers', () => {
  it.each([8, 16])('centers every cannon layer within a %d-pixel base', (playerWidth) => {
    for (const layer of getPlayerTurretLayers(playerWidth)) {
      expect(layer.offset * 2 + layer.width).toBe(playerWidth);
    }
  });
});
