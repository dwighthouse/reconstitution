// Using the classified file json information, creates a new json file that describes how to make a copy of the files changed or removed by the newer backup
// A destination folder into which the copies can be made is also required

const _ = require('lodash');
const fs = require('fs');

if (process.argv.length !== 6) {
    console.log('Usage: node BuildCopyCommands.js [classified_files.json] [backupBasePath] [copyBasePath] [commands.json]');
    process.exit(0);
    return;
}

const classifiedFilesPath = process.argv[2];

// '../Backup_1-16-08'
const backupBasePath = process.argv[3];

// '../changes'
const copyBasePath = process.argv[4];

// '../commands.json'
const outputPath = process.argv[5];



const getDirectoryName = (filePath) => {
    // Get all but the last part (this prevents the creation of folders for items that are actually just files with no extension)
    return filePath.split('/').slice(0, -1).join('/');
};



fs.readFile(classifiedFilesPath, { encoding: 'utf8' }, (e, data) => {
    if (e) {
        console.log('Error reading file. Did you give an invalid path or a directory?');
        console.log(e);
        process.exit(0);
        return;
    }

    const sets = _.pick(JSON.parse(data), ['modified', 'renamed_weird', 'renamed_different', 'deleted', 'other']);

    // Get single list of important file paths, sorted
    const filesToCopy = _.map(_.flatten(_.values(sets)), 1).sort();

    // Find unique paths necessary to copy those files
    const directoriesToMake = _.uniq(_.map(filesToCopy, getDirectoryName));

    const commands = [];

    _.each(directoriesToMake, (directory) => {
        commands.push(['mkdir', ['-p', directory.replace(backupBasePath, copyBasePath)]]);
    });

    _.each(filesToCopy, (filePath) => {
        commands.push(['cp', ['-pPR', filePath, getDirectoryName(filePath.replace(backupBasePath, copyBasePath))]]);
    });

    // Print out object to file
    fs.writeFile(outputPath, JSON.stringify(commands, null, '    '), (e) => {
        if (e) {
            throw e;
        }
        console.log('Done.');
    });
});
