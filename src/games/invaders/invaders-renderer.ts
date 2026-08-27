import type { CanvasRenderer } from '../../core/game-host';
import type { ArcadePalette } from '../../core/palette';
import { CANVAS_HEIGHT, CANVAS_WIDTH, COMMAND_SHIP, FORMATION, PLAYFIELD, SHIELD } from './constants';
import type { InvadersSnapshot } from './types';

const INVADER_POSES = [
  [
    '00100100',
    '00011000',
    '01111110',
    '11011011',
    '11111111',
    '00100100',
  ],
  [
    '00100100',
    '10011001',
    '11111111',
    '01111110',
    '00100100',
    '01000010',
  ],
] as const;

export class InvadersRenderer implements CanvasRenderer<InvadersSnapshot> {
  public render(
    context: CanvasRenderingContext2D,
    snapshot: Readonly<InvadersSnapshot>,
    palette: ArcadePalette,
  ): void {
    context.fillStyle = palette.background;
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = palette.foreground;

    this.drawBoundaries(context);
    this.drawShields(context, snapshot);
    this.drawFormation(context, snapshot);
    this.drawCommandShip(context, snapshot);
    this.drawProjectile(context, snapshot.playerProjectile);
    snapshot.enemyBombs.forEach((bomb) => this.drawProjectile(context, bomb));
    this.drawPlayer(context, snapshot);
    this.drawRemainingHits(context, snapshot.lives);
  }

  private drawBoundaries(context: CanvasRenderingContext2D): void {
    context.fillRect(PLAYFIELD.left, PLAYFIELD.defenseLineY, PLAYFIELD.right - PLAYFIELD.left, 1);
    context.fillRect(PLAYFIELD.left, 184, 4, 1);
    context.fillRect(PLAYFIELD.right - 4, 184, 4, 1);
  }

  private drawFormation(context: CanvasRenderingContext2D, snapshot: Readonly<InvadersSnapshot>): void {
    if (!snapshot.invadersVisible) {
      return;
    }

    snapshot.formation.alive.forEach((alive, index) => {
      if (!alive) {
        return;
      }
      const row = Math.floor(index / FORMATION.columns);
      const column = index % FORMATION.columns;
      const x = Math.round(snapshot.formation.x + column * FORMATION.columnSpacing);
      const y = Math.round(snapshot.formation.y + row * FORMATION.rowSpacing);
      this.drawInvader(context, x, y, snapshot.formation.pose);
    });
  }

  private drawInvader(context: CanvasRenderingContext2D, x: number, y: number, pose: 0 | 1): void {
    const sprite = INVADER_POSES[pose];
    sprite.forEach((line, row) => {
      for (let column = 0; column < line.length; column += 1) {
        if (line[column] === '1') {
          context.fillRect(x + column, y + row, 1, 1);
        }
      }
    });
  }

  private drawShields(context: CanvasRenderingContext2D, snapshot: Readonly<InvadersSnapshot>): void {
    snapshot.shields.forEach((shield) => {
      shield.cells.forEach((row, rowIndex) => {
        row.forEach((alive, column) => {
          if (alive) {
            context.fillRect(
              Math.round(shield.x + column * SHIELD.cellSize),
              Math.round(shield.y + rowIndex * SHIELD.cellSize),
              SHIELD.cellSize,
              SHIELD.cellSize,
            );
          }
        });
      });
    });
  }

  private drawCommandShip(context: CanvasRenderingContext2D, snapshot: Readonly<InvadersSnapshot>): void {
    if (snapshot.commandShip === null) {
      return;
    }

    const ship = snapshot.commandShip;
    const x = Math.round(ship.x);
    const y = Math.round(ship.y);
    context.fillRect(x + 2, y, COMMAND_SHIP.width - 4, 1);
    context.fillRect(x, y + 1, COMMAND_SHIP.width, 2);
    context.fillRect(x + 3, y + 3, COMMAND_SHIP.width - 6, 2);
  }

  private drawProjectile(
    context: CanvasRenderingContext2D,
    projectile: Readonly<InvadersSnapshot['playerProjectile']>,
  ): void {
    if (projectile === null) {
      return;
    }

    context.fillRect(
      Math.round(projectile.x),
      Math.round(projectile.y),
      projectile.width,
      projectile.height,
    );
  }

  private drawPlayer(context: CanvasRenderingContext2D, snapshot: Readonly<InvadersSnapshot>): void {
    if (snapshot.phase === 'hit-pause') {
      return;
    }

    const { player } = snapshot;
    const x = Math.round(player.x);
    const y = Math.round(player.y);
    const [cap, shoulder] = getPlayerTurretLayers(player.width);
    context.fillRect(x + cap.offset, y, cap.width, 1);
    context.fillRect(x + shoulder.offset, y + 1, shoulder.width, 1);
    context.fillRect(x, y + 2, player.width, player.height - 2);
  }

  private drawRemainingHits(context: CanvasRenderingContext2D, lives: number): void {
    for (let index = 0; index < lives; index += 1) {
      context.fillRect(8 + index * 6, 187, 4, 2);
    }
  }
}

export function formatScore(score: number): string {
  return Math.min(Math.max(0, Math.floor(score)), 9_999).toString().padStart(4, '0');
}

export function getPlayerTurretLayers(playerWidth: number): readonly [
  { readonly offset: number; readonly width: number },
  { readonly offset: number; readonly width: number },
] {
  const capWidth = playerWidth / 4;
  const shoulderWidth = playerWidth / 2;
  return [
    { offset: (playerWidth - capWidth) / 2, width: capWidth },
    { offset: (playerWidth - shoulderWidth) / 2, width: shoulderWidth },
  ];
}
