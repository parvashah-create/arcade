import { describe, expect, it } from 'vitest';
import { decodeGameNumber } from '../../src/games/invaders/mode';

describe('decodeGameNumber', () => {
  it('decodes every single-player variation from its bit flags', () => {
    for (let gameNumber = 1; gameNumber <= 16; gameNumber += 1) {
      const flags = gameNumber - 1;
      expect(decodeGameNumber(gameNumber)).toEqual({
        gameNumber,
        movingShields: (flags & 1) !== 0,
        zigzagBombs: (flags & 2) !== 0,
        fastBombs: (flags & 4) !== 0,
        invisibleInvaders: (flags & 8) !== 0,
      });
    }
  });

  it('clamps out-of-range selections', () => {
    expect(decodeGameNumber(-10).gameNumber).toBe(1);
    expect(decodeGameNumber(99).gameNumber).toBe(16);
  });
});
