
export interface GameStateObserver {
    update(gameState: any): void;
}

export class GameStateSubject {
    private observers: GameStateObserver[] = [];

    private lastClockTime: number = -300;

    addObserver(observer: GameStateObserver): void {
        this.observers.push(observer);
    }

    removeObserver(observer: GameStateObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(gameState: any): void {
        if (gameState?.map?.clock_time === undefined) return;

        const timeDifference = gameState.map.clock_time - this.lastClockTime;

        if (timeDifference > -30 && timeDifference <= 0) {
            // If an event recently happened, we don't want to notify observers.
            // It's likely the same game-state update from multiple players. 
            return;
        }

        this.lastClockTime = gameState.map.clock_time;
        this.observers.forEach(observer => observer.update(gameState));
        return;
    }
}
