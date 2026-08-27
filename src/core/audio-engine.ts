import type { GameEvent } from './game';

export type ToneCue = 'shot' | 'invader-hit' | 'player-hit' | 'command-ship' | 'pulse';

export function cueForEvent(event: GameEvent): ToneCue | null {
  switch (event.type) {
    case 'SHOT_FIRED':
      return 'shot';
    case 'INVADER_DESTROYED':
      return 'invader-hit';
    case 'PLAYER_HIT':
      return 'player-hit';
    case 'COMMAND_SHIP_ENTERED':
      return 'command-ship';
    case 'FORMATION_PULSE':
      return 'pulse';
    default:
      return null;
  }
}

export class AudioEngine {
  private muted: boolean;
  private context: AudioContext | null = null;
  private suspended = false;

  public constructor(muted: boolean) {
    this.muted = muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.suspend();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public resumeFromUserGesture(): void {
    if (this.muted) {
      return;
    }

    this.ensureContext();
    if (this.context !== null && this.context.state === 'suspended') {
      void this.context.resume();
    }
    this.suspended = false;
  }

  public resumeIfAvailable(): void {
    if (this.muted || this.context === null) {
      return;
    }
    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
    this.suspended = false;
  }

  public play(events: readonly GameEvent[]): void {
    if (this.muted || this.suspended || this.context === null) {
      return;
    }

    for (const event of events) {
      const cue = cueForEvent(event);
      if (cue !== null) {
        this.playCue(cue, event);
      }
    }
  }

  public suspend(): void {
    this.suspended = true;
    if (this.context !== null && this.context.state === 'running') {
      void this.context.suspend();
    }
  }

  public dispose(): void {
    if (this.context !== null && this.context.state !== 'closed') {
      void this.context.close();
    }
    this.context = null;
  }

  private ensureContext(): void {
    if (this.context === null) {
      this.context = new AudioContext();
    }
  }

  private playCue(cue: ToneCue, event: GameEvent): void {
    const context = this.context;
    if (context === null) {
      return;
    }

    const tone = toneForCue(cue, event);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.wave;
    oscillator.frequency.setValueAtTime(tone.frequency, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(tone.volume, context.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + tone.duration + 0.01);
  }
}

function toneForCue(cue: ToneCue, event: GameEvent): {
  frequency: number;
  duration: number;
  volume: number;
  wave: OscillatorType;
} {
  switch (cue) {
    case 'shot':
      return { frequency: 520, duration: 0.06, volume: 0.025, wave: 'square' };
    case 'invader-hit':
      return { frequency: 180, duration: 0.07, volume: 0.035, wave: 'sawtooth' };
    case 'player-hit':
      return { frequency: 70, duration: 0.22, volume: 0.055, wave: 'sawtooth' };
    case 'command-ship':
      return { frequency: 310, duration: 0.1, volume: 0.02, wave: 'triangle' };
    case 'pulse': {
      const pulseIndex = event.type === 'FORMATION_PULSE' ? event.pulseIndex : 0;
      return {
        frequency: [110, 124, 139, 147][pulseIndex] ?? 110,
        duration: 0.045,
        volume: 0.018,
        wave: 'square',
      };
    }
  }
}
