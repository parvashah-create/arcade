import { describe, expect, it } from 'vitest';
import { findVerticalSweepHit, intersects } from '../../src/core/geometry';

describe('geometry', () => {
  it('treats touching rectangle edges as non-overlapping', () => {
    expect(
      intersects({ x: 0, y: 0, width: 4, height: 4 }, { x: 4, y: 0, width: 2, height: 2 }),
    ).toBe(false);
  });

  it('detects a one-pixel rectangle overlap', () => {
    expect(
      intersects({ x: 0, y: 0, width: 4, height: 4 }, { x: 3, y: 3, width: 2, height: 2 }),
    ).toBe(true);
  });

  it('finds the nearest target crossed by a fast upward projectile', () => {
    const hit = findVerticalSweepHit(
      { x: 5, y: 20, width: 1, height: 3 },
      20,
      2,
      [
        { value: 'far', rect: { x: 5, y: 3, width: 2, height: 2 } },
        { value: 'near', rect: { x: 5, y: 12, width: 2, height: 2 } },
      ],
    );

    expect(hit).toBe('near');
  });
});
