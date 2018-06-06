// Uses the copy instructions to build the folder hierarchy and then copy the changed files

const _ = require('lodash');
const fs = require('fs');
const { spawn } = require('child_process');

if (process.argv.length !== 3) {
    console.log('Usage: node CopyOriginals.js [commands.json]');
    process.exit(0);
    return;
}

const commandsFilePath = process.argv[2];



let commandIndex = 0;
let commandList = [];

const doCommand = () => {
    const op = commandList[commandIndex][0];
    const params = _.map(commandList[commandIndex][1], (param) => {
        // Handle the really weird case of resource fork icon files
        if ((/Icon\^M$/).test(param)) {
            return `${param.replace(/Icon\^M$/, 'Icon\r')}`
        }
        if (_.isString(param)) {
            return param.replace(/\\"/g, '"'); // Ensure the Unix commands never encounter a slash-quote
        }
        return param;
    });

    const child = spawn(op, params);

    child.stderr.on('data', (data) => {
        console.log(`Something didn't work: ${data}`);
    });

    child.on('exit', (code) => {
        commandIndex += 1;

        if (commandIndex < commandList.length) {
            setTimeout(() => {
                doCommand();
            }, 1);
        }
    });
};

fs.readFile(commandsFilePath, { encoding: 'utf8' }, (e, data) => {
    if (e) {
        console.log('Error reading file. Did you give an invalid path or a directory?');
        console.log(e);
        process.exit(0);
        return;
    }

    commandList = JSON.parse(data);

    if (commandList.length !== 0) {
        doCommand();
    }
});
