// Sometimes, empty folders were used to specify data about the files in a directory
// This script generates a list of those empty folders

const _ = require('lodash');
const fs = require('fs');
const { spawn } = require('child_process');

if (process.argv.length !== 4) {
    console.log('Usage: node FindEmptyFolders.js [olderBackupBasePath] [empty_folders.json]');
    process.exit(0);
    return;
}

const olderBackupBasePath = process.argv[2];
const outputPath = process.argv[3];



const isEmptyLine = (line) => {
    return (/^\s*?$/).test(line);
};



const child = spawn('find', [
    olderBackupBasePath,
    '-depth',
    '-type',
    'd',
    '-empty',
]);

child.stdout.setEncoding('utf8');

let streamData = '';

child.stdout.on('data', (data) => {
    streamData += data.toString();
});

child.on('exit', () => {
    // Remove all empty lines
    const lines = _.compact(_.reject(streamData.split(/\r?\n/), isEmptyLine));
    fs.writeFile(outputPath, JSON.stringify(lines, null, '    '), (e) => {
        console.log('Failed to write output file.');
        console.log(e);
    });
});
