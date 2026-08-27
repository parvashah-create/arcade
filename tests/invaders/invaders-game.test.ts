import { describe, expect, it } from 'vitest';
import { EMPTY_INPUT } from '../../src/core/game';
import { SeededRandom } from '../../src/core/random';
import { FORMATION, PLAYER } from '../../src/games/invaders/constants';
import { InvadersGame } from '../../src/games/invaders/invaders-game';

const STEP = 1 / 60;

function createGame(difficulty: 'A' | 'B' = 'B', gameNumber = 1): InvadersGame {
  return new InvadersGame({
    config: { difficulty, gameNumber },
    random: new SeededRandom(1234),
  });
}

function advance(game: InvadersGame, frames: number): void {
  for (let frame = 0; frame < frames; frame += 1) {
    game.update(STEP, EMPTY_INPUT);
  }
}

describe('InvadersGame', () => {
  it('starts with the documented default state', () => {
    const snapshot = createGame().getSnapshot();

    expect(snapshot.phase).toBe('ready');
    expect(snapshot.formation.alive.filter(Boolean)).toHaveLength(36);
    expect(snapshot.lives).toBe(PLAYER.lives);
    expect(snapshot.score).toBe(0);
    expect(snapshot.wave).toBe(1);
  });

  it('uses a cannon exactly twice as wide in difficulty A', () => {
    expect(createGame('A').getSnapshot().player.width).toBe(
      createGame('B').getSnapshot().player.width * 2,
    );
  });

  it('clamps player movement to the playfield', () => {
    const game = createGame();
    game.update(STEP, { ...EMPTY_INPUT, rightHeld: true });
    advance(game, 600);

    const snapshot = game.getSnapshot();
    expect(snapshot.player.x + snapshot.player.width).toBeLessThanOrEqual(152);
  });

  it('allows only one player projectile until it resolves', () => {
    const game = createGame();
    game.update(STEP, { ...EMPTY_INPUT, firePressed: true });
    const firstProjectile = game.getSnapshot().playerProjectile;

    const secondEvents = game.update(STEP, { ...EMPTY_INPUT, firePressed: true });
    const secondProjectile = game.getSnapshot().playerProjectile;
    expect(secondEvents).not.toContainEqual({ type: 'SHOT_FIRED' });
    expect(secondProjectile?.x).toBe(firstProjectile?.x);
    expect(secondProjectile?.y).toBeLessThan(firstProjectile?.y ?? Number.POSITIVE_INFINITY);

    advance(game, 120);
    expect(game.getSnapshot().playerProjectile).toBeNull();
  });

  it('awards the bottom-row score when a clear shot hits an invader', () => {
    const game = createGame();
    for (let frame = 0; frame < 20; frame += 1) {
      game.update(STEP, { ...EMPTY_INPUT, leftHeld: true });
    }

    game.update(STEP, { ...EMPTY_INPUT, firePressed: true });
    advance(game, 65);

    const snapshot = game.getSnapshot();
    expect(snapshot.score).toBe(5);
    expect(snapshot.formation.alive.filter(Boolean)).toHaveLength(35);
  });

  it('hides invaders during active invisible-mode play', () => {
    const game = createGame('B', 9);
    expect(game.getSnapshot().invadersVisible).toBe(true);

    game.update(STEP, { ...EMPTY_INPUT, leftHeld: true });
    expect(game.getSnapshot().invadersVisible).toBe(false);
  });

  it('keeps formation constants aligned with the documented 6 by 6 grid', () => {
    expect(FORMATION.rows * FORMATION.columns).toBe(36);
  });
});
