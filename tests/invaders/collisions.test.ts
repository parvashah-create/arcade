import { describe, expect, it } from 'vitest';
import { findProjectileCollision } from '../../src/games/invaders/collisions';

describe('findProjectileCollision', () => {
  it('returns the first vertical target crossed by a projectile', () => {
    const collision = findProjectileCollision(
      { x: 10, y: 20, width: 1, height: 3 },
      20,
      4,
      [
        { value: 'shield', rect: { x: 10, y: 13, width: 2, height: 2 } },
        { value: 'invader', rect: { x: 10, y: 7, width: 8, height: 6 } },
      ],
    );

    expect(collision?.target).toBe('shield');
  });
});
