import { describe, expect, it } from 'vitest';
import { SeededRandom } from '../../src/core/random';

describe('SeededRandom', () => {
  it('repeats the same sequence for an equal seed', () => {
    const first = new SeededRandom(42);
    const second = new SeededRandom(42);

    expect(Array.from({ length: 8 }, () => first.next())).toEqual(
      Array.from({ length: 8 }, () => second.next()),
    );
  });

  it('changes sequence for a different seed', () => {
    const first = new SeededRandom(1);
    const second = new SeededRandom(2);

    expect(Array.from({ length: 4 }, () => first.next())).not.toEqual(
      Array.from({ length: 4 }, () => second.next()),
    );
  });
});
