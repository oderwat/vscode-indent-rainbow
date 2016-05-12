"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
// this method is called when vs code is activated
function activate(context) {
    // create a decorator types that we use to decorate indent levels
    var decorationType = [];
    var doIt = false;
    var clearMe = false;
    var currentLanguageId = null;
    var activeEditor = vscode.window.activeTextEditor;
    var colors = vscode.workspace.getConfiguration('indentRainbow')['color1s'] || [
        "rgba(64,64,16,0.3)",
        "rgba(32,64,32,0.3)",
        "rgba(64,32,64,0.3)",
        "rgba(16,48,48,0.3)",
        "rgba(128,32,32,0.9)"
    ];
    for (var i = 0; i < colors.length; i++) {
        decorationType[i] = vscode.window.createTextEditorDecorationType({
            backgroundColor: colors[i]
        });
    }
    if (activeEditor) {
        indentConfig();
    }
    if (activeEditor && checkLanguage()) {
        triggerUpdateDecorations();
    }
    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        activeEditor = editor;
        if (editor) {
            indentConfig();
        }
        if (editor && checkLanguage()) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(function (event) {
        if (activeEditor) {
            indentConfig();
        }
        if (activeEditor && event.document === activeEditor.document && checkLanguage()) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    function isEmptyObject(obj) {
        return Object.getOwnPropertyNames(obj).length == 0;
    }
    function indentConfig() {
        // Set tabSize and insertSpaces from the config if specified for this languageId
        var indentSetter = vscode.workspace.getConfiguration('indentRainbow')['indentSetter'] || [];
        // we do nothing if we have {} to not interrupt other extensions for indent settings
        if (true || !isEmptyObject(indentSetter)) {
            var langCfg = indentSetter[activeEditor.document.languageId];
            if (langCfg == undefined) {
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
            if (currentLanguageId != activeEditor.document.languageId) {
                var inclang = vscode.workspace.getConfiguration('indentRainbow')['includedLanguages'] || [];
                var exclang = vscode.workspace.getConfiguration('indentRainbow')['excludedLanguages'] || [];
                currentLanguageId = activeEditor.document.languageId;
                doIt = true;
                if (inclang.length != 0) {
                    if (inclang.indexOf(currentLanguageId) == -1) {
                        doIt = false;
                    }
                }
                if (doIt && exclang.length != 0) {
                    if (exclang.indexOf(currentLanguageId) != -1) {
                        doIt = false;
                    }
                }
            }
        }
        if (clearMe && !doIt) {
            // clear decorations when language switches away
            var decor = [];
            activeEditor.setDecorations(decorationType[0], decor);
            activeEditor.setDecorations(decorationType[1], decor);
            activeEditor.setDecorations(decorationType[2], decor);
            activeEditor.setDecorations(decorationType[3], decor);
            activeEditor.setDecorations(decorationType[4], decor);
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
        timeout = setTimeout(updateDecorations, 100);
    }
    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        var regEx = /^[\t ]+/gm;
        var text = activeEditor.document.getText();
        var tabsize = activeEditor.options.tabSize;
        var tabs = " ".repeat(tabsize);
        var decor0 = [];
        var decor1 = [];
        var decor2 = [];
        var decor3 = [];
        var decor4 = [];
        var re = new RegExp("\t", "g");
        var match;
        while (match = regEx.exec(text)) {
            var ma = (match[0].replace(re, tabs)).length;
            if (ma % tabsize != 0) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
                decor4.push(decoration);
            }
            else {
                var m = match[0];
                var l = m.length;
                var o = 0;
                var n = 0;
                while (n < l) {
                    var startPos = activeEditor.document.positionAt(match.index + n);
                    if (m[n] == "\t") {
                        n++;
                    }
                    else {
                        n += activeEditor.options.tabSize;
                    }
                    var endPos = activeEditor.document.positionAt(match.index + n);
                    var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
                    switch (o % 4) {
                        case 0:
                            decor0.push(decoration);
                            break;
                        case 1:
                            decor1.push(decoration);
                            break;
                        case 2:
                            decor2.push(decoration);
                            break;
                        case 3:
                            decor3.push(decoration);
                            break;
                    }
                    o++;
                }
            }
        }
        activeEditor.setDecorations(decorationType[0], decor0);
        activeEditor.setDecorations(decorationType[1], decor1);
        activeEditor.setDecorations(decorationType[2], decor2);
        activeEditor.setDecorations(decorationType[3], decor3);
        activeEditor.setDecorations(decorationType[4], decor4);
        clearMe = true;
    }
}
exports.activate = activate;
