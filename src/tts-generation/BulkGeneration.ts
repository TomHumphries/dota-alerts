import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { ElevenLabsClient, play } from "elevenlabs";

const apiKey = process.env.ELEVENLABS_API_KEY;
console.log(`ElevenLabs API key: ${apiKey}`);
// const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
const client = new ElevenLabsClient({apiKey: apiKey});

interface TTSOptions {
    text: string;
    voice: string;
    intonation: string;
    variance: number;
}

async function generateTTS(options: TTSOptions): Promise<void> {
    try {
        const audio = await client.textToSpeech.convert(options.voice, {
            text: options.text,
            output_format: 'mp3_44100_128',
            model_id: 'eleven_multilingual_v2',
        })

        const audioPath = path.join(__dirname, `audio_${options.voice}_${options.intonation}_${options.variance}.mp3`);
        const writeStream = fs.createWriteStream(audioPath);
        audio.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(true));
            writeStream.on('error', reject);
        });

        console.log(`Generated TTS with intonation ${options.intonation} and variance ${options.variance}: ${audioPath}`);
    } catch (error) {
        console.error(`Error generating TTS with intonation ${options.intonation} and variance ${options.variance}:`, error);
    }
}

async function generateMultipleTTS(text: string, voices: string[], intonations: string[], variances: number[]): Promise<void> {
    for (const voice of voices) {
        for (const intonation of intonations) {
            for (const variance of variances) {
                await generateTTS({ text, voice, intonation, variance });
            }
        }
    }
}

const text = 'The first move is what sets everything in motion';
const voices = ['en_us_male', 'en_us_female'];
const intonations = ['neutral', 'happy', 'sad'];
const variances = [1, 2, 3];

generateTTS({ text, voice: 'JBFqnCBsd6RMkjVDRZzb', intonation: 'neutral', variance: 1 }).catch(err => console.error(err));
// generateMultipleTTS(text, voices, intonations, variances);