# Indent-Rainbow
## A simple extension to make indentation more readable
-------------------

This extension colorises the indentation in front of your text alternating four different colors on each step. Some may find it helpfull in writing code for Nim or Python.

![Example](https://raw.githubusercontent.com/oderwat/vscode-indent-rainbow/master/assets/example.png)

It uses the current editor window tabsize and can handle mixed tab + spaces but that is not recommended. In addition it visibly marks lines where the indentation is not a multiple of the tabsize. This should help to find problems with indentation in some situations.

### Configuration

Although you can just use it as it is there is the possibility to configure some aspects of the extension:

```
  // For which languages indent-rainbow should be activated (if empty it means all).
  "indentRainbow.includedLanguages": [] // for example ["nim", "nims", "python"]

  // For which languages indent-rainbow should be deactivated (if empty it means none).
  "indentRainbow.excludedLanguages": [] // for example ["plaintext"]

  // The delay in ms until the editor gets updated.
  "indentRainbow.updateDelay": 100 // 10 makes it super fast but may cost more resources
```

*Notice: Defining both `includedLanguages` and `excludedLanguages` does not make much sense. Use one of both!*


The following is experimental and still buggy (do not use it :)

```
  // Automatically change indent setting (tabSize / insertSpaces) for a language.
  "indentRainbow.indentSetter": {} // do nothing as default

  // Example for language based indentation:
  "indentRainbow.indentSetter": {
    "nim": { "tabSize": 2, "insertSpaces": true },
    "nims": { "tabSize": 2, "insertSpaces": true },
    "python": { "tabSize": 4, "insertSpaces": true },
    "php": { "tabSize": 4, "insertSpaces": false }
  }

```

Build with:

```
npm install
npm run vscode:prepublish
```

Running `npm run compile` makes the compiler recompile on filechanges.

The current version is my "first try" on a VSCode extension. I am sure stuff could be more optimized :)
