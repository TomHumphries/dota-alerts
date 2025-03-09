import { Server } from 'ws';
import { GameStateObserver } from '../GameStateSubject';

export class ClockObserver implements GameStateObserver {
    constructor(
        private wss: Server,
    ) { }

    update(gameState: any): void {
        if (!gameState.map || !gameState.map.clock_time) return;
        
        this.wss.clients.forEach(client => {
            client.send(JSON.stringify({
                time: gameState.map.clock_time
            }));
        });
    }
}
