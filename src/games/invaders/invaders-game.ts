import type { ArcadeGame, GameEvent, InputSnapshot } from '../../core/game';
import type { Rect, SweepTarget } from '../../core/geometry';
import { createProductionRandom, type RandomSource } from '../../core/random';
import { findProjectileCollision } from './collisions';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COMMAND_SHIP,
  FORMATION,
  INVISIBLE_REVEAL_SECONDS,
  PLAYER,
  PLAYFIELD,
  PROJECTILE,
  SHIELD,
} from './constants';
import {
  advanceFormation,
  bottommostLivingInvaderInColumn,
  createFormation,
  destroyInvader,
  invaderPoints,
  invaderRect,
  livingBounds,
  livingCount,
  livingIndices,
} from './formation';
import { decodeGameNumber } from './mode';
import {
  createShields,
  damageShieldAt,
  destroyAllShields,
  livingShieldCells,
  updateShields,
  type ShieldCellRef,
} from './shields';
import type {
  CommandShipState,
  FormationState,
  InvadersConfig,
  InvadersSnapshot,
  PlayerState,
  ProjectileState,
  ShieldState,
} from './types';

export interface InvadersGameOptions {
  config: InvadersConfig;
  random?: RandomSource;
}

type PlayerShotTarget =
  | { kind: 'shield'; cell: ShieldCellRef; rect: Rect }
  | { kind: 'invader'; index: number; rect: Rect }
  | { kind: 'command-ship'; rect: Rect };

type EnemyBombTarget =
  | { kind: 'shield'; cell: ShieldCellRef; rect: Rect }
  | { kind: 'player'; rect: Rect };

export class InvadersGame implements ArcadeGame<InvadersSnapshot> {
  private readonly config: InvadersConfig;
  private readonly random: RandomSource;
  private phase: InvadersSnapshot['phase'] = 'ready';
  private formation!: FormationState;
  private player!: PlayerState;
  private playerProjectile: ProjectileState | null = null;
  private enemyBombs: ProjectileState[] = [];
  private shields: ShieldState[] = [];
  private commandShip: CommandShipState | null = null;
  private commandDelay: number = COMMAND_SHIP.initialDelaySeconds;
  private enemyFireElapsed = 0;
  private hitPauseElapsed = 0;
  private waveTransitionElapsed = 0;
  private revealElapsed = 0;
  private pulseIndex: 0 | 1 | 2 | 3 = 0;
  private score = 0;
  private lives = PLAYER.lives;
  private wave = 1;
  private stopped = false;

  public constructor(options: InvadersGameOptions) {
    this.config = {
      gameNumber: options.config.gameNumber,
      difficulty: options.config.difficulty,
    };
    this.random = options.random ?? createProductionRandom();
    this.start();
  }

  public start(): void {
    this.phase = 'ready';
    this.score = 0;
    this.lives = PLAYER.lives;
    this.wave = 1;
    this.pulseIndex = 0;
    this.stopped = false;
    this.resetWave();
  }

  public update(stepSeconds: number, input: InputSnapshot): readonly GameEvent[] {
    if (this.stopped || this.phase === 'game-over') {
      return [];
    }

    const events: GameEvent[] = [];

    if (this.phase === 'hit-pause') {
      this.hitPauseElapsed -= stepSeconds;
      if (this.hitPauseElapsed <= 0) {
        this.phase = 'playing';
      }
      return events;
    }

    if (this.phase === 'wave-transition') {
      this.waveTransitionElapsed -= stepSeconds;
      if (this.waveTransitionElapsed <= 0) {
        this.resetWave();
        this.phase = 'playing';
      }
      return events;
    }

    if (this.phase === 'ready') {
      if (!input.leftHeld && !input.rightHeld && !input.firePressed) {
        return events;
      }
      this.phase = 'playing';
    }

    this.movePlayer(stepSeconds, input);
    this.tryFire(input, events);
    this.updateFormation(stepSeconds, events);

    if (this.phase !== 'playing') {
      return events;
    }

    this.updateShields(stepSeconds);
    this.updateCommandShip(stepSeconds, events);
    this.updatePlayerProjectile(stepSeconds, events);

    if (this.phase !== 'playing') {
      return events;
    }

    this.updateEnemyBombs(stepSeconds, events);

    if (this.phase !== 'playing') {
      return events;
    }

    this.spawnEnemyBomb(stepSeconds);
    this.revealElapsed = Math.max(0, this.revealElapsed - stepSeconds);
    return events;
  }

