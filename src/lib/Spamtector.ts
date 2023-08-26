import { writable } from "svelte/store";

export default class Spamtector {
  private _isSpamming = false;
  public isSpamming$ = writable(this._isSpamming);
  private lastTimePressed?: number;
  private avgInterval?: number;
  private lastTimeUnderMaxInterval?: number;
  public maxInterval: number = 100;
  public maxInterva2: number = 150;

  get minSpamDuration() {
    return this.maxInterval * 8;
  }

  set isSpamming(value: boolean) {
    this._isSpamming = value;
    this.isSpamming$.set(value);
  }

  get isSpamming() {
    return this._isSpamming;
  }

  public update() {
    const now = performance.now();
    if (!this.isSpamming && this.lastTimeUnderMaxInterval && now - this.lastTimeUnderMaxInterval > this.minSpamDuration) {
      this.isSpamming = true;
    } else if (this.isSpamming && this.lastTimePressed && now - this.lastTimePressed > this.minSpamDuration) {
      this.lastTimeUnderMaxInterval = undefined;
      this.isSpamming = false;
    }
  }

  public press() {
    const now = performance.now();
    if (this.lastTimePressed) {
      const elapsed = now - this.lastTimePressed;
      this.avgInterval = this.avgInterval ? (this.avgInterval! + elapsed) / 2.0 : elapsed;
      console.log(this.avgInterval);
      if (!this.lastTimeUnderMaxInterval && this.avgInterval < this.maxInterval) {
        this.lastTimeUnderMaxInterval = now;
      } else if (this.lastTimeUnderMaxInterval && this.avgInterval >= this.maxInterva2) {
        this.lastTimeUnderMaxInterval = undefined;
        this.isSpamming = false;
      }
    }
    this.lastTimePressed = performance.now();
  }
}