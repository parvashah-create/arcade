export type InvadersDifficulty = 'A' | 'B';

export interface ArcadeDataV1 {
  version: 1;
  muted: boolean;
  highScores: {
    invaders: number;
  };
  invaders: {
    gameNumber: number;
    difficulty: InvadersDifficulty;
  };
}

export const DEFAULT_ARCADE_DATA: ArcadeDataV1 = {
  version: 1,
  muted: false,
  highScores: {
    invaders: 0,
  },
  invaders: {
    gameNumber: 1,
    difficulty: 'B',
  },
};

export function parseArcadeData(value: unknown): ArcadeDataV1 {
  const record = isRecord(value) ? value : {};
  const highScores = isRecord(record.highScores) ? record.highScores : {};
  const invaders = isRecord(record.invaders) ? record.invaders : {};

  return {
    version: 1,
    muted: typeof record.muted === 'boolean' ? record.muted : DEFAULT_ARCADE_DATA.muted,
    highScores: {
      invaders: toScore(highScores.invaders),
    },
    invaders: {
      gameNumber: toGameNumber(invaders.gameNumber),
      difficulty: toDifficulty(invaders.difficulty),
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return DEFAULT_ARCADE_DATA.highScores.invaders;
  }

  return Math.floor(value);
}

function toGameNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_ARCADE_DATA.invaders.gameNumber;
  }

  return Math.max(1, Math.min(16, Math.floor(value)));
}

function toDifficulty(value: unknown): InvadersDifficulty {
  return value === 'A' || value === 'B' ? value : DEFAULT_ARCADE_DATA.invaders.difficulty;
}
