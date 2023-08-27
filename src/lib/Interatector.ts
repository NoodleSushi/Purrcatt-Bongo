import { writable } from "svelte/store";

export default class Interatector {
  private _interacted = false;
  public interacted$ = writable(this._interacted);
  public cooldown = 4000;
  private timeout?: number;

  set interacted(value: boolean) {
    this._interacted = value;
    this.interacted$.set(value);
  }

  get interacted() {
    return this._interacted;
  }

  public interact() {
    if (this.timeout)
      clearTimeout(this.timeout);
    if (!this.interacted)
      this.interacted = true;
    this.timeout = setTimeout(() => {
      this.interacted = false;
    }, this.cooldown)
  }
}