import { ItemView, type WorkspaceLeaf } from 'obsidian';
import { ArcadeController } from './arcade-controller';
import type { ArcadeDataV1, InvadersDifficulty } from './data';
import { GameHost } from './core/game-host';
import { InvadersGame } from './games/invaders/invaders-game';
import { InvadersRenderer } from './games/invaders/invaders-renderer';
import type { InvadersSnapshot } from './games/invaders/types';
import { restoreArcadeFocus } from './ui/focus';
import { renderGameScreen, type GameScreen } from './ui/game-screen';
import { renderLibraryScreen, type ArcadeLibraryGame } from './ui/library-screen';
import { renderSetupScreen, type SetupFocus } from './ui/setup-screen';

export const ARCADE_VIEW_TYPE = 'arcade-view';

const ARCADE_GAMES: readonly ArcadeLibraryGame[] = [
  { id: 'invaders', number: '01', title: 'INVADERS' },
];

export interface ArcadePluginApi {
  getArcadeData(): ArcadeDataV1;
  updateArcadeData(update: (data: ArcadeDataV1) => ArcadeDataV1): Promise<void>;
}

export class ArcadeView extends ItemView {
  public navigation = false;
  private readonly plugin: ArcadePluginApi;
  private readonly controller = new ArcadeController();
  private gameHost: GameHost<InvadersSnapshot> | null = null;
  private gameScreen: GameScreen | null = null;
  private active = true;
  private setupFocus: SetupFocus = 'game';

  public constructor(leaf: WorkspaceLeaf, plugin: ArcadePluginApi) {
    super(leaf);
    this.plugin = plugin;
  }

  public getViewType(): string {
    return ARCADE_VIEW_TYPE;
  }

  public getDisplayText(): string {
    return 'Arcade';
  }

  public getIcon(): string {
    return 'gamepad-2';
  }

  public async onOpen(): Promise<void> {
    this.containerEl.addClass('arcade-view');
    this.renderCurrentScreen();
  }

  public async onClose(): Promise<void> {
    this.disposeGameHost();
    this.contentEl.replaceChildren();
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.gameHost?.setActive(active);
    if (active) {
      restoreArcadeFocus(this.contentEl, this.gameScreen?.canvas);
    }
  }

  private renderCurrentScreen(): void {
    const screen = this.controller.getScreen();
    switch (screen.kind) {
      case 'library':
        this.renderLibrary();
        return;
      case 'setup':
        this.renderSetup();
        return;
      case 'game':
        this.renderGame();
    }
  }

  private renderLibrary(): void {
    this.disposeGameHost();
    renderLibraryScreen(this.contentEl, {
      games: ARCADE_GAMES,
      selectedGameId: 'invaders',
      onPlay: (gameId) => {
        if (gameId !== 'invaders') {
          return;
        }
        this.setupFocus = 'game';
        this.controller.dispatch('OPEN_GAME_SETUP');
        this.renderCurrentScreen();
      },
    });
  }

  private renderSetup(): void {
    this.disposeGameHost();
    const data = this.plugin.getArcadeData();
    renderSetupScreen(this.contentEl, {
      gameNumber: data.invaders.gameNumber,
      difficulty: data.invaders.difficulty,
      initialFocus: this.setupFocus,
      onFocusChange: (focus) => {
        this.setupFocus = focus;
      },
      onPreviousGame: () => this.changeGameNumber(-1),
      onNextGame: () => this.changeGameNumber(1),
      onToggleDifficulty: () => this.toggleDifficulty(),
      onPlay: () => {
        this.controller.dispatch('START_GAME');
        this.renderCurrentScreen();
      },
      onBack: () => {
        this.controller.dispatch('RETURN_TO_LIBRARY');
        this.renderCurrentScreen();
      },
    });
  }

  private renderGame(): void {
    this.disposeGameHost();
    const data = this.plugin.getArcadeData();
    const gameScreen = renderGameScreen(
      this.contentEl,
      {
        onResume: () => this.gameHost?.setUserPaused(false),
        onRestart: () => this.renderGame(),
        onSetup: () => this.returnToSetup(),
        onLibrary: () => this.returnToLibrary(),
        onMuteToggle: () => this.gameHost?.toggleMuted(),
      },
      data.muted,
    );
    this.gameScreen = gameScreen;

    const host = new GameHost<InvadersSnapshot>({
      canvas: gameScreen.canvas,
      paletteElement: this.containerEl,
      game: new InvadersGame({
        config: {
          gameNumber: data.invaders.gameNumber,
          difficulty: data.invaders.difficulty,
        },
      }),
      renderer: new InvadersRenderer(),
      muted: data.muted,
      onMutedChange: (muted) => {
        gameScreen.setMuted(muted);
        void this.plugin.updateArcadeData((current) => ({ ...current, muted }));
      },
      onSnapshot: (snapshot) => gameScreen.update(snapshot),
      onPauseChange: (paused) => gameScreen.setPaused(paused),
      onGameOver: (snapshot) => {
        gameScreen.showGameOver();
        if (snapshot.score > this.plugin.getArcadeData().highScores.invaders) {
          void this.plugin.updateArcadeData((current) => ({
            ...current,
            highScores: { ...current.highScores, invaders: snapshot.score },
          }));
        }
      },
    });
    this.gameHost = host;
    this.addChild(host);
    host.setActive(this.active);
  }

  private changeGameNumber(delta: number): void {
    const current = this.plugin.getArcadeData();
    const gameNumber = ((current.invaders.gameNumber - 1 + delta + 16) % 16) + 1;
    void this.plugin.updateArcadeData((data) => ({
      ...data,
      invaders: { ...data.invaders, gameNumber },
    }));
    this.renderSetup();
  }

  private toggleDifficulty(): void {
    const difficulty: InvadersDifficulty = this.plugin.getArcadeData().invaders.difficulty === 'A' ? 'B' : 'A';
    void this.plugin.updateArcadeData((data) => ({
      ...data,
      invaders: { ...data.invaders, difficulty },
    }));
    this.renderSetup();
  }

  private returnToSetup(): void {
    this.setupFocus = 'play';
    this.controller.dispatch('RETURN_TO_SETUP');
    this.renderCurrentScreen();
  }

  private returnToLibrary(): void {
    this.controller.dispatch('RETURN_TO_LIBRARY');
    this.renderCurrentScreen();
  }

  private disposeGameHost(): void {
    if (this.gameHost !== null) {
      this.removeChild(this.gameHost);
      this.gameHost = null;
    }
    this.gameScreen = null;
  }
}
