import { describe, expect, it, vi } from 'vitest';
import {
  browserScheduler,
  GameLoop,
  MAX_UPDATES_PER_FRAME,
  STEP_SECONDS,
  type FrameScheduler,
} from '../../src/core/game-loop';

class FakeScheduler implements FrameScheduler {
  public time = 0;
  private callback: FrameRequestCallback | null = null;

  public now(): number {
    return this.time;
  }

  public request(callback: FrameRequestCallback): number {
    this.callback = callback;
    return 1;
  }

  public cancel(): void {
    this.callback = null;
  }

  public tick(milliseconds: number): void {
    this.time += milliseconds;
    const callback = this.callback;
    this.callback = null;
    callback?.(this.time);
  }

  public pendingFrames(): number {
    return this.callback === null ? 0 : 1;
  }
}

describe('GameLoop', () => {
  it('advances sixty fixed updates in one second at sixty hertz', () => {
    const scheduler = new FakeScheduler();
    let updates = 0;
    const loop = new GameLoop({ update: () => updates += 1, render: () => undefined }, scheduler);
    loop.start();

    for (let frame = 0; frame < 60; frame += 1) {
      scheduler.tick(1_000 / 60);
    }

    expect(updates).toBe(60);
  });

  it('does not double simulation speed at a 120 hertz render rate', () => {
    const scheduler = new FakeScheduler();
    let updates = 0;
    const loop = new GameLoop({ update: () => updates += 1, render: () => undefined }, scheduler);
    loop.start();

    for (let frame = 0; frame < 120; frame += 1) {
      scheduler.tick(1_000 / 120);
    }

    expect(updates).toBe(60);
  });

  it('caps catch-up work after a delayed frame', () => {
    const scheduler = new FakeScheduler();
    let updates = 0;
    const loop = new GameLoop({ update: () => updates += 1, render: () => undefined }, scheduler);
    loop.start();
    scheduler.tick(500);

    expect(updates).toBe(MAX_UPDATES_PER_FRAME);
  });

  it('does not create duplicate frame chains and renders once when stopped paused', () => {
    const scheduler = new FakeScheduler();
    let renders = 0;
    const loop = new GameLoop({ update: () => undefined, render: () => renders += 1 }, scheduler);
    loop.start();
    loop.start();
    expect(scheduler.pendingFrames()).toBe(1);

    loop.stop(true);
    loop.stop(true);
    expect(loop.isRunning()).toBe(false);
    expect(renders).toBe(2);
  });

  it('uses the documented fixed simulation interval', () => {
    expect(STEP_SECONDS).toBe(1 / 60);
  });

  it('schedules frames through the owning window', () => {
    const request = vi.fn((_callback: FrameRequestCallback) => 7);
    const cancel = vi.fn();
    const ownerWindow = {
      performance: { now: () => 123 },
      requestAnimationFrame: request,
      cancelAnimationFrame: cancel,
    } as unknown as Window;
    const scheduler = browserScheduler(ownerWindow);
    const callback = vi.fn();

    expect(scheduler.now()).toBe(123);
    expect(scheduler.request(callback)).toBe(7);
    expect(request).toHaveBeenCalledWith(callback);
    scheduler.cancel(7);
    expect(cancel).toHaveBeenCalledWith(7);
  });
});
