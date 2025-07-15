/**
 * The AnimationTracker singleton is used to register priority animations which we can
 * expose via the UIStore. This allows us to conditionally delay component rendering
 * until the animations have finished.
 */
class AnimationTracker {
  private pending: boolean[];
  private subscribers: any[];

  constructor() {
    this.pending = [];
    this.subscribers = [];
  }

  /**
   * Subscribe to the animation tracker state
   *
   * @param sub A subscriber callback to be invoked when state changes
   * @returns void
   */
  subscribe(sub: any) {
    if (this.subscribers.indexOf(sub) === -1) {
      this.subscribers.push(sub);
    }
    return () => {
      const index = this.subscribers.indexOf(sub);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notify() {
    const hasPending = this.pending.find(anim => anim === true) === true;
    this.subscribers.slice(0).forEach(sub => sub(hasPending));
  }

  private markAnimationComplete(index: number) {
    if (this.pending[index] !== false) {
      this.pending[index] = false;
      this.notify();
    }
  }

  /**
   * Register a new pending animation and receive a completion callback.
   *
   * @returns A callback function that marks the animation as complete
   */
  addPendingAnimation(): any {
    const index = this.pending.push(true) - 1;
    this.notify();
    return () => this.markAnimationComplete(index);
  }
}

const tracker = new AnimationTracker();

export default tracker;
