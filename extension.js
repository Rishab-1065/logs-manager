// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const removeAllLogs = require("./utils").removeAllLogs;
const commentAllLogs = require("./utils").commentAllLogs;
const uncommentAllLogs = require("./utils").uncommentAllLogs;
// this method is called when your extension is activated
// your extension is activated the very first time the command is execute
function getCurrentDocument() {
  return vscode.window.activeTextEditor.document;
}
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  const removeCommand = vscode.commands.registerCommand(
    "extension.removeAllLogs",
    () => {
      const document = getCurrentDocument();
      const documentText = document.getText();
      const newDocumentText = removeAllLogs(documentText);
      applyNewText(document, newDocumentText);
    }
  );
  const commentCommand = vscode.commands.registerCommand(
    "extension.commentAllLogs",
    () => {
      const document = getCurrentDocument();
      const documentText = document.getText();
      const newDocumentText = commentAllLogs(documentText);
      applyNewText(document, newDocumentText);
    }
  );
  const uncommentCommand = vscode.commands.registerCommand(
    "extension.uncommentAllLogs",
    () => {
      const document = getCurrentDocument();
      const documentText = document.getText();
      const newDocumentText = uncommentAllLogs(documentText);
      applyNewText(document, newDocumentText);
    }
  );
  context.subscriptions.push(commentCommand);
  context.subscriptions.push(removeCommand);
  context.subscriptions.push(uncommentCommand);
}
exports.activate = activate;

function applyNewText(document, newDocumentText) {
  const documentLineCount = document.lineCount;
  vscode.window.activeTextEditor.edit(editBuilder => {
    editBuilder.replace(
      new vscode.Range(0, 0, documentLineCount, 0),
      newDocumentText
    );
  });
}

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
