// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let clearMe = false;
  let doIt = false;
  let currentLanguageId = null;
  let skipAllErrors = false;

  let activeEditor = vscode.window.activeTextEditor;

  const {
    colors,
    ignoreLinePatterns,
    ignoredLanguages,
    tabmix_color,
    error_color,
  } = getUserPreferences();

  const error_decoration_type = vscode.window.createTextEditorDecorationType({ backgroundColor: error_color });
  const tabmix_decoration_type = tabmix_color
    ? vscode.window.createTextEditorDecorationType({ backgroundColor: tabmix_color })
    : null;

  const decorationTypes = getDecorationTypes(colors);

  if (activeEditor) {
    indentConfig();
  }

  if (activeEditor && checkLanguage()) {
    triggerUpdateDecorations();
  }

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

    if (
      activeEditor &&
      event.document === activeEditor.document &&
      checkLanguage()
    ) {
      triggerUpdateDecorations();
    }
  },
    null,
    context.subscriptions
  );

  var timeout = null;

  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    var updateDelay =
      vscode.workspace.getConfiguration('indentRainbow')['updateDelay'] || 100;
    timeout = setTimeout(updateDecorations, updateDelay);
  }

  function updateDecorations() {
    /**
     * A function that is doing too much, will be refactored soon
     */
    const changeTheWorld = (skip, thematch) => {
      var m = match[0];
      var l = m.length;
      var o = 0;
      var n = 0;
      while (n < l) {
        var startPos = activeEditor.document.positionAt(match.index + n);
        n += m[n] === '\t' ? 1 : activeEditor.options.tabSize;

        var endPos = activeEditor.document.positionAt(match.index + n);
        const decoration = getDecoration(startPos, endPos);

        let sc = 0; // space count
        let tc = 0; // tab count

        if (!skip && tabmix_decorator) {
          // counting (split is said to be faster than match()
          // only do it if we don't already skip all errors
          tc = thematch.split('\t').length - 1;
          if (tc) {
            // only do this if we already have some tabs
            sc = thematch.split(' ').length - 1;
          }
          // if we have (only) "spaces" in a "tab" indent file we
          // just ignore that, because we don't know if there
          // should really be tabs or spaces for indentation
          // If you (yes you!) know how to find this out without
          // infering this from the file, speak up :)
        }

        if (sc > 0 && tc > 0) {
          tabmix_decorator.push(decoration);
        } else {
          let decorator_index = o % decorators.length;
          decorators[decorator_index].push(decoration);
        }
        o++;
      }
    };

    if (!activeEditor) {
      return;
    }
    const regEx = /^[\t ]+/gm;
    const tabsize = activeEditor.options.tabSize;
    const text = activeEditor.document.getText();
    const tabs = ' '.repeat(tabsize);

    let error_decorator: vscode.DecorationOptions[] = [];
    let tabmix_decorator: vscode.DecorationOptions[] = tabmix_decoration_type ? [] :
      null;
    let decorators = [];

    decorationTypes.forEach(() => {
      let decorator: vscode.DecorationOptions[] = [];
      decorators.push(decorator);
    });

    // TODO: use map instead of array
    const dercoratorsMap = new Map<vscode.TextEditorDecorationType, vscode.DecorationOptions[]>();
    decorationTypes.forEach(type => dercoratorsMap.set(type, []));

    let match: RegExpExecArray;
    var re = new RegExp('\t', 'g');

    while ((match = regEx.exec(text))) {
      const pos = activeEditor.document.positionAt(match.index);
      const line = activeEditor.document.lineAt(pos);
      const skip = skipAllErrors || matchesAny(line.text, ignoreLinePatterns); // true if the lineNumber is in ignoreLines.
      const thematch = match[0];
      const ma = match[0].replace(re, tabs).length;
      /**
       * Error handling.
       * When the indent spacing (as spaces) is not divisible by the tabsize,
       * consider the indent incorrect and mark it with the error decorator.
       * Checks for lines being ignored in ignoreLines array ( `skip` Boolran)
       * before considering the line an error.
       */
      if (!skip && ma % tabsize !== 0) {
        let startPos = activeEditor.document.positionAt(match.index);
        let endPos = activeEditor.document.positionAt(
          match.index + match[0].length
        );
        const decoration = getDecoration(startPos, endPos);
        error_decorator.push(decoration);
      } else {
        changeTheWorld(skip, thematch);
      }
    }

    decorationTypes.forEach((decorationType, index) => {
      activeEditor.setDecorations(decorationType, decorators[index]);
    });
    activeEditor.setDecorations(error_decoration_type, error_decorator);
    activeEditor.setDecorations(tabmix_decoration_type, tabmix_decorator);

    clearMe = true;
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
        var inclang =
          vscode.workspace.getConfiguration('indentRainbow')[
          'includedLanguages'
          ] || [];
        var exclang =
          vscode.workspace.getConfiguration('indentRainbow')[
          'excludedLanguages'
          ] || [];

        currentLanguageId = activeEditor.document.languageId;
        doIt = true;
        if (inclang.length !== 0) {
          if (inclang.indexOf(currentLanguageId) === -1) {
            doIt = false;
          }
        }

        if (doIt && exclang.length !== 0) {
          if (exclang.indexOf(currentLanguageId) !== -1) {
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
}

const getDecoration = (start, end): vscode.DecorationOptions => ({
  range: new vscode.Range(start, end),
  hoverMessage: null,
});

const getUserPreferences = () => {
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

  const config = vscode.workspace.getConfiguration('indentRainbow');

  // Error color gets shown when tabs aren't right,
  //  e.g. when you have your tabs set to 2 spaces but the indent is 3 spaces
  const error_color = config.errorColor || 'rgba(128,32,32,0.3)';

  const tabmix_color = config.tabmixColor || '';

  // Colors will cycle through, and can be any size that you want
  const colors: string[] = config['colors'] || [
    'rgba(255,255,64,0.07)',
    'rgba(127,255,127,0.07)',
    'rgba(255,127,255,0.07)',
    'rgba(79,236,236,0.07)',
  ];

  const ignoredLanguages: string[] = config.ignoreErrorLanguages || [];

  const ignoreLinePatterns: RegExp[] = (config.ignoreLinePatterns || [])
    .map(stringToRegex) // turn strings into Regex objects then remove anything that may not be a valid Regex
    .filter(r => !!r);

  return {
    colors,
    ignoreLinePatterns,
    ignoredLanguages,
    tabmix_color,
    error_color,
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

const matchesAny = (text: string, expressions: RegExp[]): boolean => {
  for (const expression of expressions) {
    if (expression.test(text)) {
      return true;
    }
  }

  return false;
};