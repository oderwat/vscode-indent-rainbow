// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	// create a decorator types that we use to decorate indent levels
	var decorationType = [
      vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(64,64,16,0.3)'
	}),
    vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(32,64,32,0.3)'
	}),
      vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(64,32,64,0.3)'
	}),
      vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(16,48,48,0.3)'
	}),
      vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(128,32,32,0.3)'
	})];

	var activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	var timeout = null;
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(updateDecorations, 100);
	}
/*
	function updateDecorations1() {
    if (!activeEditor) {
			return;
		}
		var regEx = /^[\t ]+/gm;
		var text = activeEditor.document.getText();
    var tabs = " ".repeat(activeEditor.options.tabSize)
    var decor0: vscode.DecorationOptions[] = [];
		var decor1: vscode.DecorationOptions[] = [];
		var decor2: vscode.DecorationOptions[] = [];
		var decor3: vscode.DecorationOptions[] = [];
		var decor4: vscode.DecorationOptions[] = [];
		var match;
		while (match = regEx.exec(text)) {
			var startPos = activeEditor.document.positionAt(match.index);
			var endPos = activeEditor.document.positionAt(match.index + match[0].length);
      var ma = (match[0].replace(/\t/g, tabs)).length;
			var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
      if(ma % 2 == 1) {
        decor4.push(decoration);
      } else {
        var mi = Math.floor(ma/2) % 4
        switch(mi) {
          case 0: decor0.push(decoration); break;
          case 1: decor1.push(decoration); break;
          case 2: decor2.push(decoration); break;
          case 3: decor3.push(decoration); break;
        }
      }
		}
		activeEditor.setDecorations(decorationType[0], decor0);
		activeEditor.setDecorations(decorationType[1], decor1);
		activeEditor.setDecorations(decorationType[2], decor2);
		activeEditor.setDecorations(decorationType[3], decor3);
		activeEditor.setDecorations(decorationType[4], decor4);
	}
*/
	function updateDecorations() {
    if (!activeEditor) {
			return;
		}
		var regEx = /^[\t ]+/gm;
		var text = activeEditor.document.getText();
    var tabsize = activeEditor.options.tabSize
    var tabs = " ".repeat(tabsize)
    var decor0: vscode.DecorationOptions[] = [];
		var decor1: vscode.DecorationOptions[] = [];
		var decor2: vscode.DecorationOptions[] = [];
		var decor3: vscode.DecorationOptions[] = [];
		var decor4: vscode.DecorationOptions[] = [];
    var re = new RegExp("\t","g");
		var match;
		while (match = regEx.exec(text)) {
      var ma = (match[0].replace(re, tabs)).length;
      if(ma % tabsize != 0) {
        var startPos = activeEditor.document.positionAt(match.index);
  			var endPos = activeEditor.document.positionAt(match.index + match[0].length);
			  var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
        decor4.push(decoration);
      } else {
        var m = match[0]
        var l = m.length
        var o = 0
        var n = 0
        while(n < l) {
    			var startPos = activeEditor.document.positionAt(match.index + n);
          if(m[n] == "\t") {
            n++;
          } else {
            n+=activeEditor.options.tabSize;
          }
		    	var endPos = activeEditor.document.positionAt(match.index + n);
  			  var decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: null };
          switch(o % 4) {
            case 0: decor0.push(decoration); break;
            case 1: decor1.push(decoration); break;
            case 2: decor2.push(decoration); break;
            case 3: decor3.push(decoration); break;
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
	}
}
