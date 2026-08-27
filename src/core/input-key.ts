export type GameKey = 'left' | 'right' | 'fire' | 'pause' | 'menu';

export function toGameKey(key: string): GameKey | null {
  switch (key.toLowerCase()) {
    case 'arrowleft':
    case 'a':
      return 'left';
    case 'arrowright':
    case 'd':
      return 'right';
    case ' ':
      return 'fire';
    case 'p':
      return 'pause';
    case 'escape':
      return 'menu';
    default:
      return null;
  }
}