  public getSnapshot(): Readonly<InvadersSnapshot> {
    const mode = decodeGameNumber(this.config.gameNumber);
    return {
      phase: this.phase,
      mode,
      difficulty: this.config.difficulty,
      player: { ...this.player },
      formation: { ...this.formation, alive: [...this.formation.alive] },
      playerProjectile: this.playerProjectile === null ? null : { ...this.playerProjectile },
      enemyBombs: this.enemyBombs.map((bomb) => ({ ...bomb })),
      shields: this.shields.map((shield) => ({
        ...shield,
        cells: shield.cells.map((row) => [...row]),
      })),
      commandShip: this.commandShip === null ? null : { ...this.commandShip },
      score: this.score,
      displayScore: Math.min(this.score, 9_999),
      scoreVisible: this.commandShip === null,
      lives: this.lives,
      wave: this.wave,
      invadersVisible: !mode.invisibleInvaders || this.phase === 'ready' || this.revealElapsed > 0,
    };
  }

  public stop(): void {
    this.stopped = true;
    this.playerProjectile = null;
    this.enemyBombs = [];
    this.commandShip = null;
  }

  private resetWave(): void {
    this.formation = createFormation(this.waveStartY());
    this.player = {
      x: PLAYER.startX,
      y: PLAYER.y,
      width: this.playerWidth(),
      height: PLAYER.height,
      speed: PLAYER.speed,
    };
    this.playerProjectile = null;
    this.enemyBombs = [];
    this.shields = createShields();
    this.commandShip = null;
    this.commandDelay = COMMAND_SHIP.initialDelaySeconds;
    this.enemyFireElapsed = PROJECTILE.enemyFireIntervalSeconds * 0.75;
    this.hitPauseElapsed = 0;
    this.waveTransitionElapsed = 0;
    this.revealElapsed = 0;
  }

  private waveStartY(): number {
    const offset = Math.min(
      (this.wave - 1) * FORMATION.nextWaveDrop,
      FORMATION.maximumWaveDrop,
    );
    return FORMATION.firstWaveY + offset;
  }

  private playerWidth(): number {
    return this.config.difficulty === 'A' ? PLAYER.baseWidth * 2 : PLAYER.baseWidth;
  }

  private movePlayer(stepSeconds: number, input: InputSnapshot): void {
    const direction = Number(input.rightHeld) - Number(input.leftHeld);
    this.player.x += direction * this.player.speed * stepSeconds;
    this.player.x = Math.max(PLAYFIELD.left, Math.min(PLAYFIELD.right - this.player.width, this.player.x));
  }

  private tryFire(input: InputSnapshot, events: GameEvent[]): void {
    if (!input.firePressed || this.playerProjectile !== null) {
      return;
    }

    this.playerProjectile = {
      x: this.player.x + Math.floor(this.player.width / 2),
      y: this.player.y - PROJECTILE.playerHeight,
      width: PROJECTILE.width,
      height: PROJECTILE.playerHeight,
      velocityX: 0,
      velocityY: -PROJECTILE.playerSpeed,
      zigzagElapsed: 0,
      zigzagDirection: 1,
    };
    events.push({ type: 'SHOT_FIRED' });
  }

  private updateFormation(stepSeconds: number, events: GameEvent[]): void {
    const move = advanceFormation(this.formation, stepSeconds);
    if (move.moved) {
      events.push({ type: 'FORMATION_PULSE', pulseIndex: this.pulseIndex });
      this.pulseIndex = this.pulseIndex === 3 ? 0 : ((this.pulseIndex + 1) as 0 | 1 | 2 | 3);
    }

    const bounds = livingBounds(this.formation);
    if (bounds.y + bounds.height >= SHIELD.y - SHIELD.disappearanceDistance) {
      destroyAllShields(this.shields);
    }

    if (bounds.y + bounds.height >= PLAYFIELD.defenseLineY) {
      this.endGame('INVASION', events);
    }
  }

