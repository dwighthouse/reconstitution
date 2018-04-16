// Sometimes, empty folders were used to specify data about the files in a directory
// This script generates a list of those empty folders

const _ = require('lodash');
const fs = require('fs');
const { spawn } = require('child_process');

if (process.argv.length !== 3) {
    console.log('Usage: node FindEmptyFolders.js [olderBackupBasePath] > [empty_folders.json]');
    process.exit(0);
    return;
}

const olderBackupBasePath = process.argv[2];



const isEmptyLine = (line) => {
    return (/^\s*?$/).test(line);
};



const command = spawn('find', [
    olderBackupBasePath,
    '-depth',
    '-type',
    'd',
    '-empty',
]);

command.stdout.setEncoding('utf8');

command.stdout.on('data', (data) => {
    // Remove all empty lines
    const lines = _.compact(_.reject(data.split(/\r?\n/), isEmptyLine));
    console.log(JSON.stringify(lines, null, '    '));
});

command.stderr.on('data', (data) => {
    console.log(`Something didn't work: ${data}`);
});
