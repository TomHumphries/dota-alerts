import { AudioAlertTimer } from './AlertTimer';
import { GameStateObserver } from './GameStateSubject';
import { DiscordSoundBot } from './DiscordSoundBot';
import path from 'path';

export class DiscordSoundAlertHandler implements GameStateObserver {
    constructor(
        private audioAlertConfigs: AudioAlertTimer[],
        private discordSoundBot: DiscordSoundBot,
        private soundsDirectory: string,
    ) { }

    update(gameState: any): void {
        for (const alertConfig of this.audioAlertConfigs) {
            if (!gameState.map || !gameState.map.clock_time) break;
            if (!alertConfig.timeReached(gameState.map.clock_time)) continue;
            console.log(`${alertConfig.name} event - ${alertConfig.secondsToPlayBefore} seconds before game time: ${gameState.map.clock_time + alertConfig.secondsToPlayBefore}`);

            const soundFilepath = path.join(this.soundsDirectory, alertConfig.audioFile);
            this.discordSoundBot.playSound(soundFilepath);
        }
    }
}
