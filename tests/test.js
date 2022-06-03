import { readdirSync } from 'fs';
import { join, basename } from 'path';
import tempy from 'tempy';
import { toGifFromFile, toWebpFromFile } from '../index.js';

const formatMap = {
    gif: toGifFromFile,
    webp: toWebpFromFile,
};

const stickerFiles = readdirSync(join('tests', 'stickers'));

for (const stickerFile of stickerFiles) {
    for (const [format, formatFunc] of Object.entries(formatMap)) {
        test(`check ${basename(stickerFile)} to ${format}`, async function () {
            await formatFunc(stickerFile, tempy.file());
        });
    }
}
