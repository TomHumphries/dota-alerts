import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { ElevenLabsClient } from "elevenlabs";
import { MultiVoiceTTS } from './MultiVoiceTTS';

const args = process.argv.slice(2);
const count = parseInt(args[0], 10);

if (isNaN(count) ) {
    console.error('Usage: node BulkGeneration.js <count>');
    process.exit(1);
}

const ttsToGenerate = JSON.parse(fs.readFileSync(path.join(__dirname, '../../text-to-generate.json'), 'utf-8'));

const apiKey = process.env.ELEVENLABS_API_KEY;
const elevenLabsClient = new ElevenLabsClient({apiKey: apiKey});

async function run() {
    const generator = new MultiVoiceTTS(elevenLabsClient);
    for (const tts of ttsToGenerate) {
        const saveToDir = path.join(__dirname, '../../sounds', tts.folder);
        console.log(`TTS files will be saved to ${saveToDir}`);
        fs.mkdirSync(saveToDir, { recursive: true });
        await generator.generateMultipleTTSFiles(tts.text, tts.count, saveToDir)
    }
}

run()
    .then(() => console.log('TTS generation completed'))
    .catch(error => console.error('Error during TTS generation:', error));


