export interface RandomSource {
  next(): number;
}

export class SeededRandom implements RandomSource {
  private state: number;

  public constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state = (Math.imul(this.state, 1_664_525) + 1_013_904_223) >>> 0;
    return this.state / 4_294_967_296;
  }
}

export function createProductionRandom(): RandomSource {
  const seed = (Date.now() ^ Math.floor(Math.random() * 4_294_967_296)) >>> 0;
  return new SeededRandom(seed);
}
