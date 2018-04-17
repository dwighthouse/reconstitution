// Takes in the full diff between two backups and outputs JSON organized grouping of those paths and data

const _ = require('lodash');
const fs = require('fs');

if (process.argv.length !== 3) {
    console.log('Usage: node ClassifyFiles.js [full_diff.txt] > [classified_files.json]');
    process.exit(0);
    return;
}

const diffPath = process.argv[2];



const isEmptyLine = (line) => {
    return (/^\s*?$/).test(line);
};

const breakUpLine = (line) => {
    return _.map(line.split('\t'), (part) => {
        return part.replace(/^"(.+?)"$/, '$1')
            .replace(/\\"/g, '"') // Remove slash-quotes added by git
            .replace(/\/Icon\\r$/, '/Icon^M'); // Rename weird \r issue with ? which is the actual value of the filename
    });
};



const isDsStore = (item) => {
    // Return true if first referenced file is a .DS_Store file
    // This could happen if:
    // * Git thinks a .DS_Store file is similar to a non-.DS_Store file
    // * Git notices a move/copy of a .DS_Store to another .DS_Store file
    // * A .DS_Store file was added
    // * A .DS_Store file was deleted
    // * A .DS_Store file was modified
    return (/\/\.DS_Store"?$/).test(item[1]);

    // There may be cases where git thinks an old file has been renamed to .DS_Store
    // Since we would never do that, this type of change is important
};

const isAdded = (item) => {
    return (/^A/).test(item[0]);
};

const isRenamedWeird = (item) => {
    if (!(/^R100/).test(item[0]) || item.length !== 3) {
        return false;
    }

    return (/\.webloc$/).test(item[1]) || (/\.webloc$/).test(item[2]) || (/\/[^.]+"?$/).test(item[1]) || (/\/[^.]+"?$/).test(item[2]);
}

const isRenamedIdentical = (item) => {
    return (/^R100/).test(item[0]);
};

const isRenamedDifferent = (item) => {
    return (/^R\d+/).test(item[0]);
};

const isModified = (item) => {
    return (/^M/).test(item[0]);
};

const isDeleted = (item) => {
    return (/^D/).test(item[0]);
};

const typeIdentifier = (item) => {
    if (isDsStore(item)) {
        return 'DS_Store';
    }

    if (isAdded(item)) {
        return 'added';
    }

    if (isRenamedWeird(item)) {
        return 'renamed_weird';
    }

    if (isRenamedIdentical(item)) {
        return 'renamed_identical';
    }

    if (isRenamedDifferent(item)) {
        return 'renamed_different';
    }

    if (isModified(item)) {
        return 'modified';
    }

    if (isDeleted(item)) {
        return 'deleted';
    }

    return 'other';
};



fs.readFile(diffPath, { encoding: 'utf8' }, (e, data) => {
    if (e) {
        console.log('Error reading file. Did you give an invalid path or a directory?');
        console.log(e);
        process.exit(0);
        return;
    }

    // Remove all empty lines
    const lines = _.compact(_.reject(data.split(/\r?\n/), isEmptyLine));

    // Break up line into parts and remove quotes on parts
    const items = _.map(lines, breakUpLine);

    // Organize items into sets based on type
    let sets = _.groupBy(items, typeIdentifier);

    // Sort each set by first path part
    sets = _.mapValues(sets, (items) => {
        return _.sortBy(items, 1);
    });

    // Print out object
    // Use > out.txt to convert to file
    console.log(JSON.stringify(sets, null, '    '));
});
