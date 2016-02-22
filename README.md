# Indent-Rainbow
## A simple extension to make indentation more readable
-------------------

This extension colorises the indentation in front of your text alternating four different colors on each step. Some may find it helpfull in writing code for Nim or Python.

![Example](https://raw.githubusercontent.com/oderwat/vscode-indent-rainbow/master/assets/example.png)

It uses the current editor window tabsize and can handle mixed tab + spaces but that is not recommended. In addition it visibly marks lines where the indentation is not a multiple of the tabsize. This should help to find problems with indentation in some situations.

Build with:

```
npm install
npm run vscode:prepublish
```

Running `npm run compile` makes the compiler recompile on filechanges.

The current version is my "first try" on a VSCode extension. I am sure stuff could be more optimized :)
