import type { InvadersSnapshot } from '../games/invaders/types';
import { formatScore } from '../games/invaders/invaders-renderer';

export interface GameScreenHandlers {
  onResume: () => void;
  onRestart: () => void;
  onSetup: () => void;
  onLibrary: () => void;
  onMuteToggle: () => void;
}

export interface GameScreen {
  canvas: HTMLCanvasElement;
  update(snapshot: Readonly<InvadersSnapshot>): void;
  setPaused(paused: boolean): void;
  setMuted(muted: boolean): void;
  showGameOver(): void;
}

type OverlayMode = 'hidden' | 'hit' | 'paused' | 'game-over';

export function renderGameScreen(container: HTMLElement, handlers: GameScreenHandlers, muted: boolean): GameScreen {
  container.replaceChildren();

  const screen = createElement('section', 'arcade-screen arcade-game-screen');
  const consoleElement = createElement('div', 'arcade-console arcade-game-console');
  const hud = createElement('header', 'arcade-hud');
  const gameName = createElement('span', 'arcade-hud-name', '01 INVADERS');
  const score = createElement('span', 'arcade-hud-score', '0000');
  const status = createElement('span', 'arcade-hud-status', 'LIVES 3   WAVE 1');
  gameName.id = 'arcade-game-name';
  hud.append(gameName, score, status);

  const frame = createElement('div', 'arcade-canvas-frame');
  const canvas = createEl('canvas');
  canvas.className = 'arcade-canvas';
  canvas.width = 160;
  canvas.height = 192;
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-labelledby', gameName.id);
  canvas.setAttribute('aria-describedby', 'arcade-game-controls');
  canvas.textContent = 'Invaders playfield. Use left and right to move, and space to fire.';
  canvas.addEventListener('pointerdown', () => canvas.focus());
  frame.append(canvas);

  const overlay = createElement('div', 'arcade-overlay');
  const overlayText = createElement('p', 'arcade-overlay-text');
  const overlayMenu = createElement('div', 'arcade-overlay-menu');
  const resume = createMenuButton('RESUME', handlers.onResume);
  const restart = createMenuButton('RESTART', handlers.onRestart);
  const sound = createMenuButton(muted ? 'SOUND OFF' : 'SOUND ON', handlers.onMuteToggle);
  const setup = createMenuButton('GAME SETUP', handlers.onSetup);
  const library = createMenuButton('ARCADE LIBRARY', handlers.onLibrary);
  const menuButtons = [resume, restart, sound, setup, library];
  overlay.hidden = true;
  overlayText.setAttribute('aria-live', 'polite');
  overlayMenu.append(...menuButtons);
  overlay.append(overlayText, overlayMenu);
  overlay.addEventListener('keydown', (event) => handleOverlayKey(event, menuButtons, handlers));
  frame.append(overlay);

  const hints = createGameHints();
  hints.id = 'arcade-game-controls';
  consoleElement.append(hud, frame, hints);
  screen.append(consoleElement);
  container.append(screen);
  canvas.focus();

  let overlayMode: OverlayMode = 'hidden';

  const setOverlay = (mode: OverlayMode): void => {
    overlayMode = mode;
    overlay.dataset.mode = mode;
    overlay.hidden = mode === 'hidden';
    overlayMenu.hidden = mode === 'hidden' || mode === 'hit';
    resume.hidden = mode !== 'paused';
    restart.hidden = mode === 'hit' || mode === 'hidden';
    sound.hidden = mode !== 'paused';
    setup.hidden = mode === 'hit' || mode === 'hidden';
    library.hidden = mode === 'hit' || mode === 'hidden';

    switch (mode) {
      case 'hidden':
        canvas.focus();
        break;
      case 'hit':
        overlayText.textContent = 'HIT';
        break;
      case 'paused':
        overlayText.textContent = 'PAUSED';
        resume.focus();
        break;
      case 'game-over':
        overlayText.textContent = 'Game over';
        restart.focus();
    }
  };

  return {
    canvas,
    update(snapshot) {
      score.textContent = snapshot.scoreVisible ? formatScore(snapshot.displayScore) : '    ';
      status.textContent = `LIVES ${snapshot.lives}   WAVE ${snapshot.wave}`;
      if (snapshot.phase === 'hit-pause' && overlayMode !== 'paused') {
        setOverlay('hit');
      } else if (snapshot.phase !== 'game-over' && overlayMode === 'hit') {
        setOverlay('hidden');
      }
    },
    setPaused(paused) {
      if (overlayMode === 'game-over') {
        return;
      }
      setOverlay(paused ? 'paused' : 'hidden');
    },
    setMuted(nextMuted) {
      sound.textContent = nextMuted ? 'SOUND OFF' : 'SOUND ON';
    },
    showGameOver() {
      setOverlay('game-over');
    },
  };
}

function handleOverlayKey(
  event: KeyboardEvent,
  buttons: readonly HTMLButtonElement[],
  handlers: GameScreenHandlers,
): void {
  const visibleButtons = buttons.filter((button) => !button.hidden);
  const currentIndex = visibleButtons.findIndex((button) => button === event.target);

  if ((event.key === 'p' || event.key === 'P' || event.key === 'Escape') && !buttons[0]?.hidden) {
    event.preventDefault();
    handlers.onResume();
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    handlers.onSetup();
    return;
  }

  if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && currentIndex >= 0) {
    event.preventDefault();
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + direction + visibleButtons.length) % visibleButtons.length;
    visibleButtons[nextIndex]?.focus();
  }
}

function createMenuButton(text: string, handler: () => void): HTMLButtonElement {
  const button = createElement('button', 'arcade-control-button', text);
  button.type = 'button';
  button.addEventListener('focus', () => {
    const siblings = button.parentElement?.querySelectorAll('.arcade-control-button');
    siblings?.forEach((sibling) => sibling.classList.toggle('arcade-selected', sibling === button));
  });
  button.addEventListener('click', handler);
  return button;
}

function createGameHints(): HTMLParagraphElement {
  const hints = createElement('p', 'arcade-game-hints');
  const controls: readonly (readonly [string, string])[] = [
    ['← → / A D', 'move'],
    ['Space', 'fire'],
    ['P / Esc', 'pause menu'],
  ];
  for (const [keys, action] of controls) {
    const hint = createElement('span', 'arcade-hint');
    hint.append(createElement('kbd', 'arcade-key', keys), createSpan({ text: ` ${action.toUpperCase()}` }));
    hints.append(hint);
  }
  return hints;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  return createEl(tagName, { cls: className, text });
}
