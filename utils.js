import fs from 'fs';
import puppeteer from 'puppeteer';

export const createBrowsers = function (count) {
    const promises = [];
    for (let i = count - 1; i >= 0; --i) {
        promises[i] = puppeteer.launch({
            executablePath: process.env['CHROMIUM_PATH'],
            args: JSON.parse(process.env['USE_SANDBOX'] || 'true') ? undefined : ['--no-sandbox'],
        });
    }
    return Promise.all(promises);
};

export const writeToFile = function (data, filePath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const readFromFile = function (filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

export const streamToString = function (stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
};
