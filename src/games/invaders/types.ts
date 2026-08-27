import type { InvadersDifficulty } from '../../data';
import type { Rect } from '../../core/geometry';

export type FormationDirection = -1 | 1;
export type GamePhase = 'ready' | 'playing' | 'hit-pause' | 'wave-transition' | 'game-over';

export interface InvadersMode {
  gameNumber: number;
  movingShields: boolean;
  zigzagBombs: boolean;
  fastBombs: boolean;
  invisibleInvaders: boolean;
}

export interface InvadersConfig {
  gameNumber: number;
  difficulty: InvadersDifficulty;
}

export interface FormationState {
  x: number;
  y: number;
  direction: FormationDirection;
  pose: 0 | 1;
  moveElapsed: number;
  alive: boolean[];
}

export interface PlayerState extends Rect {
  speed: number;
}

export interface ProjectileState extends Rect {
  velocityX: number;
  velocityY: number;
  zigzagElapsed: number;
  zigzagDirection: FormationDirection;
}

export interface ShieldState {
  x: number;
  y: number;
  direction: FormationDirection;
  cells: boolean[][];
}

export interface CommandShipState extends Rect {
  velocityX: number;
}

export interface InvadersSnapshot {
  phase: GamePhase;
  mode: InvadersMode;
  difficulty: InvadersDifficulty;
  player: Readonly<PlayerState>;
  formation: Readonly<FormationState>;
  playerProjectile: Readonly<ProjectileState> | null;
  enemyBombs: readonly Readonly<ProjectileState>[];
  shields: readonly Readonly<ShieldState>[];
  commandShip: Readonly<CommandShipState> | null;
  score: number;
  displayScore: number;
  scoreVisible: boolean;
  lives: number;
  wave: number;
  invadersVisible: boolean;
}
