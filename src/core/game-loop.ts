export const STEP_SECONDS = 1 / 60;
export const MAX_FRAME_DELTA_SECONDS = 0.25;
export const MAX_UPDATES_PER_FRAME = 5;
const TIME_EPSILON = 1e-9;

export interface FrameScheduler {
  now(): number;
  request(callback: FrameRequestCallback): number;
  cancel(frameId: number): void;
}

export interface GameLoopCallbacks {
  update(stepSeconds: number): void;
  render(): void;
}

export class GameLoop {
  private readonly scheduler: FrameScheduler;
  private readonly callbacks: GameLoopCallbacks;
  private frameId: number | null = null;
  private lastTimestamp = 0;
  private accumulator = 0;
  private running = false;

  public constructor(callbacks: GameLoopCallbacks, scheduler: FrameScheduler = browserScheduler()) {
    this.callbacks = callbacks;
    this.scheduler = scheduler;
  }

  public start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestamp = this.scheduler.now();
    this.accumulator = 0;
    this.scheduleNextFrame();
  }

  public stop(renderOnce = false): void {
    if (this.frameId !== null) {
      this.scheduler.cancel(this.frameId);
      this.frameId = null;
    }

    this.running = false;
    this.accumulator = 0;
    if (renderOnce) {
      this.callbacks.render();
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  private scheduleNextFrame(): void {
    this.frameId = this.scheduler.request((timestamp) => this.frame(timestamp));
  }

  private frame(timestamp: number): void {
    if (!this.running) {
      return;
    }

    this.frameId = null;
    const elapsedSeconds = Math.min(
      Math.max(0, (timestamp - this.lastTimestamp) / 1_000),
      MAX_FRAME_DELTA_SECONDS,
    );
    this.lastTimestamp = timestamp;
    this.accumulator += elapsedSeconds;

    let updates = 0;
    while (this.accumulator + TIME_EPSILON >= STEP_SECONDS && updates < MAX_UPDATES_PER_FRAME) {
      this.callbacks.update(STEP_SECONDS);
      this.accumulator -= STEP_SECONDS;
      if (Math.abs(this.accumulator) < TIME_EPSILON) {
        this.accumulator = 0;
      }
      updates += 1;
    }

    if (updates === MAX_UPDATES_PER_FRAME) {
      this.accumulator = 0;
    }

    this.callbacks.render();
    if (this.running) {
      this.scheduleNextFrame();
    }
  }
}

export function browserScheduler(ownerWindow: Window = window): FrameScheduler {
  return {
    now: () => ownerWindow.performance.now(),
    request: (callback) => ownerWindow.requestAnimationFrame(callback),
    cancel: (frameId) => ownerWindow.cancelAnimationFrame(frameId),
  };
}
