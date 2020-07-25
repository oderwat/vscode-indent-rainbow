// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let clearMe = false;
  let doIt = false;
  let currentLanguageId = null;
  let skipAllErrors = false;
  let timeout = null;

  const {
    colors,
    error_color,
    excludedLanguages,
    ignoredLanguages,
    ignoreLinePatterns,
    includedLanguages,
    tabmix_decoration_type,
    updateDelay,
    minLevel,
  } = getUserPreferences();

  const error_decoration_type = vscode.window.createTextEditorDecorationType({
    backgroundColor: error_color
  });

  const decorationTypes = getDecorationTypes(colors);

  let activeEditor = vscode.window.activeTextEditor;
  setupEditorListeners();

  if (activeEditor) {
    indentConfig();
  }

  if (activeEditor && checkLanguage()) {
    triggerUpdateDecorations();
  }

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }

    const regEx = /^[\t ]+/gm;
    const text = activeEditor.document.getText();
    const ignoredLines = [];

    if (!skipAllErrors) {
      /**
       * Checks text against ignore regex patterns from config(or default).
       * stores the line positions of those lines in the ignoreLines array.
       */

      let matches = matchesAny(text, ignoreLinePatterns);

      while (matches) {
        const pos = activeEditor.document.positionAt(matches.index);
        const line = activeEditor.document.lineAt(pos).lineNumber;
        ignoredLines.push(line);

        matches = matchesAny(text, ignoreLinePatterns);
      }
    }

    let error_decorator: vscode.DecorationOptions[] = [];
    let tabmix_decorator: vscode.DecorationOptions[] = tabmix_decoration_type ? [] :
      null;
    let decorators: vscode.DecorationOptions[][] = [];

    decorationTypes.forEach(() => {
      let decorator: vscode.DecorationOptions[] = [];
      decorators.push(decorator);
    });

    let match: RegExpExecArray = regEx.exec(text);
    while (match) {
      const pos = activeEditor.document.positionAt(match.index);
      const line = activeEditor.document.lineAt(pos);
      const skip = skipAllErrors || !!ignoredLines.find(n => n === line.lineNumber);
      const indentation = getIndentationLength(match);

      /**
       * Error handling.
       * When the indent spacing (as spaces) is not divisible by the tabsize,
       * consider the indent incorrect and mark it with the error decorator.
       * Checks for lines being ignored in ignoreLines array ( `skip` Boolran)
       * before considering the line an error.
       */
      if (!skip && indentation % activeEditor.options.tabSize !== 0) {
        const decoration = getErrorDecoration(activeEditor, match);
        error_decorator.push(decoration);
      } else {
        createDecorations(skip, match, tabmix_decorator, decorators, indentation);
      }

      match = regEx.exec(text);
    }

    decorationTypes.forEach((decorationType, index) => {
      activeEditor.setDecorations(decorationType, decorators[index]);
    });
    activeEditor.setDecorations(error_decoration_type, error_decorator);
    activeEditor.setDecorations(tabmix_decoration_type, tabmix_decorator);

    clearMe = true;
  }

  /**
   * This function could use some refactoring, it is doing a litle too much
   */
  function createDecorations(
    skip: boolean,
    match: RegExpExecArray,
    tabmix_decorator: vscode.DecorationOptions[],
    decorators: vscode.DecorationOptions[][],
    indentation: number,
  ) {
    var matchedText = match[0];
    var o = 0;
    var n = 0;
    while (n < matchedText.length) {
      var startPos = activeEditor.document.positionAt(match.index + n);
      n += matchedText[n] === '\t' ? 1 : activeEditor.options.tabSize;

      var endPos = activeEditor.document.positionAt(match.index + Math.min(indentation, n));

      if (startPos.character >= minLevel * activeEditor.options.tabSize) {
        const decoration = getDecoration(startPos, endPos);

        let spaceCount = 0;
        let tabCount = 0;

        if (!skip && tabmix_decorator) {
          // counting (split is said to be faster than match()
          // only do it if we don't already skip all errors
          tabCount = matchedText.split('\t').length - 1;
          if (tabCount) {
            // only do this if we already have some tabs
            spaceCount = matchedText.split(' ').length - 1;
          }
          // if we have (only) "spaces" in a "tab" indent file we
          // just ignore that, because we don't know if there
          // should really be tabs or spaces for indentation
          // If you (yes you!) know how to find this out without
          // infering this from the file, speak up :)
        }

        if (spaceCount > 0 && tabCount > 0) {
          tabmix_decorator.push(decoration);
        } else {
          let decorator_index = o % decorators.length;
          decorators[decorator_index].push(decoration);
        }

        o++;
      }
    }
  }

  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(updateDecorations, updateDelay);
  }

  function setupEditorListeners() {
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      if (editor) {
        indentConfig();
      }

      if (editor && checkLanguage()) {
        triggerUpdateDecorations();
      }
    },
      null,
      context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor) {
        indentConfig();
      }

      if (activeEditor &&
        event.document === activeEditor.document &&
        checkLanguage()) {
        triggerUpdateDecorations();
      }
    },
      null,
      context.subscriptions
    );
  }

  function isEmptyObject(obj) {

    return Object.getOwnPropertyNames(obj).length === 0;
  }

  function indentConfig() {
    skipAllErrors = false;

    if (ignoredLanguages.length !== 0) {
      if (
        ignoredLanguages.indexOf('*') !== -1 ||
        ignoredLanguages.indexOf(currentLanguageId) !== -1
      ) {
        skipAllErrors = true;
      }
    }
  }

  function checkLanguage() {
    if (activeEditor) {
      if (currentLanguageId !== activeEditor.document.languageId) {
        currentLanguageId = activeEditor.document.languageId;
        doIt = true;
        if (includedLanguages.length !== 0) {
          if (includedLanguages.indexOf(currentLanguageId) === -1) {
            doIt = false;
          }
        }

        if (doIt && excludedLanguages.length !== 0) {
          if (excludedLanguages.indexOf(currentLanguageId) !== -1) {
            doIt = false;
          }
        }
      }
    }

    if (clearMe && !doIt) {
      // Clear decorations when language switches away
      var decor: vscode.DecorationOptions[] = [];
      for (let decorationType of decorationTypes) {
        activeEditor.setDecorations(decorationType, decor);
      }
      clearMe = false;
    }

    indentConfig();

    return doIt;
  }

  function getIndentationLength(indentation: RegExpExecArray): number {
    return convertTabsToSpaces(indentation[0]).length;
  }

  const re = new RegExp('\t', 'g');
  const tabs = ' '.repeat(activeEditor.options.tabSize);
  function convertTabsToSpaces(str: string): string {
    return str.replace(re, tabs);
  }
}

