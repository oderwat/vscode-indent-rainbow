# Indent-Rainbow

## A simple extension to make indentation more readable
-------------------

This extension colorizes the indentation in front of your text alternating four different colors on each step. Some may find it helpful in writing code for Nim or Python.

![Example](https://raw.githubusercontent.com/oderwat/vscode-indent-rainbow/master/assets/example.png)

Get it here: [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)

It uses the current editor window tab size and can handle mixed tab + spaces but that is not recommended. In addition it visibly marks lines where the indentation is not a multiple of the tab size. This should help to find problems with indentation in some situations.

### Configuration

Although you can just use it as it is there is the possibility to configure some aspects of the extension:

```js
  // For which languages indent-rainbow should be activated (if empty it means all).
  "indentRainbow.includedLanguages": [] // for example ["nim", "nims", "python"]

  // For which languages indent-rainbow should be deactivated (if empty it means none).
  "indentRainbow.excludedLanguages": [] // for example ["plaintext"]

  // The delay in ms until the editor gets updated.
  "indentRainbow.updateDelay": 100 // 10 makes it super fast but may cost more resources
```

*Notice: Defining both `includedLanguages` and `excludedLanguages` does not make much sense. Use one of both!*

You can configure your own colors by adding and tampering with the following code:

```js
  // Defining custom colors instead of default "Rainbow" for dark backgrounds.
  // (Sorry: Changing them needs an editor restart for now!)
  "indentRainbow.colors": [
    "rgba(64,64,16,0.3)",
    "rgba(32,64,32,0.3)",
    "rgba(64,32,64,0.3)",
    "rgba(16,48,48,0.3)",
    "rgba(128,32,32,0.3)"
  ]

  // The indent color if the number of spaces is not a multiple of "tabSize".
  "indentRainbow.errorColor": "rgba(128,32,32,0.3)"
```

> Notice: `errorColor` was renamed from `error_color` in earlier versions.

Skip error highlighting for RegEx patterns. For example, you may want to turn off the indent errors for JSDoc's valid additional space (disabled by default), or comment lines beginning with `//`

```js
  // Example of regular expression in JSON (note double backslash to escape characters)
  "indentRainbow.ignoreLinePatterns" : [
    "/.*\\*.*/mg", // lines begining wit *
    "/.*\\/\\/.*/g" // lines begininning with //
  ]
```

Skip error highlighting for some or all languages. For example, you may want to turn off the indent errors for `markdown` and `plaintext`. Default is `plaintext`.

```js
  "indentRainbow.ignoreErrorLanguages" : [
    "markdown", "plaintext"
  ]
```

The following is experimental and still buggy. It will basically disable the automatic detection for languages which are not defined in this array. You may not want to use it at all :)

```js
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

Running `npm run compile` makes the compiler recompile on file change.

The current version is my "first try" on a VSCode extension. I am sure stuff could be more optimized :)

If you like this plugin, please consider a small donation!

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://paypal.me/oderwat)
