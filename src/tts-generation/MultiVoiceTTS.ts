import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { ElevenLabsClient, play } from 'elevenlabs';

export class MultiVoiceTTS {
    constructor(
        private elevenLabsClient: ElevenLabsClient,
    ) { }

    async generateMultipleTTSFiles(text: string, count: number, saveToDir: string): Promise<void> {
        const voicesResponse = await this.elevenLabsClient.voices.getAll();
        let voiceIds = voicesResponse.voices.map(voice => voice.voice_id);
        console.log(`${voiceIds.length.toLocaleString()} voices available`);

        voiceIds = this.randomiseOrder(voiceIds);

        for (let i = 0; i < voiceIds.length; i++) {
            if (i >= count) {
                console.log(`Run out of voices to generate TTS for`);
                break;
            }

            const voiceId = voiceIds[i];
            const audio = await this.generateTTSStream(voiceId, text);
            if (!audio) continue;

            await this.saveStreamToFile(audio, saveToDir, voiceId);

            const audioPath = path.join(saveToDir, `voice_${voiceId}.mp3`);
            const audioStream = fs.createReadStream(audioPath);
            play(audioStream).catch(error => console.error('Error playing audio:', error));
        }
    }

    private randomiseOrder(voiceIds: string[]): string[] {
        const arrayCopy = [...voiceIds];
        const randomisedArray: string[] = [];
        while (arrayCopy.length > 0) {
            const index = Math.floor(Math.random() * arrayCopy.length);
            randomisedArray.push(arrayCopy.splice(index, 1)[0]);
        }
        return randomisedArray;
    }

    private async generateTTSStream(voice: string, text: string) {
        try {
            return await this.elevenLabsClient.textToSpeech.convert(voice, {
                text: text,
                output_format: 'mp3_44100_128',
                model_id: 'eleven_multilingual_v2',
            });
        } catch (error) {
            console.error(`Error generating TTS:`, error);
            return null;
        }
    }

    private async saveStreamToFile(audio: Readable, saveToDir: string, voiceId: string): Promise<void> {

        const audioPath = path.join(saveToDir, `voice_${voiceId}.mp3`);
        const writeStream = fs.createWriteStream(audioPath);
        audio.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(true));
            writeStream.on('error', reject);
        });
    }
}
