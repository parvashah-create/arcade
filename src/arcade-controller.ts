export type ArcadeScreen =
  | { kind: 'library'; selectedGameId: 'invaders' }
  | { kind: 'setup'; gameId: 'invaders' }
  | { kind: 'game'; gameId: 'invaders' };

export type ArcadeAction = 'OPEN_GAME_SETUP' | 'START_GAME' | 'RETURN_TO_LIBRARY' | 'RETURN_TO_SETUP';

export class ArcadeController {
  private screen: ArcadeScreen = { kind: 'library', selectedGameId: 'invaders' };

  public getScreen(): ArcadeScreen {
    return this.screen;
  }

  public dispatch(action: ArcadeAction): ArcadeScreen {
    switch (action) {
      case 'OPEN_GAME_SETUP':
        this.screen = { kind: 'setup', gameId: 'invaders' };
        break;
      case 'START_GAME':
        this.screen = { kind: 'game', gameId: 'invaders' };
        break;
      case 'RETURN_TO_LIBRARY':
        this.screen = { kind: 'library', selectedGameId: 'invaders' };
        break;
      case 'RETURN_TO_SETUP':
        this.screen = { kind: 'setup', gameId: 'invaders' };
        break;
    }

    return this.screen;
  }
}
