import { GameStateObserver } from './GameStateSubject';

export class ConsoleObserver implements GameStateObserver {
    constructor() { }

    update(gameState: any): void {
        console.log(JSON.stringify(gameState, null, 2));
        console.log('\r\n---------------------------------\r\n');
    }
}
