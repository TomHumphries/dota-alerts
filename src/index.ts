import WebSocket from 'ws';
import express, { json } from 'express';
import path from 'path';
import fs from 'fs';

import { GameStateSubject } from './GameStateSubject';
import { RecurringAudioAlert } from './recurring-audio/RecurringAudioAlert';
import { ClockObserver } from './game-state-subscribers/ClockObserver';
import { DiscordSoundBot } from './DiscordSoundBot';
import { DiscordRecurringAudioHandler } from './game-state-subscribers/discord-notifiers/DiscordRecurringAudioNotifier';
import { ConsoleObserver } from './game-state-subscribers/ConsoleObserver';
import { PauseDiscordObserver } from './game-state-subscribers/discord-notifiers/PauseDiscordNotifier';
import { SingleFilePicker, RandomFilePicker, IFilePicker } from './RandomFilePicker';
import { WardStockDiscordObserver } from './game-state-subscribers/discord-notifiers/WardStockDiscordNotifier';
import { KillsDiscordNotifier } from './game-state-subscribers/discord-notifiers/KillsDiscordNotifier';
import { TeamDeathsNotifier } from './game-state-subscribers/discord-notifiers/TeamDeathsNotifier';

function loadAlertTimersWithMultipleAudio(): RecurringAudioAlert[] {
    const randomisedAlertConfigFilepath = path.join(__dirname, '../randomised-alerts.json');
    const randAlertConfigsJson: IRandRecurringEvent[] = JSON.parse(fs.readFileSync(randomisedAlertConfigFilepath, 'utf8'));
    const randAlertConfigs: RecurringAudioAlert[] = [];
    for (const randAlertConfigJson of randAlertConfigsJson) {
        const directoryOfAudioFilesForNotification = path.join(__dirname, '../sounds', randAlertConfigJson.audioFiles);
        const randomFilePicker: IFilePicker = new RandomFilePicker(directoryOfAudioFilesForNotification);

        const recurringAudioAlert = new RecurringAudioAlert(
            randAlertConfigJson,
            randomFilePicker,
        )

        randAlertConfigs.push(recurringAudioAlert);
    }
    return randAlertConfigs;
}

// Create the express app and the WebSocket server
const app = express();
const port = 8080;
const wss = new WebSocket.Server({ port: 8081 });

const baseUrl = `http://localhost:${port}`;

// Serve the audio files from the sounds directory
const soundsDir = path.join(__dirname, '../sounds');
console.log(`Serving sounds from ${soundsDir}`);
app.use('/sounds', express.static(soundsDir));

// Serve the public directory (the html frontend)
const publicDir = path.join(__dirname, '../public');
app.use('/', express.static(publicDir));

// Create the game state subject
const gameStateSubject: GameStateSubject = new GameStateSubject();

// Observe changes in the game state for handling the game time (for the frontend)
gameStateSubject.addObserver(new ClockObserver(wss));
// gameStateSubject.addObserver(new ConsoleObserver());

let discordSoundBot: DiscordSoundBot | null = null;
function initDiscordBot() {
    try {
        // load config for discord bot
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));
        
        discordSoundBot = new DiscordSoundBot(config.token, config.guildId, config.channelId);
        
        const randomisedAudioAlertTimers = loadAlertTimersWithMultipleAudio();
        gameStateSubject.addObserver(new DiscordRecurringAudioHandler(randomisedAudioAlertTimers, discordSoundBot));

        const pauseSoundPicker: IFilePicker = new RandomFilePicker(path.join(__dirname, '../sounds/pause'));
        const unpauseSoundPicker: IFilePicker = new RandomFilePicker(path.join(__dirname, '../sounds/unpause'));
        const pauseDiscordObserver = new PauseDiscordObserver(discordSoundBot, pauseSoundPicker, unpauseSoundPicker);
        gameStateSubject.addObserver(pauseDiscordObserver);

        gameStateSubject.addObserver(new WardStockDiscordObserver(discordSoundBot, new SingleFilePicker(path.join(__dirname, '../sounds/wards-available'))));
        gameStateSubject.addObserver(new KillsDiscordNotifier(discordSoundBot, new RandomFilePicker(path.join(__dirname, '../sounds/kills'))));
        
        // Not the cleanest but maintains the separation of concerns for IFilePicker at the moment
        const teamDeathPickers = new Map([
            [1, new RandomFilePicker(path.join(__dirname, '../sounds/1-team-deaths'))],
            [2, new RandomFilePicker(path.join(__dirname, '../sounds/2-team-deaths'))],
            [3, new RandomFilePicker(path.join(__dirname, '../sounds/3-team-deaths'))],
            [4, new RandomFilePicker(path.join(__dirname, '../sounds/4-team-deaths'))],
            [5, new RandomFilePicker(path.join(__dirname, '../sounds/5-team-deaths'))],
        ])
        gameStateSubject.addObserver(new TeamDeathsNotifier(discordSoundBot, teamDeathPickers));

        discordSoundBot.on('ready', () => {
            console.log('Discord bot is ready');
            discordSoundBot?.playSound(path.join(soundsDir, 'bot-joined', 'hello.mp3'));
        });
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.log("No config file. Not initialising Discord bot.");
        } else {
            console.error(error);
        }
    }    

}

initDiscordBot();

// mock game state timer for testing
const gameState: any = {
    map: {
        paused: false, 
        clock_time: 0,
        radiant_score: 0,
        dire_score: 0,
    },
    player: {
        team_name: 'radiant',
    }
};
// setInterval(() => {
//     gameState.map.paused = !gameState.map.paused;
//     gameStateSubject.notify(gameState);
// }, 5000);
// setInterval(() => {
//     gameState.map.clock_time += 1;
//     gameStateSubject.notify(gameState);
// }, 100);
setInterval(() => {
    gameState.map.dire_score += 1;
    console.log('Dire score:', gameState.map.dire_score);
    gameStateSubject.notify(gameState);
}, 1000);


// Handle POST requests from the Dota 2 GSI
app.post("/dota-gsi", json(), (req, res) => {
    gameStateSubject.notify(req.body);
    res.send({});
});

// Start the server
app.listen(port, () => {
    console.log(`HTTP server is running on ${baseUrl}`);
    console.log(`*** SOUNDS WILL NOT PLAY IN THE BROWSER UNTILL YOU INTERACT WITH PAGE ***`);
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Handle application shutdown
function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    discordSoundBot?.playSound(path.join(soundsDir, 'bot-leave', 'goodbye.mp3'));
    setTimeout(() => {
        discordSoundBot?.disconnect();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }, 2000);
};

process.on('SIGINT', () => {gracefulShutdown()});
process.on('SIGTERM', () => {gracefulShutdown()});

// Interface for the alert configurations
interface IRecurringEvent {
    name: string;
    interval: number;
    secondsToPlayBefore: number;
    audioFile: string;
    notBefore?: number;
}

interface IRandRecurringEvent {
    name: string;
    interval: number;
    secondsToPlayBefore: number;
    audioFiles: string;
    notBefore?: number;
}
