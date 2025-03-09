import { DiscordSoundBot } from "../../DiscordSoundBot";
import { GameStateObserver } from "../../GameStateSubject";
import { IFilePicker } from "../../RandomFilePicker";

export class TeamDeathsNotifier implements GameStateObserver {
    
    private prevScore: number = 0;
    private recentTeamDeaths: number = 0;
    private resetRecentDeathsAfterSeconds: number = 10;
    private resetTimer: NodeJS.Timeout | null = null;

    constructor(
        private readonly discordSoundBot: DiscordSoundBot,
        private readonly deathSoundPickers: Map<number, IFilePicker>,
    ) {}

    update(state: any): void {
        const playerTeam = state?.player?.team_name;
        if (playerTeam === undefined) return;

        // work out the other team
        let otherTeam = playerTeam === 'dire' ? 'radiant' : 'dire';
        const otherTeamScore = state?.map?.[`${otherTeam}_score`];
        if (otherTeamScore === undefined) return;

        // work out how many team deaths have occurred since the last update
        const newKills = otherTeamScore - this.prevScore;
        this.prevScore = otherTeamScore;
        if (newKills === 0) return;
        
        // there have been team deaths since the last update
        // so we reset the cooldown timer on the recent team death counter
        this.resetCooldownTimer();

        // increment the recent team deaths
        this.recentTeamDeaths += newKills;
        this.recentTeamDeaths = otherTeamScore;

        const filePicker = this.deathSoundPickers.get(this.recentTeamDeaths);
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
            this.recentTeamDeaths = 0;
        }, 1000 * this.resetRecentDeathsAfterSeconds);
    }
}