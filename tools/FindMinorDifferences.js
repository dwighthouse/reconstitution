// Used to detect if two backups are basically copies of each other (the fewer changes, the better)
// Other scripts are used for finding diffs of non-identical copies

const _ = require('lodash');
const fs = require('fs');
const parseError = require('./parseError');
const { spawn } = require('child_process');

if (process.argv.length !== 5) {
    console.log('Usage: node FindMinorFolders.js [backupBasePath1] [backupBasePath2] [similar_backup_differences.json]');
    process.exit(0);
    return;
}

const backupBasePath1 = process.argv[2];
const backupBasePath2 = process.argv[3];
const outputPath = process.argv[4];



const isEmptyLine = (line) => {
    return (/^\s*?$/).test(line);
};



const child = spawn('diff', [
    '-x',
    '.DS_Store',
    '-x',
    '._*',
    '-rq',
    backupBasePath1,
    backupBasePath2,
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
    // Remove all empty lines
    const lines = _.compact(_.reject(streamData.split(/\r?\n/), isEmptyLine));
    fs.writeFile(outputPath, JSON.stringify(lines, null, '    '), (e) => {
        if (e) {
            throw e;
        }
        console.log('Done.');
    });
});
