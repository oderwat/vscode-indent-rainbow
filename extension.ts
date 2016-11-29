// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

  // Create a decorator types that we use to decorate indent levels
  let decorationTypes = [];

  let doIt = false;
  let clearMe = false;
  let currentLanguageId = null;

  let activeEditor = vscode.window.activeTextEditor;

  // Error color gets shown when tabs aren't right, 
  //  e.g. when you have your tabs set to 2 spaces but the indent is 3 spaces 
  const error_color = vscode.workspace.getConfiguration('indentRainbow')['error_color'] || "rgba(128,32,32,0.3)";
  let error_decoration_type = vscode.window.createTextEditorDecorationType({
      backgroundColor: error_color 
  });

  // Colors will cycle through, and can be any size that you want
  const colors = vscode.workspace.getConfiguration('indentRainbow')['colors'] || [
    "rgba(64,64,16,0.3)",
    "rgba(32,64,32,0.3)",
    "rgba(64,32,64,0.3)",
    "rgba(16,48,48,0.3)"
  ];

  // Loops through colors and creates decoration types for each one
  colors.forEach((color, index) => {
    decorationTypes[index] = vscode.window.createTextEditorDecorationType({
      backgroundColor: color 
    });
  });

  if(activeEditor) {
    indentConfig();
  }

  if (activeEditor && checkLanguage()) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(editor => {
    activeEditor = editor;
    if (editor) {
      indentConfig();
    }

    if (editor && checkLanguage()) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

  vscode.workspace.onDidChangeTextDocument(event => {
    if(activeEditor) {
      indentConfig();
    }

    if (activeEditor && event.document === activeEditor.document && checkLanguage()) {
      triggerUpdateDecorations();
    }
  }, null, context.subscriptions);

  function isEmptyObject(obj) {
      return Object.getOwnPropertyNames(obj).length === 0;
  }

  function indentConfig() {
    // Set tabSize and insertSpaces from the config if specified for this languageId
    var indentSetter = vscode.workspace.getConfiguration('indentRainbow')['indentSetter'] || [];
    // we do nothing if we have {} to not interrupt other extensions for indent settings
    if(! isEmptyObject(indentSetter) ) {
      var langCfg = indentSetter[ activeEditor.document.languageId ];
      if( langCfg === undefined ) {
        // if we do not have any defaults get those from the editor config itself
        // this seems to break detectindentation = true :(
        langCfg = vscode.workspace.getConfiguration('editor');
      }
      vscode.window.activeTextEditor.options = {
        "tabSize": langCfg.tabSize,
        "insertSpaces": langCfg.insertSpaces
      };
    }
  }

  function checkLanguage() {
    if (activeEditor) {
      if(currentLanguageId !== activeEditor.document.languageId) {
        var inclang = vscode.workspace.getConfiguration('indentRainbow')['includedLanguages'] || [];
        var exclang = vscode.workspace.getConfiguration('indentRainbow')['excludedLanguages'] || [];

        currentLanguageId = activeEditor.document.languageId;
        doIt = true;
        if(inclang.length !== 0) {
          if(inclang.indexOf(currentLanguageId) === -1) {
            doIt = false;
          }
        }

        if(doIt && exclang.length !== 0) {
          if(exclang.indexOf(currentLanguageId) !== -1) {
            doIt = false;
          }
        }
      }
    }

    if( clearMe && ! doIt) {
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

  var timeout = null;
  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
    }
    var updateDelay = vscode.workspace.getConfiguration('indentRainbow')['updateDelay'] || 100;
    timeout = setTimeout(updateDecorations, updateDelay);
  }

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    var regEx = /^[\t ]+/gm;
    var text = activeEditor.document.getText();
    var tabsize = activeEditor.options.tabSize;
    var tabs = " ".repeat(tabsize);
    let error_decorator: vscode.DecorationOptions[] = [];
    let decorators = [];
    decorationTypes.forEach(() => {
      let decorator: vscode.DecorationOptions[] = [];
      decorators.push(decorator);
    });

    var re = new RegExp("\t","g");
    var match;
    while (match = regEx.exec(text)) {
      var ma = (match[0].replace(re, tabs)).length;
      if(ma % tabsize !== 0) {
        var startPos = activeEditor.document.positionAt(match.index);
        var endPos = activeEditor.document.positionAt(match.index + match[0].length);
        var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
        error_decorator.push(decoration);
      } else {
        var m = match[0];
        var l = m.length;
        var o = 0;
        var n = 0;
        while(n < l) {
          var startPos = activeEditor.document.positionAt(match.index + n);
          if(m[n] === "\t") {
            n++;
          } else {
            n+=activeEditor.options.tabSize;
          }
          var endPos = activeEditor.document.positionAt(match.index + n);
          var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
          let decorator_index = o % decorators.length;
          decorators[decorator_index].push(decoration);
          o++;
        }
      }
    }
    decorationTypes.forEach((decorationType, index) => {
      activeEditor.setDecorations(decorationType, decorators[index]);
    });
    activeEditor.setDecorations(error_decoration_type, error_decorator);
    clearMe = true;
  }
}
