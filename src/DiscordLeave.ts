import { GuildMember } from "discord.js";
import { DiscordSoundBot } from "./DiscordSoundBot";
import { IFilePicker } from "./RandomFilePicker";

export class DiscordLeave {

    constructor(
        private readonly filePicker: IFilePicker,
        private readonly discordSoundBot: DiscordSoundBot,
        private minTimeBetweenSounds: number = 1,
    ) {
        discordSoundBot.on('player-leave', (member: GuildMember) => {
            const delaySoundBy = 0;
            setTimeout(async () => {
                this.greet();
            }, delaySoundBy);
        });
    }

    private lastSoundTime: number = 0;

    greet() {
        // don't play the sound too often - if several people leave at once, we don't want to spam the sound
        if (Date.now() - this.lastSoundTime < this.minTimeBetweenSounds * 1000) return;
        this.lastSoundTime = Date.now();
        
        this.filePicker.getFilepath().then(filepath => {
            if (!filepath) return;
            this.discordSoundBot.playSound(filepath);
        });
    }
}