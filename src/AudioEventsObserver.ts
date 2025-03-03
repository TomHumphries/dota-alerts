import { Server } from 'ws';
import { AudioAlertTimer } from './AlertTimer';
import { GameStateObserver } from './GameStateSubject';

export class AudioEventsObserver implements GameStateObserver {
    constructor(
        private audioAlertConfigs: AudioAlertTimer[],
        private wss: Server,
        private baseUrl: string
    ) { }

    update(gameState: any): void {
        for (const alertConfig of this.audioAlertConfigs) {
            if (!gameState.map.clock_time) break;
            if (!alertConfig.timeReached(gameState.map.clock_time)) continue;
            console.log(`${alertConfig.name} event - ${alertConfig.secondsToPlayBefore} seconds before game time: ${gameState.map.clock_time + alertConfig.secondsToPlayBefore}`);
            this.wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    audioPath: `${this.baseUrl}/sounds/${alertConfig.audioFile}`
                }));
            });
        }
    }
}
