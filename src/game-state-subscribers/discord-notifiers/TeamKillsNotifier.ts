import { DiscordSoundBot } from "../../DiscordSoundBot";
import { GameStateObserver } from "../../GameStateSubject";
import { IFilePicker } from "../../RandomFilePicker";

export class TeamKillsNotifier implements GameStateObserver {
    
    private prevScore: number = 0;
    private recentTeamKills: number = 0;
    private resetRecentKillsAfterSeconds: number = 10;
    private resetTimer: NodeJS.Timeout | null = null;

    constructor(
        private readonly discordSoundBot: DiscordSoundBot,
        private readonly killSoundPickers: Map<number, IFilePicker>,
    ) {}

    update(state: any): void {
        const playerTeam = state?.player?.team_name;
        if (playerTeam === undefined) return;

        // work out the other team
        const teamScore = state?.map?.[`${playerTeam}_score`];
        if (teamScore === undefined) return;

        // work out how many team kills have occurred since the last update
        const newKills = teamScore - this.prevScore;
        this.prevScore = teamScore;
        if (newKills === 0) return;
        
        // there have been team kills since the last update
        // so we reset the cooldown timer on the recent team kills counter
        this.resetCooldownTimer();

        // increment the recent team kills
        this.recentTeamKills += newKills;
        this.recentTeamKills = teamScore;

        // play the sound for the number of team kills
        const filePicker = this.killSoundPickers.get(this.recentTeamKills);
        if (filePicker) {
            filePicker.getFilepath().then(filepath => {
                if (!filepath) return;
                this.discordSoundBot.playSound(filepath);
            })
        }
    }

    private resetCooldownTimer() {
        if (this.resetTimer) {
            clearTimeout(this.resetTimer);
        }
        this.resetTimer = setTimeout(() => {
            this.recentTeamKills = 0;
        }, 1000 * this.resetRecentKillsAfterSeconds);
    }
}