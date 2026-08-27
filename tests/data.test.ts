import { describe, expect, it } from 'vitest';
import { DEFAULT_ARCADE_DATA, parseArcadeData } from '../src/data';

describe('parseArcadeData', () => {
  it.each([null, [], 'arcade', { version: 2 }])('repairs invalid root value %#', (value) => {
    expect(parseArcadeData(value)).toEqual(DEFAULT_ARCADE_DATA);
  });

  it('keeps valid persisted data', () => {
    expect(
      parseArcadeData({
        version: 1,
        muted: true,
        highScores: { invaders: 4210 },
        invaders: { gameNumber: 13, difficulty: 'A' },
      }),
    ).toEqual({
      version: 1,
      muted: true,
      highScores: { invaders: 4210 },
      invaders: { gameNumber: 13, difficulty: 'A' },
    });
  });

  it('clamps and repairs individual invalid values', () => {
    expect(
      parseArcadeData({
        muted: 'yes',
        highScores: { invaders: -1 },
        invaders: { gameNumber: 99, difficulty: 'C' },
      }),
    ).toEqual({
      ...DEFAULT_ARCADE_DATA,
      invaders: { gameNumber: 16, difficulty: 'B' },
    });

    expect(parseArcadeData({ invaders: { gameNumber: -8 } }).invaders.gameNumber).toBe(1);
    expect(parseArcadeData({ highScores: { invaders: Number.NaN } }).highScores.invaders).toBe(0);
    expect(parseArcadeData({ highScores: { invaders: Number.POSITIVE_INFINITY } }).highScores.invaders).toBe(0);
  });
});
