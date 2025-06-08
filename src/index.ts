import WebSocket from 'ws';
import express, { json } from 'express';

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { GameStateSubject } from './GameStateSubject';
import { RecurringAudioAlert } from './recurring-audio/RecurringAudioAlert';
import { ClockObserver } from './game-state-subscribers/ClockObserver';
import { DiscordSoundBot } from './DiscordSoundBot';
import { DiscordRecurringAudioHandler } from './game-state-subscribers/discord-notifiers/DiscordRecurringAudioNotifier';
import { ConsoleObserver } from './game-state-subscribers/ConsoleObserver';
import { PauseDiscordObserver } from './game-state-subscribers/discord-notifiers/PauseDiscordNotifier';
import { SingleFilePicker, RandomFilePicker, IFilePicker } from './RandomFilePicker';
import { WardStockDiscordObserver } from './game-state-subscribers/discord-notifiers/WardStockDiscordNotifier';
import { TeamDeathsNotifier } from './game-state-subscribers/discord-notifiers/TeamDeathsNotifier';
import { TeamKillsNotifier } from './game-state-subscribers/discord-notifiers/TeamKillsNotifier';
import { DiscordWelcomer } from './DiscordWelcomer';
import { DiscordLeave } from './DiscordLeave';

function loadAlertTimersWithMultipleAudio(): RecurringAudioAlert[] {
    const alertConfigFilepath = path.join(__dirname, '../alerts.json');
    const alertConfigsJson: IRandRecurringEvent[] = JSON.parse(fs.readFileSync(alertConfigFilepath, 'utf8'));
    const alertConfigs: RecurringAudioAlert[] = [];
    for (const randAlertConfigJson of alertConfigsJson) {
        const directoryOfAudioFilesForNotification = path.join(__dirname, '../sounds', randAlertConfigJson.audioFiles);
        const randomFilePicker: IFilePicker = new RandomFilePicker(directoryOfAudioFilesForNotification);

        const recurringAudioAlert = new RecurringAudioAlert(
            randAlertConfigJson,
            randomFilePicker,
        )

        alertConfigs.push(recurringAudioAlert);
    }
    return alertConfigs;
}

// Create the express app and the WebSocket server
const app = express();
const port = process.env.PORT || 8080;
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
        const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
        const GUILD_ID = process.env.GUILD_ID;
        const CHANNEL_ID = process.env.CHANNEL_ID;
        if (!DISCORD_TOKEN || !GUILD_ID || !CHANNEL_ID) {
            throw new Error('Missing DISCORD_TOKEN, GUILD_ID, or CHANNEL_ID in environment variables');
        }

        // create the discord bot
        discordSoundBot = new DiscordSoundBot(DISCORD_TOKEN, GUILD_ID, CHANNEL_ID);

        // listen for player joins and play the hello sound
        const discordWelcomer = new DiscordWelcomer(new RandomFilePicker(path.join(__dirname, '../sounds/player-join')), discordSoundBot);
        const discordGoodbye = new DiscordLeave(new RandomFilePicker(path.join(__dirname, '../sounds/player-leave')), discordSoundBot);
        
        const randomisedAudioAlertTimers = loadAlertTimersWithMultipleAudio();
        gameStateSubject.addObserver(new DiscordRecurringAudioHandler(randomisedAudioAlertTimers, discordSoundBot));

        const pauseSoundPicker: IFilePicker = new RandomFilePicker(path.join(__dirname, '../sounds/pause'));
        const unpauseSoundPicker: IFilePicker = new RandomFilePicker(path.join(__dirname, '../sounds/unpause'));
        const pauseDiscordObserver = new PauseDiscordObserver(discordSoundBot, pauseSoundPicker, unpauseSoundPicker);
        gameStateSubject.addObserver(pauseDiscordObserver);

        gameStateSubject.addObserver(new WardStockDiscordObserver(discordSoundBot, new SingleFilePicker(path.join(__dirname, '../sounds/wards-in-stock'))));
        
        // Not the cleanest but maintains the separation of concerns for IFilePicker at the moment
        const teamDeathPickers = new Map([
            [1, new RandomFilePicker(path.join(__dirname, '../sounds/team-deaths-1'))],
            [2, new RandomFilePicker(path.join(__dirname, '../sounds/team-deaths-2'))],
            [3, new RandomFilePicker(path.join(__dirname, '../sounds/team-deaths-3'))],
            [4, new RandomFilePicker(path.join(__dirname, '../sounds/team-deaths-4'))],
            [5, new RandomFilePicker(path.join(__dirname, '../sounds/team-deaths-5'))],
        ])
        gameStateSubject.addObserver(new TeamDeathsNotifier(discordSoundBot, teamDeathPickers));

        // Not the cleanest but maintains the separation of concerns for IFilePicker at the moment
        const teamKillsPickers = new Map([
            [1, new RandomFilePicker(path.join(__dirname, '../sounds/team-kills-1'))],
            [2, new RandomFilePicker(path.join(__dirname, '../sounds/team-kills-2'))],
            [3, new RandomFilePicker(path.join(__dirname, '../sounds/team-kills-3'))],
            [4, new RandomFilePicker(path.join(__dirname, '../sounds/team-kills-4'))],
            [5, new RandomFilePicker(path.join(__dirname, '../sounds/team-kills-5'))],
        ])
        gameStateSubject.addObserver(new TeamKillsNotifier(discordSoundBot, teamKillsPickers));

        discordSoundBot.on('ready', () => {
            console.log('Discord bot is ready');
            // discordSoundBot?.playSound(path.join(soundsDir, 'bot-joined', 'hello.mp3'));
        });
    } catch (error: any) {
        console.error(error);
    }
}

initDiscordBot();

// mock game state timer for testing
// const gameState: any = {
//     map: {
//         paused: false, 
//         clock_time: 0,
//         radiant_score: 0,
//         dire_score: 0,
//     },
//     player: {
//         team_name: 'radiant',
//     }
// };
// setInterval(() => {
//     gameState.map.paused = !gameState.map.paused;
//     gameStateSubject.notify(gameState);
// }, 5000);
// setInterval(() => {
//     gameState.map.clock_time += 1;
//     gameStateSubject.notify(gameState);
// }, 100);
// setInterval(() => {
//     gameState.map.dire_score += 1;
//     console.log('Dire score:', gameState.map.dire_score);
//     gameStateSubject.notify(gameState);
// }, 1000);


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
