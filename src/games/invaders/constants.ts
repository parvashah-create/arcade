export const CANVAS_WIDTH = 160;
export const CANVAS_HEIGHT = 192;
export const SIMULATION_HZ = 60;

export const PLAYFIELD = {
  left: 8,
  right: 152,
  defenseLineY: 168,
} as const;

export const PLAYER = {
  startX: 76,
  y: 176,
  baseWidth: 8,
  height: 6,
  speed: 72,
  lives: 3,
  hitPauseSeconds: 0.75,
} as const;

export const PROJECTILE = {
  width: 1,
  playerHeight: 4,
  enemyHeight: 3,
  playerSpeed: 108,
  enemySpeed: 42,
  maxEnemyBombs: 1,
  enemyFireIntervalSeconds: 1.1,
  zigzagSpeed: 18,
  zigzagTurnSeconds: 0.16,
} as const;

export const FORMATION = {
  rows: 6,
  columns: 6,
  startX: 36,
  firstWaveY: 26,
  invaderWidth: 8,
  invaderHeight: 6,
  columnSpacing: 16,
  rowSpacing: 10,
  horizontalStep: 2,
  descentStep: 8,
  slowIntervalSeconds: 0.55,
  fastIntervalSeconds: 0.08,
  nextWaveDrop: 8,
  maximumWaveDrop: 40,
  transitionSeconds: 0.8,
} as const;

export const SHIELD = {
  count: 3,
  cellSize: 2,
  columns: 12,
  rows: 8,
  y: 148,
  positions: [20, 68, 116] as const,
  movingSpeed: 12,
  movingRange: 8,
  disappearanceDistance: 12,
} as const;

export const COMMAND_SHIP = {
  width: 14,
  height: 5,
  y: 12,
  speed: 24,
  initialDelaySeconds: 12,
  minimumDelaySeconds: 14,
  maximumDelaySeconds: 22,
  points: 200,
} as const;

export const INVADER_ROW_POINTS = [30, 25, 20, 15, 10, 5] as const;

export const INVISIBLE_REVEAL_SECONDS = 0.5;

export function formationMoveInterval(livingCount: number): number {
  const total = FORMATION.rows * FORMATION.columns;
  const clamped = Math.max(1, Math.min(total, livingCount));
  const progress = (clamped - 1) / (total - 1);
  return FORMATION.fastIntervalSeconds +
    (FORMATION.slowIntervalSeconds - FORMATION.fastIntervalSeconds) * progress;
}
