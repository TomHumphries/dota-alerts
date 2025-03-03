
export interface GameStateObserver {
    update(gameState: any): void;
}

export class GameStateSubject {
    private observers: GameStateObserver[] = [];

    addObserver(observer: GameStateObserver): void {
        this.observers.push(observer);
    }

    removeObserver(observer: GameStateObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(gameState: any): void {
        this.observers.forEach(observer => observer.update(gameState));
    }
}
