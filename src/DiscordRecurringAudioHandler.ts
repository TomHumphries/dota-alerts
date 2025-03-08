import { RecurringAudioAlert } from './recurring-audio/RecurringAudioAlert';
import { GameStateObserver } from './GameStateSubject';
import { DiscordSoundBot } from './DiscordSoundBot';

export class DiscordRecurringAudioHandler implements GameStateObserver {
    constructor(
        private recurringAudioAlerts: RecurringAudioAlert[],
        private discordSoundBot: DiscordSoundBot,
    ) { }

    update(gameState: any): void {
        for (const recurringAudioAlert of this.recurringAudioAlerts) {
            if (!gameState.map || !gameState.map.clock_time) break;
            if (!recurringAudioAlert.timeReached(gameState.map.clock_time)) continue;

            console.log(`[DiscordRecurringAudioHandler] ${recurringAudioAlert.name} event - ${recurringAudioAlert.secondsToPlayBefore} seconds before game time: ${gameState.map.clock_time + recurringAudioAlert.secondsToPlayBefore}`);

            recurringAudioAlert.filePicker.getFilepath().then(soundFilepath => {
                if (!soundFilepath) return;
                this.discordSoundBot.playSound(soundFilepath);
            });
        }
    }
}
