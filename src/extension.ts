// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Parser } from "./parser";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "capitalizenounincomments" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  const parser = new Parser();

  // Register commands here
  let editAllCommentsCommand = vscode.commands.registerCommand(
    "capitalizenounincomments.helloWorld",
    () => {
      if (vscode.window.activeTextEditor) {
        const activeEditor = vscode.window.activeTextEditor;
        parser.SetRegex(activeEditor, activeEditor.document.languageId);
        parser.findComments(activeEditor);
        vscode.workspace.applyEdit(parser.edit).then((success) => {
          if (success) {
            vscode.window.showInformationMessage(
              "Comments edited successfully!"
            );
          } else {
            vscode.window.showErrorMessage("Failed to edit comments.");
          }
        });
      }
    }
  );

  context.subscriptions.push(editAllCommentsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
