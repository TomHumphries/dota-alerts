
export class AudioAlertTimer {
    constructor(
        public readonly name: string,
        public readonly interval: number,
        public readonly secondsToPlayBefore: number,
        public readonly audioFile: string
    ) { }

    timeReached(time: number): boolean {
        return time % this.interval === (this.interval - this.secondsToPlayBefore) % this.interval;
    }
}
