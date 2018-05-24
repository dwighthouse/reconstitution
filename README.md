# reconstitution
Tools and information for merging large numbers of file backups

## gitconfig

**BEFORE** running any large git diff commands, create or modify `~/.gitconfig` to contain:
```
[core]
    precomposeunicode = true
    quotePath = false
[diff]
    renameLimit = 999999
```


**When running diffs, be sure to put the older version as DIR1 and the newer version as DIR2**

Run the git diff algorithm on two arbitrary directories and output the resulting info to an outfile
```
git diff --no-index --name-status DIR1 DIR2 > out.txt
```

Run a general diff, ignoring .DS_Store, on two arbitrary directories
* This will also error on bad symlinks and the like, but we don't care about these
* This is more for verifying that two backups are identical or not
```
diff -x '.DS_Store' -x '._*' -rq DIR1 DIR2
```

Find all instances of empty folders, since sometimes I would use empty folder names to explain things instead of files, but git doesn't pay attention to folders directly
```
find DIR -depth -type d -empty
```

Do a restartable folder transfer of the `dir1` directory into `dir2`
```
rsync -vah --progress dir1/ dir2
```