  private updateShields(stepSeconds: number): void {
    updateShields(this.shields, stepSeconds, decodeGameNumber(this.config.gameNumber).movingShields);
  }

  private updateCommandShip(stepSeconds: number, events: GameEvent[]): void {
    if (this.commandShip === null) {
      this.commandDelay -= stepSeconds;
      if (this.commandDelay <= 0) {
        this.commandShip = this.createCommandShip();
        events.push({ type: 'COMMAND_SHIP_ENTERED' });
      }
      return;
    }

    this.commandShip.x += this.commandShip.velocityX * stepSeconds;
    const leftEdge = this.commandShip.x + this.commandShip.width < 0;
    const rightEdge = this.commandShip.x > CANVAS_WIDTH;
    if (leftEdge || rightEdge) {
      this.commandShip = null;
      this.resetCommandDelay();
    }
  }

  private updatePlayerProjectile(stepSeconds: number, events: GameEvent[]): void {
    const projectile = this.playerProjectile;
    if (projectile === null) {
      return;
    }

    const previousY = projectile.y;
    const nextY = projectile.y + projectile.velocityY * stepSeconds;
    const hit = findProjectileCollision(
      projectile,
      previousY,
      nextY,
      this.playerShotTargets(),
    );

    if (hit !== null) {
      this.playerProjectile = null;
      this.resolvePlayerShotHit(hit.target, events);
      return;
    }

    projectile.y = nextY;
    if (projectile.y + projectile.height < 0) {
      this.playerProjectile = null;
    }
  }

  private updateEnemyBombs(stepSeconds: number, events: GameEvent[]): void {
    const remainingBombs: ProjectileState[] = [];
    const mode = decodeGameNumber(this.config.gameNumber);

    for (const bomb of this.enemyBombs) {
      const previousY = bomb.y;
      this.updateBombHorizontalMotion(bomb, stepSeconds, mode.zigzagBombs);
      const speedMultiplier = mode.fastBombs ? 2 : 1;
      const nextY = bomb.y + bomb.velocityY * speedMultiplier * stepSeconds;
      const hit = findProjectileCollision(bomb, previousY, nextY, this.enemyBombTargets());

      if (hit !== null) {
        if (hit.target.kind === 'shield') {
          damageShieldAt(this.shields, hit.target.rect);
        } else {
          this.handlePlayerHit(events);
        }
        continue;
      }

      bomb.y = nextY;
      if (bomb.y <= CANVAS_HEIGHT) {
        remainingBombs.push(bomb);
      }
    }

    this.enemyBombs = remainingBombs;
  }

  private updateBombHorizontalMotion(bomb: ProjectileState, stepSeconds: number, zigzagging: boolean): void {
    if (!zigzagging) {
      return;
    }

    bomb.zigzagElapsed += stepSeconds;
    if (bomb.zigzagElapsed >= PROJECTILE.zigzagTurnSeconds) {
      bomb.zigzagElapsed -= PROJECTILE.zigzagTurnSeconds;
      bomb.zigzagDirection = bomb.zigzagDirection === 1 ? -1 : 1;
    }

    bomb.x += bomb.zigzagDirection * PROJECTILE.zigzagSpeed * stepSeconds;
    bomb.x = Math.max(PLAYFIELD.left, Math.min(PLAYFIELD.right - bomb.width, bomb.x));
  }

  private spawnEnemyBomb(stepSeconds: number): void {
    if (this.enemyBombs.length >= PROJECTILE.maxEnemyBombs) {
      return;
    }

    this.enemyFireElapsed += stepSeconds;
    if (this.enemyFireElapsed < PROJECTILE.enemyFireIntervalSeconds) {
      return;
    }
    this.enemyFireElapsed -= PROJECTILE.enemyFireIntervalSeconds;

    const startColumn = Math.floor(this.random.next() * FORMATION.columns);
    for (let offset = 0; offset < FORMATION.columns; offset += 1) {
      const column = (startColumn + offset) % FORMATION.columns;
      const index = bottommostLivingInvaderInColumn(this.formation, column);
      if (index === null) {
        continue;
      }

      const invader = invaderRect(this.formation, index);
      this.enemyBombs.push({
        x: invader.x + Math.floor(invader.width / 2),
        y: invader.y + invader.height,
        width: PROJECTILE.width,
        height: PROJECTILE.enemyHeight,
        velocityX: 0,
        velocityY: PROJECTILE.enemySpeed,
        zigzagElapsed: 0,
        zigzagDirection: this.random.next() < 0.5 ? -1 : 1,
      });
      return;
    }
  }

