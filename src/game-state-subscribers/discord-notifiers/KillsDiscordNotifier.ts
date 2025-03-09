import { DiscordSoundBot } from "../../DiscordSoundBot";
import { GameStateObserver } from "../../GameStateSubject";
import { IFilePicker } from "../../RandomFilePicker";

export class KillsDiscordNotifier implements GameStateObserver {
    
    private teamScore: number = 0;

    constructor(
        private readonly discordSoundBot: DiscordSoundBot,
        private filePicker: IFilePicker,
    ) {}

    update(state: any): void {
        const playerTeam = state?.player?.team_name;
        if (playerTeam === undefined) return;

        const teamScore = state?.map?.[`${playerTeam}_score`];
        if (teamScore === undefined) return;
        if (teamScore === this.teamScore) return;

        // we know there have been kills since the last update
        const newKills = teamScore - this.teamScore;
        this.teamScore = teamScore;
        this.filePicker.getFilepath().then(filepath => {
            if (!filepath) return;
            this.discordSoundBot.playSound(filepath);
        })
    }
}