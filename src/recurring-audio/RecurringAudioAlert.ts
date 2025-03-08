import { IFilePicker } from "../RandomSoundPicker";

export class RecurringAudioAlert {
    constructor(
        public readonly name: string,
        public readonly interval: number,
        public readonly secondsToPlayBefore: number,
        public readonly filePicker: IFilePicker,
    ) { }

    timeReached(time: number): boolean {
        return time % this.interval === (this.interval - this.secondsToPlayBefore) % this.interval;
    }
}
