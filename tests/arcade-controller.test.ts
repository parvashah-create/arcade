import { describe, expect, it } from 'vitest';
import { ArcadeController } from '../src/arcade-controller';

describe('ArcadeController', () => {
  it('moves through the library, setup, and game states', () => {
    const controller = new ArcadeController();
    expect(controller.getScreen()).toEqual({ kind: 'library', selectedGameId: 'invaders' });

    expect(controller.dispatch('OPEN_GAME_SETUP')).toEqual({ kind: 'setup', gameId: 'invaders' });
    expect(controller.dispatch('START_GAME')).toEqual({ kind: 'game', gameId: 'invaders' });
    expect(controller.dispatch('RETURN_TO_SETUP')).toEqual({ kind: 'setup', gameId: 'invaders' });
    expect(controller.dispatch('RETURN_TO_LIBRARY')).toEqual({ kind: 'library', selectedGameId: 'invaders' });
  });
});
