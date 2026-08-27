import { describe, expect, it } from 'vitest';
import { SHIELD } from '../../src/games/invaders/constants';
import {
  createShields,
  damageShieldAt,
  destroyAllShields,
  livingShieldCells,
  shieldCellRect,
  updateShields,
} from '../../src/games/invaders/shields';

describe('shields', () => {
  it('creates three cell-grid shields', () => {
    const shields = createShields();

    expect(shields).toHaveLength(3);
    expect(shields[0]?.cells).toHaveLength(SHIELD.rows);
    expect(shields[0]?.cells[0]).toHaveLength(SHIELD.columns);
  });

  it('erodes shield cells from an impact rectangle', () => {
    const shields = createShields();
    const shield = shields[0];
    if (shield === undefined) {
      throw new Error('Expected first shield');
    }
    const cell = shieldCellRect(shield, 2, 2);
    const before = livingShieldCells(shields).length;

    expect(damageShieldAt(shields, cell)).toBe(true);
    expect(livingShieldCells(shields).length).toBeLessThan(before);
  });

  it('moves and reverses shields only when moving mode is enabled', () => {
    const shields = createShields();
    const initialX = shields[0]?.x;

    updateShields(shields, 1, false);
    expect(shields[0]?.x).toBe(initialX);

    updateShields(shields, 1, true);
    expect(shields[0]?.x).not.toBe(initialX);
  });

  it('can remove every shield cell when invaders reach them', () => {
    const shields = createShields();
    destroyAllShields(shields);

    expect(livingShieldCells(shields)).toHaveLength(0);
  });
});
