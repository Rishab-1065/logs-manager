// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const jsRemoveAllLogs = require("./js-utils").removeAllLogs;
const jsCommentAllLogs = require("./js-utils").commentAllLogs;
const jsUncommentAllLogs = require("./js-utils").uncommentAllLogs;
// const tsCommentAllLogs = require("./ts-utils").commentAllLogs;
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
      try {
        const document = getCurrentDocument();
        const documentText = document.getText();
        const fileType = document.languageId;
        let newDocumentText = documentText;
        // if (fileType === "javascript") {
        newDocumentText = jsRemoveAllLogs(documentText);
        // } else if (fileType === "typescript") {
        newDocumentText = jsRemoveAllLogs(documentText);
        // }
        applyNewText(document, newDocumentText);
      } catch (Error) {
        notify("Oops!!! Something went wrong.", "error");
      }
    }
  );
  const commentCommand = vscode.commands.registerCommand(
    "extension.commentAllLogs",
    () => {
      try {
        const document = getCurrentDocument();
        const documentText = document.getText();
        const fileType = document.languageId;
        let newDocumentText = documentText;
        // if (fileType === "javascript") {
        newDocumentText = jsCommentAllLogs(documentText);
        // } else if (fileType === "typescript") {
        // newDocumentText = tsCommentAllLogs(documentText);
        // }
        applyNewText(document, newDocumentText);
      } catch (Error) {
        notify("Oops!!! Something went wrong.", "error");
      }
    }
  );
  const uncommentCommand = vscode.commands.registerCommand(
    "extension.uncommentAllLogs",
    () => {
      try {
        const document = getCurrentDocument();
        const documentText = document.getText();
        const newDocumentText = jsUncommentAllLogs(documentText);
        applyNewText(document, newDocumentText);
      } catch (Error) {
        notify("Oops!!! Something went wrong.", "error");
      }
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
    vscode.commands.executeCommand("workbench.action.files.save");
  });
}

function notify(message, type) {
  switch (type) {
    case "warning":
      vscode.window.showWarningMessage(message);
      break;
    case "error":
      vscode.window.showErrorMessage(message);
      break;
    default:
      vscode.window.showInformationMessage(message);
  }
}

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
