// Uses git to find the differences between an older backup folder and a newer backup folder
// Git can detect renames, unlike the standard Unix diff

const _ = require('lodash');
const fs = require('fs');
const { spawn } = require('child_process');

if (process.argv.length !== 4) {
    console.log('Usage: node GenerateFullDiff.js [olderBackupBasePath] [newerBackupBasePath] > [full_diff.txt]');
    process.exit(0);
    return;
}

const olderBackupBasePath = process.argv[2];
const newerBackupBasePath = process.argv[3];



const command = spawn('git', [
    'diff',
    '--no-index',
    '--name-status',
    olderBackupBasePath,
    newerBackupBasePath,
]);

command.stdout.setEncoding('utf8');

command.stdout.on('data', (data) => {
    console.log(data);
});

command.stderr.on('data', (data) => {
    console.log(`Something didn't work: ${data}`);
});
