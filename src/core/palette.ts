export interface ArcadePalette {
  background: string;
  foreground: string;
}

export function readPalette(element: HTMLElement): ArcadePalette {
  const styles = element.win.getComputedStyle(element);
  const background = styles.getPropertyValue('--background-primary').trim() || '#000000';
  const foreground = styles.getPropertyValue('--text-normal').trim() || '#ffffff';

  return { background, foreground };
}
