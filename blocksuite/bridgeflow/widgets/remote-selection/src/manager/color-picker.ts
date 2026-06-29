class RandomPicker<T> {
  private _copyArray: T[];

  private readonly _originalArray: T[];

  constructor(array: T[]) {
    this._originalArray = [...array];
    this._copyArray = [...array];
  }

  private randomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }

  pick(): T {
    if (this._copyArray.length === 0) {
      this._copyArray = [...this._originalArray];
    }

    const index = this.randomIndex(this._copyArray.length);
    const item = this._copyArray[index];
    this._copyArray.splice(index, 1);
    return item;
  }
}

export const multiPlayersColor = new RandomPicker([
  'var(--bridgeflow-multi-players-purple)',
  'var(--bridgeflow-multi-players-magenta)',
  'var(--bridgeflow-multi-players-red)',
  'var(--bridgeflow-multi-players-orange)',
  'var(--bridgeflow-multi-players-green)',
  'var(--bridgeflow-multi-players-blue)',
  'var(--bridgeflow-multi-players-brown)',
  'var(--bridgeflow-multi-players-grey)',
]);
