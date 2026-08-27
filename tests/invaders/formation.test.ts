import { describe, expect, it } from 'vitest';
import { FORMATION, PLAYFIELD, formationMoveInterval } from '../../src/games/invaders/constants';
import {
  advanceFormation,
  bottommostLivingInvaderInColumn,
  createFormation,
  destroyInvader,
  invaderPoints,
  livingBounds,
  livingCount,
} from '../../src/games/invaders/formation';

describe('formation', () => {
  it('creates thirty-six living invaders', () => {
    expect(livingCount(createFormation(FORMATION.firstWaveY))).toBe(36);
  });

  it('moves horizontally when there is room', () => {
    const formation = createFormation(FORMATION.firstWaveY);
    const result = advanceFormation(formation, formationMoveInterval(36));

    expect(result).toEqual({ moved: true, descended: false });
    expect(formation.x).toBe(FORMATION.startX + FORMATION.horizontalStep);
  });

  it('reverses and descends at a boundary', () => {
    const formation = createFormation(FORMATION.firstWaveY);
    formation.x = PLAYFIELD.right - FORMATION.columns * FORMATION.columnSpacing + FORMATION.columnSpacing;
    const beforeY = formation.y;

    const result = advanceFormation(formation, formationMoveInterval(36));

    expect(result).toEqual({ moved: true, descended: true });
    expect(formation.direction).toBe(-1);
    expect(formation.y).toBe(beforeY + FORMATION.descentStep);
  });

  it('uses living invaders to determine the outer edge', () => {
    const formation = createFormation(FORMATION.firstWaveY);
    for (let row = 0; row < FORMATION.rows; row += 1) {
      destroyInvader(formation, row * FORMATION.columns + 5);
    }
    const bounds = livingBounds(formation);

    expect(bounds.width).toBe(FORMATION.columnSpacing * 4 + FORMATION.invaderWidth);
  });

  it('selects the bottommost living invader in a column', () => {
    const formation = createFormation(FORMATION.firstWaveY);
    destroyInvader(formation, 5 * FORMATION.columns + 2);

    expect(bottommostLivingInvaderInColumn(formation, 2)).toBe(4 * FORMATION.columns + 2);
  });

  it('speeds up monotonically as invaders are removed', () => {
    expect(formationMoveInterval(1)).toBeLessThan(formationMoveInterval(18));
    expect(formationMoveInterval(18)).toBeLessThan(formationMoveInterval(36));
  });

  it('uses the documented row score values', () => {
    expect(Array.from({ length: 6 }, (_, row) => invaderPoints(row * FORMATION.columns))).toEqual([
      30,
      25,
      20,
      15,
      10,
      5,
    ]);
  });
});
