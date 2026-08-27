export interface ArcadeLibraryGame {
  id: string;
  number: string;
  title: string;
}

export interface LibraryScreenOptions {
  games: readonly ArcadeLibraryGame[];
  selectedGameId: string;
  onPlay(gameId: string): void;
}

export function renderLibraryScreen(container: HTMLElement, options: LibraryScreenOptions): void {
  container.replaceChildren();

  const screen = createElement('section', 'arcade-screen arcade-library');
  const consoleElement = createElement('div', 'arcade-console arcade-library-console');
  const title = createElement('h1', 'arcade-title', 'ARCADE');
  const gameList = createElement('div', 'arcade-game-list');
  const buttons = options.games.map((game) => createGameButton(game, options));

  gameList.setAttribute('role', 'list');
  for (const button of buttons) {
    const listItem = createElement('div', 'arcade-game-list-item');
    listItem.setAttribute('role', 'listitem');
    listItem.append(button);
    gameList.append(listItem);
  }

  buttons.forEach((button, index) => {
    button.addEventListener('focus', () => selectButton(buttons, index));
    button.addEventListener('keydown', (event) => handleListKey(event, buttons, index));
  });

  const count = createElement('p', 'arcade-count', formatGameCount(options.games.length));
  const hints = createControlHints([
    ['↑↓', 'select'],
    ['Enter', 'play'],
  ]);
  consoleElement.append(title, gameList, count, hints);
  screen.append(consoleElement);
  container.append(screen);

  const selectedIndex = Math.max(0, options.games.findIndex((game) => game.id === options.selectedGameId));
  selectButton(buttons, selectedIndex);
  buttons[selectedIndex]?.focus();
}

function createGameButton(game: ArcadeLibraryGame, options: LibraryScreenOptions): HTMLButtonElement {
  const button = createElement('button', 'arcade-game-button');
  const marker = createElement('span', 'arcade-selection-marker', '▶');
  const label = createElement('span', 'arcade-game-label');
  const number = createElement('span', 'arcade-game-number', game.number);
  const title = createElement('span', 'arcade-game-title', game.title);

  button.type = 'button';
  marker.setAttribute('aria-hidden', 'true');
  label.append(number, title);
  button.append(marker, label);
  button.addEventListener('click', () => options.onPlay(game.id));
  return button;
}

function handleListKey(event: KeyboardEvent, buttons: readonly HTMLButtonElement[], currentIndex: number): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
    return;
  }

  event.preventDefault();
  const direction = event.key === 'ArrowDown' ? 1 : -1;
  const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
  buttons[nextIndex]?.focus();
}

function selectButton(buttons: readonly HTMLButtonElement[], selectedIndex: number): void {
  buttons.forEach((button, index) => {
    const selected = index === selectedIndex;
    button.classList.toggle('arcade-selected', selected);
    if (selected) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function formatGameCount(count: number): string {
  return `${count} ${count === 1 ? 'GAME' : 'GAMES'}`;
}

function createControlHints(hints: readonly (readonly [string, string])[]): HTMLParagraphElement {
  const element = createElement('p', 'arcade-hints');
  for (const [keys, action] of hints) {
    const hint = createElement('span', 'arcade-hint');
    hint.append(createElement('kbd', 'arcade-key', keys), createSpan({ text: ` ${action.toUpperCase()}` }));
    element.append(hint);
  }
  return element;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  return createEl(tagName, { cls: className, text });
}
