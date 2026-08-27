import { describe, expect, it } from 'vitest';
import { toGameKey } from '../../src/core/input-key';

describe('game input keys', () => {
  it('normalizes browser arrow key names', () => {
    expect(toGameKey('ArrowLeft')).toBe('left');
    expect(toGameKey('ArrowRight')).toBe('right');
  });

  it('normalizes alternate controls without capturing unrelated keys', () => {
    expect(toGameKey('A')).toBe('left');
    expect(toGameKey('d')).toBe('right');
    expect(toGameKey(' ')).toBe('fire');
    expect(toGameKey('P')).toBe('pause');
    expect(toGameKey('Escape')).toBe('menu');
    expect(toGameKey('ArrowDown')).toBeNull();
  });
});
