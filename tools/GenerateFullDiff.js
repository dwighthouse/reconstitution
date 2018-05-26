// Uses git to find the differences between an older backup folder and a newer backup folder
// Git can detect renames, unlike the standard Unix diff

const _ = require('lodash');
const fs = require('fs');
const parseError = require('./parseError');
const { spawn } = require('child_process');

if (process.argv.length !== 5) {
    console.log('Usage: node GenerateFullDiff.js [olderBackupBasePath] [newerBackupBasePath] [full_diff.txt]');
    process.exit(0);
    return;
}

const olderBackupBasePath = process.argv[2];
const newerBackupBasePath = process.argv[3];
const outputPath = process.argv[4];



const child = spawn('git', [
    'diff',
    '--no-index',
    '--name-status',
    olderBackupBasePath,
    newerBackupBasePath,
]);

child.stdout.setEncoding('utf8');

let streamData = '';

child.stdout.on('data', (data) => {
    streamData += data.toString();
});

child.stderr.on('data', (data) => {
    // Render potential issues to console
    console.log(parseError(data));
});

child.on('exit', () => {
    fs.writeFile(outputPath, streamData, (e) => {
        if (e) {
            throw e;
        }
        console.log('Done.');
    });
});
