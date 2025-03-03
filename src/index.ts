import WebSocket from 'ws';
import express from 'express';
import path from 'path';
import fs from 'fs';

import { GameStateSubject } from './GameStateSubject';
import { AudioEventsObserver } from './AudioEventsObserver';
import { AudioAlertTimer } from './AlertTimer';
import { ClockObserver } from './ClockObserver';

// Load the alert configurations
const alertConfigFilepath = path.join(__dirname, '../alerts.json');
const alertConfigJson: IRecurringEvent[] = JSON.parse(fs.readFileSync(alertConfigFilepath, 'utf8'));
const alertConfigs: AudioAlertTimer[] = alertConfigJson.map(config => new AudioAlertTimer(config.name, config.interval, config.secondsToPlayBefore, config.audioFile));

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

// Observe changes in the game state for handling audio events
const intervalObserver = new AudioEventsObserver(alertConfigs, wss, baseUrl);
gameStateSubject.addObserver(intervalObserver);

// Observe changes in the game state for handling the game time (for the frontend)
const clockObserver = new ClockObserver(wss)
gameStateSubject.addObserver(clockObserver);


// mock game state timer for testing
const gameState = {map: {clock_time: 0}};
setInterval(() => {
    gameState.map.clock_time += 1;
    gameStateSubject.notify(gameState);
}, 50);


// Handle POST requests from the Dota 2 GSI
app.post("/dota-gsi", (req, res) => {
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

// Interface for the alert configurations
interface IRecurringEvent {
    name: string;
    interval: number;
    secondsToPlayBefore: number;
    audioFile: string;
}
