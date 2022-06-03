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
    describe(basename(stickerFile), function () {
        for (const [format, formatFunc] of Object.entries(formatMap)) {
            test(format, async function () {
                await formatFunc(stickerFile, tempy.file());
            });
        }
    });
}
