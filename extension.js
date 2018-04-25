// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const removeAllLogs = require("./utils").removeAllLogs;
const commentAllLogs = require("./utils").commentAllLogs;
const uncommentAllLogs = require("./utils").uncommentAllLogs;
let workspaceEdit = new vscode.WorkspaceEdit();
// this method is called when your extension is activated
// your extension is activated the very first time the command is execute
function getCurrentDocument() {
  return vscode.window.activeTextEditor.document;
}
function getDocumentRange(document) {
  var firstLine = document.lineAt(0);
  var lastLine = document.lineAt(document.lineCount - 1);
  var textRange = new vscode.Range(
    0,
    firstLine.range.start.character,
    document.lineCount - 1,
    lastLine.range.end.character
  );
  return textRange;
}
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  const removeCommand = vscode.commands.registerCommand(
    "extension.removeAllLogs",
    () => {
      const document = getCurrentDocument();
      const uri = document.uri;
      const documentText = document.getText();

      const newDocumentText = removeAllLogs(documentText);
      const textRange = getDocumentRange(document);
      // console.log(newDocumentText);
      workspaceEdit.replace(uri, textRange, newDocumentText);
      vscode.workspace.applyEdit(workspaceEdit).then(() => {
        vscode.window.showInformationMessage(`all logs removed`);
      });
    }
  );
  const commentCommand = vscode.commands.registerCommand(
    "extension.commentAllLogs",
    () => {
      const document = getCurrentDocument();
      const uri = document.uri;
      const documentText = document.getText();

      const newDocumentText = commentAllLogs(documentText);
      const textRange = getDocumentRange(document);
      // console.log(newDocumentText);
      workspaceEdit.replace(uri, textRange, newDocumentText);
      vscode.workspace.applyEdit(workspaceEdit).then(() => {
        vscode.window.showInformationMessage(`all logs commented`);
      });
    }
  );
  const uncommentCommand = vscode.commands.registerCommand(
    "extension.uncommentAllLogs",
    () => {
      const document = getCurrentDocument();
      const uri = document.uri;
      const documentText = document.getText();

      const newDocumentText = uncommentAllLogs(documentText);
      const textRange = getDocumentRange(document);
      // console.log(newDocumentText);
      workspaceEdit.replace(uri, textRange, newDocumentText);
      vscode.workspace.applyEdit(workspaceEdit).then(() => {
        vscode.window.showInformationMessage(`all logs uncommented`);
      });
    }
  );
  context.subscriptions.push(commentCommand);
  context.subscriptions.push(removeCommand);
  context.subscriptions.push(uncommentCommand);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
