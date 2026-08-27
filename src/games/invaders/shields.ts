import type { Rect } from '../../core/geometry';
import { intersects } from '../../core/geometry';
import { SHIELD } from './constants';
import type { FormationDirection, ShieldState } from './types';

export interface ShieldCellRef {
  shieldIndex: number;
  row: number;
  column: number;
}

export function createShields(): ShieldState[] {
  return SHIELD.positions.map((x) => ({
    x,
    y: SHIELD.y,
    direction: 1,
    cells: createShieldCells(),
  }));
}

export function updateShields(shields: ShieldState[], stepSeconds: number, moving: boolean): void {
  if (!moving) {
    return;
  }

  for (const shield of shields) {
    shield.x += shield.direction * SHIELD.movingSpeed * stepSeconds;
    const base = closestShieldBase(shield.x);
    const minimum = base - SHIELD.movingRange;
    const maximum = base + SHIELD.movingRange;

    if (shield.x <= minimum) {
      shield.x = minimum;
      shield.direction = 1;
    } else if (shield.x >= maximum) {
      shield.x = maximum;
      shield.direction = -1;
    }
  }
}

export function shieldCellRect(shield: ShieldState, row: number, column: number): Rect {
  return {
    x: shield.x + column * SHIELD.cellSize,
    y: shield.y + row * SHIELD.cellSize,
    width: SHIELD.cellSize,
    height: SHIELD.cellSize,
  };
}

export function livingShieldCells(shields: readonly ShieldState[]): Array<{ ref: ShieldCellRef; rect: Rect }> {
  const cells: Array<{ ref: ShieldCellRef; rect: Rect }> = [];

  shields.forEach((shield, shieldIndex) => {
    shield.cells.forEach((row, rowIndex) => {
      row.forEach((alive, column) => {
        if (alive) {
          cells.push({
            ref: { shieldIndex, row: rowIndex, column },
            rect: shieldCellRect(shield, rowIndex, column),
          });
        }
      });
    });
  });

  return cells;
}

export function damageShieldAt(shields: ShieldState[], impact: Rect): boolean {
  let damaged = false;

  shields.forEach((shield) => {
    shield.cells.forEach((row, rowIndex) => {
      row.forEach((alive, column) => {
        if (alive && intersects(impact, shieldCellRect(shield, rowIndex, column))) {
          row[column] = false;
          damaged = true;
        }
      });
    });
  });

  return damaged;
}

export function destroyAllShields(shields: ShieldState[]): void {
  shields.forEach((shield) => {
    shield.cells.forEach((row) => row.fill(false));
  });
}

function createShieldCells(): boolean[][] {
  return Array.from({ length: SHIELD.rows }, (_, row) =>
    Array.from({ length: SHIELD.columns }, (_, column) => shieldCellVisible(row, column)),
  );
}

function shieldCellVisible(row: number, column: number): boolean {
  const centerLeft = SHIELD.columns / 2 - 1;
  const centerRight = SHIELD.columns / 2;
  const isBottomNotch = row >= SHIELD.rows - 2 && (column === centerLeft || column === centerRight);
  const isCorner = row === 0 && (column === 0 || column === SHIELD.columns - 1);
  return !isBottomNotch && !isCorner;
}

function closestShieldBase(currentX: number): number {
  let best: number = SHIELD.positions[0] ?? 0;
  let bestDistance = Math.abs(currentX - best);

  for (const position of SHIELD.positions.slice(1)) {
    const distance = Math.abs(currentX - position);
    if (distance < bestDistance) {
      best = position;
      bestDistance = distance;
    }
  }

  return best;
}

export function invertDirection(direction: FormationDirection): FormationDirection {
  return direction === 1 ? -1 : 1;
}