const getDecoration = (start, end): vscode.DecorationOptions => ({
  range: new vscode.Range(start, end),
  hoverMessage: null,
});

function getErrorDecoration(activeEditor: vscode.TextEditor, match: RegExpExecArray) {
  let startPos = activeEditor.document.positionAt(match.index);
  let endPos = activeEditor.document.positionAt(
    match.index + match[0].length
  );
  const decoration = getDecoration(startPos, endPos);
  return decoration;
}

// If we want to make it so settings take effect more quickly (such as colors taking effect without the need of reloading the window)
// this can be called again instead of using the value from the first reading.
const getUserPreferences = () => {
  const config = vscode.workspace.getConfiguration('indentRainbow');

  /**
   * Error color gets shown when tabs aren't right,
   *  e.g. when you have your tabs set to 2 spaces but the indent is 3 spaces
   */
  const error_color = config.errorColor || 'rgba(128,32,32,0.3)';
  const updateDelay: number = config.updateDelay || 100;
  const minLevel: number = config.minLevel || 0;
  const ignoredLanguages: string[] = config.ignoreErrorLanguages || [];
  const includedLanguages = config.includedLanguages || [];
  const excludedLanguages = config.excludedLanguages || [];
  const tabmix_color = config.tabmixColor !== '' ? 'rgba(128,32,96,0.6)' : null;
  const tabmix_decoration_type = tabmix_color ? vscode.window.createTextEditorDecorationType({
    backgroundColor: tabmix_color
  }) : null;
  const ignoreLinePatterns: RegExp[] = (config.ignoreLinePatterns || [])
    .map(stringToRegex)
    .filter((r: RegExp | null) => !!r);
  // Colors will cycle through, and can be any size that you want
  const colors: string[] = config.colors || [
    'rgba(255,255,64,0.07)',
    'rgba(127,255,127,0.07)',
    'rgba(255,127,255,0.07)',
    'rgba(79,236,236,0.07)',
  ];

  return {
    colors,
    error_color,
    excludedLanguages,
    ignoredLanguages,
    ignoreLinePatterns,
    includedLanguages,
    tabmix_decoration_type,
    updateDelay,
    minLevel,
  };
};

/**
 * Create a decorator types that we use to decorate indent levels
 */
const getDecorationTypes = (colors: string[]): vscode.TextEditorDecorationType[] => {
  // Loops through colors and creates decoration types for each one
  return colors.map((color) =>
    vscode.window.createTextEditorDecorationType({
      backgroundColor: color,
    })
  );
};

const matchesAny = (text: string, expressions: RegExp[]): RegExpExecArray => {
  for (const expression of expressions) {
    const match = expression.exec(text);
    if (match) {
      return match;
    }
  }
};

const stringToRegex = (ignorePattern): RegExp | null => {
  if (typeof ignorePattern === 'string') {
    //parse the string for a regex
    const regParts = ignorePattern.match(/^\/(.*?)\/([gim]*)$/);

    if (regParts) {
      // the parsed pattern had delimiters and modifiers. handle them.
      return new RegExp(regParts[1], regParts[2]);
    } else {
      // we got pattern string without delimiters
      return new RegExp(ignorePattern);
    }
  }

  return null;
};