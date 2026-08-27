// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeededRandom } from '../../src/core/random';
import { InvadersGame } from '../../src/games/invaders/invaders-game';
import { restoreArcadeFocus } from '../../src/ui/focus';
import { renderGameScreen } from '../../src/ui/game-screen';
import { renderLibraryScreen } from '../../src/ui/library-screen';
import { renderSetupScreen } from '../../src/ui/setup-screen';

describe('Arcade screens', () => {
  beforeEach(() => {
    installObsidianDomHelpers();
    document.body.replaceChildren();
  });

  it('shows and moves a visible library selection without broad tooltip labels', () => {
    const container = document.createElement('div');
    const onPlay = vi.fn();
    document.body.append(container);

    renderLibraryScreen(container, {
      games: [
        { id: 'invaders', number: '01', title: 'INVADERS' },
        { id: 'rebound', number: '02', title: 'REBOUND' },
      ],
      selectedGameId: 'rebound',
      onPlay,
    });

    const screen = requiredElement<HTMLElement>(container, '.arcade-library');
    const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.arcade-game-button'));
    expect(screen.hasAttribute('aria-label')).toBe(false);
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1]?.classList.contains('arcade-selected')).toBe(true);
    expect(buttons[1]?.getAttribute('aria-current')).toBe('true');
    expect(buttons[1]?.querySelector('.arcade-game-label')?.textContent).toBe('02REBOUND');

    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    outsideButton.focus();
    restoreArcadeFocus(container);
    expect(document.activeElement).toBe(buttons[1]);

    buttons[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
    expect(buttons[0]?.classList.contains('arcade-selected')).toBe(true);

    buttons[0]?.click();
    expect(onPlay).toHaveBeenCalledWith('invaders');
  });

  it('uses a real setup cursor for keyboard and pointer controls', () => {
    const container = document.createElement('div');
    const onFocusChange = vi.fn();
    const onPreviousGame = vi.fn();
    const onNextGame = vi.fn();
    const onToggleDifficulty = vi.fn();
    const onPlay = vi.fn();
    const onBack = vi.fn();
    document.body.append(container);

    renderSetupScreen(container, {
      gameNumber: 6,
      difficulty: 'A',
      initialFocus: 'game',
      onFocusChange,
      onPreviousGame,
      onNextGame,
      onToggleDifficulty,
      onPlay,
      onBack,
    });

    const screen = requiredElement<HTMLElement>(container, '.arcade-setup');
    const rows = Array.from(container.querySelectorAll<HTMLElement>('.arcade-option-row'));
    expect(screen.hasAttribute('aria-label')).toBe(false);
    expect(document.activeElement).toBe(rows[0]);
    expect(rows[0]?.classList.contains('arcade-selected')).toBe(true);
    expect(requiredElement(container, '.arcade-option-subtext').textContent).toBe('WIDE CANNON · HARDER');
    expect(rows[1]?.getAttribute('aria-describedby')).toBe('arcade-option-difficulty-description');

    rows[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(onNextGame).toHaveBeenCalledOnce();

    rows[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(rows[1]);
    expect(rows[1]?.classList.contains('arcade-selected')).toBe(true);

    rows[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(onToggleDifficulty).toHaveBeenCalledOnce();
    rows[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(onPlay).toHaveBeenCalledOnce();

    const previousButton = requiredElement<HTMLButtonElement>(container, '.arcade-step-button');
    previousButton.click();
    expect(onPreviousGame).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(rows[0]);

    rows[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('separates a navigable pause menu from the game-over menu', () => {
    const container = document.createElement('div');
    const handlers = {
      onResume: vi.fn(),
      onRestart: vi.fn(),
      onSetup: vi.fn(),
      onLibrary: vi.fn(),
      onMuteToggle: vi.fn(),
    };
    document.body.append(container);

    const gameScreen = renderGameScreen(container, handlers, false);
    const overlay = requiredElement<HTMLElement>(container, '.arcade-overlay');
    const canvas = gameScreen.canvas;
    expect(canvas.hasAttribute('aria-label')).toBe(false);
    expect(canvas.getAttribute('aria-describedby')).toBe('arcade-game-controls');
    expect(document.activeElement).toBe(canvas);

    const snapshot = new InvadersGame({
      config: { gameNumber: 1, difficulty: 'B' },
      random: new SeededRandom(1),
    }).getSnapshot();
    gameScreen.update({ ...snapshot, phase: 'hit-pause' });
    const restart = buttonWithText(container, 'RESTART');
    expect(overlay.dataset.mode).toBe('hit');
    expect(restart.hidden).toBe(true);
    gameScreen.update(snapshot);
    expect(overlay.hidden).toBe(true);

    gameScreen.setPaused(true);
    const resume = buttonWithText(container, 'RESUME');
    const sound = buttonWithText(container, 'SOUND ON');
    expect(overlay.hidden).toBe(false);
    expect(overlay.dataset.mode).toBe('paused');
    expect(document.activeElement).toBe(resume);

    resume.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(restart);
    sound.click();
    expect(handlers.onMuteToggle).toHaveBeenCalledOnce();
    gameScreen.setMuted(true);
    expect(sound.textContent).toBe('SOUND OFF');
    restart.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }));
    expect(handlers.onResume).toHaveBeenCalledOnce();

    gameScreen.setPaused(false);
    expect(overlay.hidden).toBe(true);
    expect(document.activeElement).toBe(canvas);

    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    outsideButton.focus();
    restoreArcadeFocus(container, canvas);
    expect(document.activeElement).toBe(canvas);

    gameScreen.showGameOver();
    expect(overlay.dataset.mode).toBe('game-over');
    expect(resume.hidden).toBe(true);
    expect(sound.hidden).toBe(true);
    expect(document.activeElement).toBe(restart);
    restart.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(handlers.onSetup).toHaveBeenCalledOnce();
    restart.click();
    expect(handlers.onRestart).toHaveBeenCalledOnce();
  });
});

function installObsidianDomHelpers(): void {
  vi.stubGlobal('createEl', (tagName: string, options?: { cls?: string; text?: string }) => {
    const element = document.createElement(tagName);
    if (options?.cls !== undefined) {
      element.className = options.cls;
    }
    if (options?.text !== undefined) {
      element.textContent = options.text;
    }
    return element;
  });
  vi.stubGlobal('createDiv', () => document.createElement('div'));
  vi.stubGlobal('createSpan', (options?: { text?: string }) => {
    const element = document.createElement('span');
    if (options?.text !== undefined) {
      element.textContent = options.text;
    }
    return element;
  });
}

function requiredElement<TElement extends Element>(container: ParentNode, selector: string): TElement {
  const element = container.querySelector<TElement>(selector);
  if (element === null) {
    throw new Error(`Missing test element: ${selector}`);
  }
  return element;
}

function buttonWithText(container: ParentNode, text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    .find((candidate) => candidate.textContent === text);
  if (button === undefined) {
    throw new Error(`Missing test button: ${text}`);
  }
  return button;
}
