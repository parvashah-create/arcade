import { Component } from 'obsidian';
import type { InputSnapshot } from './game';
import { toGameKey } from './input-key';

export interface InputManagerCallbacks {
  onPauseToggle(): void;
  onMenuToggle(): void;
  onUserGesture(): void;
}

export class InputManager extends Component {
  private readonly target: HTMLElement;
  private readonly callbacks: InputManagerCallbacks;
  private enabled = false;
  private leftHeld = false;
  private rightHeld = false;
  private firePressed = false;
  private pausePressed = false;
  private backPressed = false;

  public constructor(target: HTMLElement, callbacks: InputManagerCallbacks) {
    super();
    this.target = target;
    this.callbacks = callbacks;
  }

  public onload(): void {
    const ownerWindow = this.target.win;
    this.registerDomEvent(this.target, 'keydown', (event) => this.handleKeyDown(event));
    this.registerDomEvent(ownerWindow, 'keyup', (event) => this.handleKeyUp(event));
    this.registerDomEvent(ownerWindow, 'blur', () => this.clear());
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  public consumeSnapshot(): InputSnapshot {
    const snapshot: InputSnapshot = {
      leftHeld: this.leftHeld,
      rightHeld: this.rightHeld,
      firePressed: this.firePressed,
      pausePressed: this.pausePressed,
      backPressed: this.backPressed,
    };
    this.firePressed = false;
    this.pausePressed = false;
    this.backPressed = false;
    return snapshot;
  }

  public clear(): void {
    this.leftHeld = false;
    this.rightHeld = false;
    this.firePressed = false;
    this.pausePressed = false;
    this.backPressed = false;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = toGameKey(event.key);
    if (!this.enabled || event.isComposing || hasCommandModifier(event) || key === null) {
      return;
    }

    event.preventDefault();
    this.callbacks.onUserGesture();

    switch (key) {
      case 'left':
        this.leftHeld = true;
        return;
      case 'right':
        this.rightHeld = true;
        return;
      case 'fire':
        if (!event.repeat) {
          this.firePressed = true;
        }
        return;
      case 'pause':
        if (!event.repeat) {
          this.pausePressed = true;
          this.callbacks.onPauseToggle();
        }
        return;
      case 'menu':
        if (!event.repeat) {
          this.backPressed = true;
          this.callbacks.onMenuToggle();
        }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = toGameKey(event.key);
    if (!this.enabled || key === null) {
      return;
    }

    switch (key) {
      case 'left':
        this.leftHeld = false;
        return;
      case 'right':
        this.rightHeld = false;
        return;
      case 'fire':
      case 'pause':
      case 'menu':
        return;
    }
  }
}

function hasCommandModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey;
}
