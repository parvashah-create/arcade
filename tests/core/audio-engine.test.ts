import { describe, expect, it } from 'vitest';
import { cueForEvent } from '../../src/core/audio-engine';

describe('cueForEvent', () => {
  it('maps simulation events to generated sound cues', () => {
    expect(cueForEvent({ type: 'SHOT_FIRED' })).toBe('shot');
    expect(cueForEvent({ type: 'INVADER_DESTROYED', row: 2, points: 20 })).toBe('invader-hit');
    expect(cueForEvent({ type: 'PLAYER_HIT', livesRemaining: 2 })).toBe('player-hit');
    expect(cueForEvent({ type: 'COMMAND_SHIP_ENTERED' })).toBe('command-ship');
    expect(cueForEvent({ type: 'FORMATION_PULSE', pulseIndex: 3 })).toBe('pulse');
  });

  it('does not create sounds for state-only events', () => {
    expect(cueForEvent({ type: 'WAVE_CLEARED', wave: 2 })).toBeNull();
    expect(cueForEvent({ type: 'GAME_OVER', reason: 'NO_LIVES' })).toBeNull();
  });
});
