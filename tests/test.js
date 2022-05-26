import crypto from 'crypto';
import tempy from 'tempy';
import stickers from './stickers';
import { toGifFromFile, toWebpFromFile } from '../index.js';
import { readFromFile } from '../utils.js';

const formatMap = {
    gif: toGifFromFile,
    webp: toWebpFromFile,
};

const actualStickers = {};

for (const [file, { hashes, link }] of Object.entries(stickers)) {
    const actualSticker = actualStickers[file] = { link, hashes: {} };
    for (const [format, hash] of Object.entries(hashes)) {
        test(`check ${file} to ${format}`, async function () {
            const output = tempy.file();
            await formatMap[format](`./tests/stickers/${file}`, output);
            const outputFile = await readFromFile(output);
            const md5sum = crypto.createHash('md5');
            md5sum.update(outputFile);

            const actualHash = actualSticker.hashes[format] = md5sum.digest('hex');
            expect(actualHash).toEqual(hash);
        });
    }
}

afterAll(function () {
    console.log(JSON.stringify(actualStickers, null, 2));
});