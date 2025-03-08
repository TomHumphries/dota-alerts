import { DiscordSoundBot } from "../DiscordSoundBot";
import { GameStateObserver } from "../GameStateSubject";
import { IFilePicker } from "../RandomSoundPicker";

export class PauseDiscordObserver implements GameStateObserver {
    constructor(
        private discordSoundBot: DiscordSoundBot,
        private pauseFilePicker: IFilePicker,
        private unpauseFilePicker: IFilePicker,
    ) { }

    private paused: boolean = false;
    
    update(gameState: { map?: { paused?: boolean } }): void {
        if (gameState?.map?.paused === undefined) return;
        let newPaused = gameState.map.paused;
        if (newPaused === this.paused) return;

        this.paused = newPaused;
        if (this.paused) {
            console.log('Game is paused');
            this.pauseFilePicker.getFilepath().then(filepath => {
                if (!filepath) return;
                this.discordSoundBot.playSound(filepath);
            })
        } else {
            console.log('Game is unpaused');
            this.unpauseFilePicker.getFilepath().then(filepath => {
                if (!filepath) return;
                this.discordSoundBot.playSound(filepath);
            })
        }
    }
}