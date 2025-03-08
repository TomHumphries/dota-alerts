import fs from 'fs';
import path from 'path';

export interface IFilePicker {
    getFilepath(): Promise<string | null>;
}

export class SingleFilePicker implements IFilePicker {
    constructor(private readonly filepath: string) {}

    async getFilepath(): Promise<string | null> {
        return this.filepath;
    }
}

export class RandomFilePicker implements IFilePicker {
    constructor(
        private readonly directory: string,
        private pseudoRandom: boolean = true, // don't play the same sound twice if there is more than one
    ) {}

    private lastFilepath: string | null = null;

    async getFilepath(): Promise<string | null> {
        const files = await this.getFiles();
        if (files.length === 0) return null;

        const maxTries = 10;
        let tries = 0;
        let randomIndex = Math.floor(Math.random() * files.length);
        if (this.pseudoRandom && files.length > 1) {
            while (this.lastFilepath === files[randomIndex] && tries < maxTries) {
                randomIndex = Math.floor(Math.random() * files.length);
                tries++;
            }
        }
        this.lastFilepath = files[randomIndex];
        
        return path.join(this.directory, files[randomIndex]);
    }

    private async getFiles(): Promise<string[]> {
        const files = await fs.promises.readdir(this.directory);
        return files;
    }
}