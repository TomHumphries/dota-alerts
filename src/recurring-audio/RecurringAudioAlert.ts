import { IFilePicker } from "../RandomFilePicker";

export class RecurringAudioAlert {
    
    public readonly name: string;
    public readonly interval: number;
    public readonly secondsToPlayBefore: number;
    public readonly notBefore: number = 0;
    
    constructor(
        settings: {name: string, interval: number, secondsToPlayBefore: number, audioFiles: string, notBefore?: number},
        public readonly filePicker: IFilePicker,
    ) {
        this.name = settings.name;
        this.interval = settings.interval;
        this.secondsToPlayBefore = settings.secondsToPlayBefore;
        this.notBefore = settings.notBefore ?? 0;
    }

    timeReached(time: number): boolean {
        if (this.notBefore > 0 && time < this.notBefore) return false;
        return time % this.interval === (this.interval - this.secondsToPlayBefore) % this.interval;
    }
}
