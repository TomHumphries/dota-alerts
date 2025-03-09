import { GuildMember } from "discord.js";
import { DiscordSoundBot } from "./DiscordSoundBot";
import { IFilePicker } from "./RandomFilePicker";

export class DiscordWelcomer {

    constructor(
        private readonly filePicker: IFilePicker,
        private readonly discordSoundBot: DiscordSoundBot,
        private minTimeBetweenGreetings: number = 1,
    ) {
        discordSoundBot.on('player-join', (member: GuildMember) => {
            // delay the greeting because it takes a moment for a user's audio to be available
            const delayGreetingBy = 1500;
            setTimeout(async () => {
                this.greet();
            }, delayGreetingBy);
        });
    }

    private lastGreetingTime: number = 0;

    greet() {
        // don't greet too often - if several people join at once, we don't want to spam the sound
        if (Date.now() - this.lastGreetingTime < this.minTimeBetweenGreetings * 1000) return;
        this.lastGreetingTime = Date.now();
        
        this.filePicker.getFilepath().then(filepath => {
            if (!filepath) return;
            this.discordSoundBot.playSound(filepath);
        });
    }
}