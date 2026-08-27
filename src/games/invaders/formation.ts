import type { Rect } from '../../core/geometry';
import { FORMATION, INVADER_ROW_POINTS, PLAYFIELD, formationMoveInterval } from './constants';
import type { FormationState } from './types';

export interface FormationAdvance {
  moved: boolean;
  descended: boolean;
}

export function createFormation(y: number): FormationState {
  return {
    x: FORMATION.startX,
    y,
    direction: 1,
    pose: 0,
    moveElapsed: 0,
    alive: Array.from({ length: FORMATION.rows * FORMATION.columns }, () => true),
  };
}

export function advanceFormation(formation: FormationState, stepSeconds: number): FormationAdvance {
  formation.moveElapsed += stepSeconds;
  const interval = formationMoveInterval(livingCount(formation));

  if (formation.moveElapsed < interval) {
    return { moved: false, descended: false };
  }

  formation.moveElapsed -= interval;
  const bounds = livingBounds(formation);
  const nextLeft = bounds.x + formation.direction * FORMATION.horizontalStep;
  const nextRight = bounds.x + bounds.width + formation.direction * FORMATION.horizontalStep;
  const shouldDescend = nextLeft < PLAYFIELD.left || nextRight > PLAYFIELD.right;

  if (shouldDescend) {
    formation.direction = formation.direction === 1 ? -1 : 1;
    formation.y += FORMATION.descentStep;
  } else {
    formation.x += formation.direction * FORMATION.horizontalStep;
  }

  formation.pose = formation.pose === 0 ? 1 : 0;
  return { moved: true, descended: shouldDescend };
}

export function invaderRect(formation: FormationState, index: number): Rect {
  const row = invaderRow(index);
  const column = invaderColumn(index);

  return {
    x: formation.x + column * FORMATION.columnSpacing,
    y: formation.y + row * FORMATION.rowSpacing,
    width: FORMATION.invaderWidth,
    height: FORMATION.invaderHeight,
  };
}

export function livingBounds(formation: FormationState): Rect {
  const living = livingIndices(formation);
  if (living.length === 0) {
    return { x: formation.x, y: formation.y, width: 0, height: 0 };
  }

  const rects = living.map((index) => invaderRect(formation, index));
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.height));

  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function livingCount(formation: FormationState): number {
  return formation.alive.filter(Boolean).length;
}

export function livingIndices(formation: FormationState): number[] {
  return formation.alive.flatMap((alive, index) => (alive ? [index] : []));
}

export function destroyInvader(formation: FormationState, index: number): boolean {
  if (!formation.alive[index]) {
    return false;
  }

  formation.alive[index] = false;
  return true;
}

export function bottommostLivingInvaderInColumn(formation: FormationState, column: number): number | null {
  for (let row = FORMATION.rows - 1; row >= 0; row -= 1) {
    const index = row * FORMATION.columns + column;
    if (formation.alive[index]) {
      return index;
    }
  }

  return null;
}

export function invaderRow(index: number): number {
  return Math.floor(index / FORMATION.columns);
}

export function invaderColumn(index: number): number {
  return index % FORMATION.columns;
}

export function invaderPoints(index: number): number {
  return INVADER_ROW_POINTS[invaderRow(index)] ?? 0;
}
