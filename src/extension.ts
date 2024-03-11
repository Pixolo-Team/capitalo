// OTHERS //
import * as vscode from "vscode";
import { Parser } from "./parser";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const parser = new Parser();

  // Register the command to capitalize comments
  let editAllCommentsCommand = vscode.commands.registerCommand(
    "capitalo",
    async () => {
      if (vscode.window.activeTextEditor) {
        const activeEditor = vscode.window.activeTextEditor;
        // Set regex and find and capitalize comments
        parser.SetRegex(activeEditor, activeEditor.document.languageId);
        parser.findAndCapitalizeComments(activeEditor);

        // Apply the edit and save the document if successful
        await vscode.workspace.applyEdit(parser.edit);
        await vscode.commands.executeCommand("workbench.action.files.save");
      }
    }
  );

  context.subscriptions.push(editAllCommentsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
