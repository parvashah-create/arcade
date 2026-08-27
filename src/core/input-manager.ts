import { Component } from 'obsidian';
import type { InputSnapshot } from './game';

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
    if (!this.enabled || event.isComposing || hasCommandModifier(event) || !isGameKey(event.key)) {
      return;
    }

    event.preventDefault();
    this.callbacks.onUserGesture();

    switch (event.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        this.leftHeld = true;
        return;
      case 'arrowright':
      case 'd':
        this.rightHeld = true;
        return;
      case ' ':
        if (!event.repeat) {
          this.firePressed = true;
        }
        return;
      case 'p':
        if (!event.repeat) {
          this.pausePressed = true;
          this.callbacks.onPauseToggle();
        }
        return;
      case 'escape':
        if (!event.repeat) {
          this.backPressed = true;
          this.callbacks.onMenuToggle();
        }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!this.enabled || !isGameKey(event.key)) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'arrowleft':
      case 'a':
        this.leftHeld = false;
        return;
      case 'arrowright':
      case 'd':
        this.rightHeld = false;
    }
  }
}

function hasCommandModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey;
}

function isGameKey(key: string): boolean {
  return ['arrowleft', 'arrowright', 'a', 'A', 'd', 'D', ' ', 'p', 'P', 'escape', 'Escape'].includes(key);
}