  private resolvePlayerShotHit(target: PlayerShotTarget, events: GameEvent[]): void {
    switch (target.kind) {
      case 'shield':
        damageShieldAt(this.shields, target.rect);
        return;
      case 'command-ship':
        this.score += COMMAND_SHIP.points;
        this.commandShip = null;
        this.resetCommandDelay();
        events.push({ type: 'COMMAND_SHIP_DESTROYED', points: COMMAND_SHIP.points });
        return;
      case 'invader': {
        if (!destroyInvader(this.formation, target.index)) {
          return;
        }

        const points = invaderPoints(target.index);
        this.score += points;
        this.revealElapsed = INVISIBLE_REVEAL_SECONDS;
        events.push({ type: 'INVADER_DESTROYED', row: Math.floor(target.index / FORMATION.columns), points });

        if (livingCount(this.formation) === 0) {
          this.wave += 1;
          this.phase = 'wave-transition';
          this.waveTransitionElapsed = FORMATION.transitionSeconds;
          events.push({ type: 'WAVE_CLEARED', wave: this.wave });
        }
      }
    }
  }

  private handlePlayerHit(events: GameEvent[]): void {
    this.lives -= 1;
    this.playerProjectile = null;
    this.enemyBombs = [];
    this.player.x = PLAYER.startX;
    events.push({ type: 'PLAYER_HIT', livesRemaining: this.lives });

    if (this.lives <= 0) {
      this.endGame('NO_LIVES', events);
      return;
    }

    this.phase = 'hit-pause';
    this.hitPauseElapsed = PLAYER.hitPauseSeconds;
  }

  private endGame(reason: 'NO_LIVES' | 'INVASION', events: GameEvent[]): void {
    if (this.phase === 'game-over') {
      return;
    }

    this.phase = 'game-over';
    this.playerProjectile = null;
    this.enemyBombs = [];
    events.push({ type: 'GAME_OVER', reason });
  }

  private playerShotTargets(): SweepTarget<PlayerShotTarget>[] {
    const shieldTargets: SweepTarget<PlayerShotTarget>[] = livingShieldCells(this.shields).map(({ ref, rect }) => ({
      value: { kind: 'shield', cell: ref, rect },
      rect,
    }));
    const invaderTargets: SweepTarget<PlayerShotTarget>[] = livingIndices(this.formation).map((index) => ({
      value: { kind: 'invader', index, rect: invaderRect(this.formation, index) },
      rect: invaderRect(this.formation, index),
    }));
    const commandTarget: SweepTarget<PlayerShotTarget>[] = this.commandShip === null
      ? []
      : [{ value: { kind: 'command-ship', rect: this.commandShip }, rect: this.commandShip }];

    return [...shieldTargets, ...invaderTargets, ...commandTarget];
  }

  private enemyBombTargets(): SweepTarget<EnemyBombTarget>[] {
    const shieldTargets: SweepTarget<EnemyBombTarget>[] = livingShieldCells(this.shields).map(({ ref, rect }) => ({
      value: { kind: 'shield', cell: ref, rect },
      rect,
    }));

    return [
      ...shieldTargets,
      { value: { kind: 'player', rect: this.player }, rect: this.player },
    ];
  }

  private createCommandShip(): CommandShipState {
    const movingRight = this.random.next() < 0.5;
    return {
      x: movingRight ? -COMMAND_SHIP.width : CANVAS_WIDTH,
      y: COMMAND_SHIP.y,
      width: COMMAND_SHIP.width,
      height: COMMAND_SHIP.height,
      velocityX: movingRight ? COMMAND_SHIP.speed : -COMMAND_SHIP.speed,
    };
  }

  private resetCommandDelay(): void {
    const range = COMMAND_SHIP.maximumDelaySeconds - COMMAND_SHIP.minimumDelaySeconds;
    this.commandDelay = COMMAND_SHIP.minimumDelaySeconds + this.random.next() * range;
  }
}
