import { DiscordSoundBot } from "../../DiscordSoundBot";
import { GameStateObserver } from "../../GameStateSubject";
import { IFilePicker } from "../../RandomFilePicker";

export class WardStockDiscordObserver implements GameStateObserver {
    constructor(
        private discordSoundBot: DiscordSoundBot,
        private audioFilePicker: IFilePicker,
    ) { }

    private notified: boolean = false;

    update(gameState: { map?: { ward_purchase_cooldown?: number } }): void {
        if (gameState?.map?.ward_purchase_cooldown === undefined) return;

        const ward_purchase_cooldown = gameState.map.ward_purchase_cooldown;

        // reset notification if wards are not available
        if (ward_purchase_cooldown > 0) {
            this.notified = false;
            return;
        }

        // already notified that wards are available
        if (ward_purchase_cooldown === 0 && this.notified) {
            return;
        }

        // wards are available and we haven't notified yet
        if (ward_purchase_cooldown === 0 && !this.notified) {
            this.notified = true;
            this.audioFilePicker.getFilepath().then(filepath => {
                if (!filepath) return;
                this.discordSoundBot.playSound(filepath);
            })
        }
    }
}