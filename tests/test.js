import crypto from 'crypto';
import tempy from 'tempy';
import stickers from './stickers';
import { toGifFromFile, toWebpFromFile } from '../index.js';
import { readFromFile } from '../utils.js';

const formatMap = {
    gif: toGifFromFile,
    webp: toWebpFromFile,
};

for (const [file, { hashes }] of Object.entries(stickers)) {
    for (const [format, hash] of Object.entries(hashes)) {
        test(`check ${file} to ${format}`, async function () {
            const output = tempy.file();
            await formatMap[format](`./tests/stickers/${file}`, output);
            const outputFile = await readFromFile(output);
            const md5sum = crypto.createHash('md5');
            md5sum.update(outputFile);
            expect(md5sum.digest('hex')).toEqual(hash);
        });
    }
}
