# Indent-Rainbow

## A simple extension to make indentation more readable

If you use this plugin a lot, please consider a donation:

<a href="https://www.buymeacoffee.com/oderwat" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://paypal.me/oderwat)

---

This extension colorizes the indentation in front of your text, alternating four different colors on each step. Some may find it helpful in writing code for Python, Nim, Yaml, and probably even filetypes that are not indentation dependent.

Note: This will also work with vscode-web (github.dev) since version 8.0.0.

![Example](https://raw.githubusercontent.com/oderwat/vscode-indent-rainbow/master/assets/example.png)

Get it here: [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)

It uses the current editor window tab size and can handle mixed tab + spaces (not recommended). In addition, it visibly marks lines where the indentation is not a multiple of the tab size. The visualization can help to find problems with the indentation in some situations.

### Configuration

Although you can use it as it is, there is the possibility to configure some aspects of the extension:

```js
  // For which languages indent-rainbow should be activated (if empty it means all).
  "indentRainbow.includedLanguages": [] // for example ["nim", "nims", "python"]

  // For which languages indent-rainbow should be deactivated (if empty it means none).
  "indentRainbow.excludedLanguages": ["plaintext"]

  // The delay in ms until the editor gets updated.
  "indentRainbow.updateDelay": 100 // 10 makes it super fast but may cost more resources

  // Do not consider spaces after the last tab, or spaces without tabs, as part of the indent.
  // This can be useful when using only tabs for indenting and only spaces for alignment.
  "indentRainbow.ignoreAlignmentSpaces": true
```

*Notice: Defining both `includedLanguages` and `excludedLanguages` does not make much sense. Use one of both!*

You can configure your own colors by adding and tampering with the following code:

```js
  // Defining custom colors instead of default "Rainbow" for dark backgrounds.
  "indentRainbow.colors": [
    "rgba(255,255,64,0.07)",
    "rgba(127,255,127,0.07)",
    "rgba(255,127,255,0.07)",
    "rgba(79,236,236,0.07)"
  ]

  // The indent color if the number of spaces is not a multiple of "tabSize".
  "indentRainbow.errorColor": "rgba(128,32,32,0.6)"

  // The indent color when there is a mix between spaces and tabs.
  // To be disabled this coloring set this to an empty string.
  "indentRainbow.tabmixColor": "rgba(128,32,96,0.6)"
```

> Notice: `errorColor` was renamed from `error_color` in earlier versions.

### Light mode (new since v8.3.0)

There is a (new) alternate mode that uses lines (with a customizable width) instead of the background coloring of the whitespace. Here is an example configuration I like:

```js
  // Using the light mode
  "indentRainbow.indicatorStyle": "light",
  // we use a simple 1 pixel wide line
  "indentRainbow.lightIndicatorStyleLineWidth": 1,
  // the same colors as above but more visible
  "indentRainbow.colors": [
    "rgba(255,255,64,0.3)",
    "rgba(127,255,127,0.3)",
    "rgba(255,127,255,0.3)",
    "rgba(79,236,236,0.3)"]
```

> For this addition, a big thank you goes to Christian Hoock [wk1](https://github.com/wk1). He also added the editor window reload on config changes.

### Hiding error highlighting

Skip error highlighting for RegEx patterns. For example, you may want to turn off the indent errors for JSDoc's valid additional space (disabled by default), or comment lines beginning with `//`

```js
  // Example of regular expression in JSON (note double backslash to escape characters)
  "indentRainbow.ignoreLinePatterns" : [
    "/[ \t]* [*]/g", // lines begining with <whitespace><space>*
    "/[ \t]+[/]{2}/g" // lines begininning with <whitespace>//
  ]
```

Skip error highlighting for some or all languages. For example, you may want to turn off the indent errors for `markdown` and `haskell` (which is the default)

```js
  "indentRainbow.ignoreErrorLanguages" : [
    "markdown",
    "haskell"
  ]
```

If error color is disabled, indent colors will be rendered until the length of rendered characters (white spaces, tabs, and other ones) is divisible by tabsize. Turn on this option to render white spaces and tabs only.

```js
  "indentRainbow.colorOnWhiteSpaceOnly": true // false is the default
```

Build with:

```
npm install
npm run vscode:prepublish
```

Running `npm run compile` makes the compiler recompile on file change.
