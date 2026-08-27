import { Component } from 'obsidian';
import { AudioEngine } from './audio-engine';
import type { ArcadeGame, GameEvent } from './game';
import { browserScheduler, GameLoop } from './game-loop';
import { InputManager } from './input-manager';
import { readPalette } from './palette';

export type PauseReason = 'user' | 'hidden-view' | 'window-blur' | 'focus-loss';

type WindowWithResizeObserver = Window & { readonly ResizeObserver: typeof ResizeObserver };

export interface CanvasRenderer<TSnapshot> {
  render(context: CanvasRenderingContext2D, snapshot: Readonly<TSnapshot>, palette: ReturnType<typeof readPalette>): void;
}

export interface GameHostOptions<TSnapshot> {
  canvas: HTMLCanvasElement;
  paletteElement: HTMLElement;
  game: ArcadeGame<TSnapshot>;
  renderer: CanvasRenderer<TSnapshot>;
  muted: boolean;
  onMutedChange(muted: boolean): void;
  onSnapshot(snapshot: Readonly<TSnapshot>): void;
  onPauseChange(paused: boolean, focusMenu: boolean): void;
  onGameOver(snapshot: Readonly<TSnapshot>): void;
}

export class GameHost<TSnapshot> extends Component {
  private readonly options: GameHostOptions<TSnapshot>;
  private readonly pauseReasons = new Set<PauseReason>();
  private readonly audio: AudioEngine;
  private readonly context: CanvasRenderingContext2D;
  private input: InputManager | null = null;
  private loop: GameLoop | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private active = true;
  private ended = false;

  public constructor(options: GameHostOptions<TSnapshot>) {
    super();
    this.options = options;
    this.audio = new AudioEngine(options.muted);
    const context = options.canvas.getContext('2d');
    if (context === null) {
      throw new Error('Arcade requires a Canvas 2D context.');
    }
    this.context = context;
  }

  public onload(): void {
    const ownerWindow = this.options.canvas.win as WindowWithResizeObserver;
    const interactionRoot = this.options.canvas.closest<HTMLElement>('.arcade-game-screen') ?? this.options.canvas;
    this.options.canvas.width = 160;
    this.options.canvas.height = 192;
    this.context.imageSmoothingEnabled = false;
    this.input = new InputManager(this.options.canvas, {
      onPauseToggle: () => this.toggleUserPause(),
      onMenuToggle: () => this.toggleUserPause(),
      onUserGesture: () => this.audio.resumeFromUserGesture(),
    });
    this.addChild(this.input);
    this.input.setEnabled(this.active);

    this.loop = new GameLoop({
      update: (stepSeconds) => this.update(stepSeconds),
      render: () => this.render(),
    }, browserScheduler(ownerWindow));
    this.resizeObserver = new ownerWindow.ResizeObserver(() => this.render());
    this.resizeObserver.observe(this.options.canvas);
    this.register(() => this.resizeObserver?.disconnect());
    this.registerDomEvent(ownerWindow, 'blur', () => this.setPauseReason('window-blur', true));
    this.registerDomEvent(ownerWindow, 'focus', () => {
      if (this.active) {
        this.setPauseReason('window-blur', false);
      }
    });
    this.registerDomEvent(interactionRoot, 'focusin', () => {
      if (this.active) {
        this.setPauseReason('focus-loss', false);
      }
    });
    this.registerDomEvent(interactionRoot, 'focusout', (event) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget === null || !('nodeType' in nextTarget) || !interactionRoot.contains(nextTarget as Node)) {
        this.setPauseReason('focus-loss', true);
      }
    });

    this.options.game.start();
    this.render();
    this.syncLoop();
  }

  public onunload(): void {
    this.loop?.stop();
    this.loop = null;
    this.input?.setEnabled(false);
    this.input = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.audio.dispose();
    this.options.game.stop();
  }

  public setActive(active: boolean): void {
    this.active = active;
    this.setPauseReason('hidden-view', !active);
    this.input?.setEnabled(active);
  }

  public setMuted(muted: boolean): void {
    this.audio.setMuted(muted);
    this.options.onMutedChange(muted);
  }

  public toggleMuted(): void {
    const muted = !this.isMuted();
    this.setMuted(muted);
    if (!muted) {
      this.audio.resumeFromUserGesture();
    }
  }

  public setUserPaused(paused: boolean): void {
    if (this.ended) {
      return;
    }

    this.setPauseReason('user', paused);
  }

  public setPauseReason(reason: PauseReason, paused: boolean): void {
    if (paused) {
      this.pauseReasons.add(reason);
      this.input?.clear();
      this.audio.suspend();
    } else {
      this.pauseReasons.delete(reason);
      if (this.pauseReasons.size === 0) {
        this.audio.resumeIfAvailable();
      }
    }

    this.options.onPauseChange(this.isPaused(), this.active && this.pauseReasons.has('user'));
    this.syncLoop();
  }

  public isPaused(): boolean {
    return this.pauseReasons.size > 0;
  }

  private update(stepSeconds: number): void {
    const input = this.input?.consumeSnapshot();
    if (input === undefined) {
      return;
    }

    const events = this.options.game.update(stepSeconds, input);
    this.audio.play(events);
    const snapshot = this.options.game.getSnapshot();
    this.options.onSnapshot(snapshot);

    if (hasGameOver(events)) {
      this.ended = true;
      this.audio.suspend();
      this.options.onGameOver(snapshot);
      this.syncLoop();
    }
  }

  private render(): void {
    const snapshot = this.options.game.getSnapshot();
    this.context.imageSmoothingEnabled = false;
    this.options.renderer.render(this.context, snapshot, readPalette(this.options.paletteElement));
    this.options.onSnapshot(snapshot);
  }

  private toggleUserPause(): void {
    if (this.ended) {
      return;
    }
    this.setPauseReason('user', !this.pauseReasons.has('user'));
  }

  private syncLoop(): void {
    if (this.loop === null) {
      return;
    }

    if (this.pauseReasons.size > 0 || this.ended) {
      this.loop.stop(true);
    } else {
      this.loop.start();
    }
  }

  private isMuted(): boolean {
    return this.audio.isMuted();
  }
}

function hasGameOver(events: readonly GameEvent[]): boolean {
  return events.some((event) => event.type === 'GAME_OVER');
}
