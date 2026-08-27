import type { InvadersDifficulty } from '../data';
import { decodeGameNumber } from '../games/invaders/mode';

export type SetupFocus = 'game' | 'difficulty' | 'play' | 'library';

export interface SetupScreenOptions {
  gameNumber: number;
  difficulty: InvadersDifficulty;
  initialFocus: SetupFocus;
  onFocusChange: (focus: SetupFocus) => void;
  onPreviousGame: () => void;
  onNextGame: () => void;
  onToggleDifficulty: () => void;
  onPlay: () => void;
  onBack: () => void;
}

interface FocusTarget {
  id: SetupFocus;
  element: HTMLElement;
}

export function renderSetupScreen(container: HTMLElement, options: SetupScreenOptions): void {
  container.replaceChildren();

  const mode = decodeGameNumber(options.gameNumber);
  const screen = createElement('section', 'arcade-screen arcade-setup');
  const consoleElement = createElement('div', 'arcade-console arcade-setup-console');
  const title = createElement('h1', 'arcade-title arcade-setup-title', 'INVADERS');
  const hints = createSetupHints();
  const gameRow = createStepperRow('GAME', mode.gameNumber.toString().padStart(2, '0'), {
    onPrevious: options.onPreviousGame,
    onNext: options.onNextGame,
  });
  const difficultyRow = createStepperRow(
    'DIFFICULTY',
    options.difficulty,
    {
      onPrevious: options.onToggleDifficulty,
      onNext: options.onToggleDifficulty,
    },
    options.difficulty === 'A' ? 'WIDE CANNON · HARDER' : 'SMALL CANNON · EASIER',
  );
  const modifiers = createElement('dl', 'arcade-modifier-list');

  modifiers.append(
    createModifier('MOVING SHIELDS', mode.movingShields),
    createModifier('ZIGZAG BOMBS', mode.zigzagBombs),
    createModifier('FAST BOMBS', mode.fastBombs),
    createModifier('INVISIBLE INVADERS', mode.invisibleInvaders),
  );

  const controls = createElement('div', 'arcade-setup-controls');
  const play = createElement('button', 'arcade-control-button arcade-primary-action', 'PLAY');
  const back = createElement('button', 'arcade-control-button', 'ARCADE LIBRARY');
  play.type = 'button';
  back.type = 'button';
  play.addEventListener('click', options.onPlay);
  back.addEventListener('click', options.onBack);
  controls.append(play, back);

  const focusTargets: readonly FocusTarget[] = [
    { id: 'game', element: gameRow },
    { id: 'difficulty', element: difficultyRow },
    { id: 'play', element: play },
    { id: 'library', element: back },
  ];
  for (const target of focusTargets) {
    target.element.addEventListener('focus', () => selectTarget(focusTargets, target.id, options));
  }

  screen.addEventListener('keydown', (event) => handleSetupKey(event, focusTargets, options));
  consoleElement.append(title, hints, gameRow, difficultyRow, modifiers, controls);
  screen.append(consoleElement);
  container.append(screen);

  const initialTarget = focusTargets.find((target) => target.id === options.initialFocus) ?? focusTargets[0];
  if (initialTarget !== undefined) {
    selectTarget(focusTargets, initialTarget.id, options);
    initialTarget.element.focus();
  }
}

function handleSetupKey(
  event: KeyboardEvent,
  targets: readonly FocusTarget[],
  options: SetupScreenOptions,
): void {
  const currentIndex = targets.findIndex((target) => target.element === event.target);
  const current = targets[currentIndex];

  if (event.key === 'Escape') {
    event.preventDefault();
    options.onBack();
    return;
  }

  if (current === undefined) {
    return;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    const nextId = verticalTarget(current.id, event.key === 'ArrowDown');
    targets.find((target) => target.id === nextId)?.element.focus();
    return;
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    if (current.id === 'game') {
      event.preventDefault();
      if (event.key === 'ArrowLeft') {
        options.onPreviousGame();
      } else {
        options.onNextGame();
      }
    } else if (current.id === 'difficulty') {
      event.preventDefault();
      options.onToggleDifficulty();
    } else {
      event.preventDefault();
      const nextId: SetupFocus = current.id === 'play' ? 'library' : 'play';
      targets.find((target) => target.id === nextId)?.element.focus();
    }
    return;
  }

  if (event.key === 'Enter' && (current.id === 'game' || current.id === 'difficulty')) {
    event.preventDefault();
    options.onPlay();
  }
}

function verticalTarget(current: SetupFocus, movingDown: boolean): SetupFocus {
  if (movingDown) {
    switch (current) {
      case 'game':
        return 'difficulty';
      case 'difficulty':
        return 'play';
      case 'play':
      case 'library':
        return 'game';
    }
  }

  switch (current) {
    case 'game':
      return 'play';
    case 'difficulty':
      return 'game';
    case 'play':
    case 'library':
      return 'difficulty';
  }
}

function selectTarget(targets: readonly FocusTarget[], selectedId: SetupFocus, options: SetupScreenOptions): void {
  for (const target of targets) {
    target.element.classList.toggle('arcade-selected', target.id === selectedId);
  }
  options.onFocusChange(selectedId);
}

function createStepperRow(
  label: string,
  value: string,
  handlers: { onPrevious(): void; onNext(): void },
  description?: string,
): HTMLDivElement {
  const row = createElement('div', 'arcade-option-row');
  const copy = createElement('span', 'arcade-option-copy');
  const optionLabel = createElement('span', 'arcade-option-label', label);
  const stepper = createElement('span', 'arcade-stepper');
  const previous = createStepButton('←', 'PREVIOUS', () => {
    row.focus();
    handlers.onPrevious();
  });
  const output = createElement('strong', 'arcade-option-value', value);
  const next = createStepButton('→', 'NEXT', () => {
    row.focus();
    handlers.onNext();
  });

  row.tabIndex = 0;
  row.setAttribute('role', 'group');
  optionLabel.id = `arcade-option-${label.toLowerCase()}`;
  row.setAttribute('aria-labelledby', optionLabel.id);
  copy.append(optionLabel);
  if (description !== undefined) {
    const subtext = createElement('span', 'arcade-option-subtext', description);
    subtext.id = `${optionLabel.id}-description`;
    row.setAttribute('aria-describedby', subtext.id);
    copy.append(subtext);
  }
  row.addEventListener('click', () => row.focus());
  stepper.append(previous, output, next);
  row.append(copy, stepper);
  return row;
}

function createStepButton(symbol: string, accessibleText: string, handler: () => void): HTMLButtonElement {
  const button = createElement('button', 'arcade-step-button');
  const symbolElement = createElement('span', '', symbol);
  const textElement = createElement('span', 'arcade-visually-hidden', accessibleText);
  button.type = 'button';
  button.tabIndex = -1;
  symbolElement.setAttribute('aria-hidden', 'true');
  button.append(symbolElement, textElement);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    handler();
  });
  return button;
}

function createModifier(label: string, active: boolean): HTMLElement {
  const row = createDiv();
  const term = createElement('dt', 'arcade-modifier-label', label);
  const description = createElement('dd', 'arcade-modifier-value', active ? 'ON' : 'OFF');
  row.append(term, description);
  return row;
}

function createSetupHints(): HTMLParagraphElement {
  const hints = createElement('p', 'arcade-hints arcade-setup-hints');
  const controls: readonly (readonly [string, string])[] = [
    ['↑↓', 'choose'],
    ['←→', 'change'],
    ['Enter', 'play'],
    ['Esc', 'library'],
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
