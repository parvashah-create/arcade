export interface InputSnapshot {
  leftHeld: boolean;
  rightHeld: boolean;
  firePressed: boolean;
  pausePressed: boolean;
  backPressed: boolean;
}

export const EMPTY_INPUT: InputSnapshot = {
  leftHeld: false,
  rightHeld: false,
  firePressed: false,
  pausePressed: false,
  backPressed: false,
};

export type GameEvent =
  | { type: 'SHOT_FIRED' }
  | { type: 'INVADER_DESTROYED'; row: number; points: number }
  | { type: 'COMMAND_SHIP_ENTERED' }
  | { type: 'COMMAND_SHIP_DESTROYED'; points: 200 }
  | { type: 'PLAYER_HIT'; livesRemaining: number }
  | { type: 'FORMATION_PULSE'; pulseIndex: 0 | 1 | 2 | 3 }
  | { type: 'WAVE_CLEARED'; wave: number }
  | { type: 'GAME_OVER'; reason: 'NO_LIVES' | 'INVASION' };

export interface ArcadeGame<TSnapshot> {
  start(): void;
  update(stepSeconds: number, input: InputSnapshot): readonly GameEvent[];
  getSnapshot(): Readonly<TSnapshot>;
  stop(): void;
}
