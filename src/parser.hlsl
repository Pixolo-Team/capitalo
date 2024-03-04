// OTHERS //
import * as vscode from "vscode";
import { checkNoun } from "./check.util";

export class Parser {
  private delimiters: string[] = [];
  private editRanges: boolean[] = [];

  public edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
  public uri: any;
  public supportedLanguage = true;

  public SetRegex(activeEditor: vscode.TextEditor, languageCode: string) {
    if (this.setDelimiter(languageCode)) {
      this.edit = new vscode.WorkspaceEdit();
      this.uri = activeEditor.document.uri;
    } else {
      vscode.window.showInformationMessage(
        "Cannot edit comments : unknown language (" + languageCode + ")"
      );
    }
  }

  public findSingleLineComments(activeEditor: vscode.TextEditor): any {
    // // Iterate over each line in the active editor document
    // for (let l = 0; l < activeEditor.document.lineCount; l++) {
    //   // Get the text of the current line
    //   let line = activeEditor.document.lineAt(l);
    //   let matched = false;
    //   // Iterate over each delimiter
    //   for (let i = 0; i < this.delimiters.length; i++) {
    //     if (!matched) {
    //       // Create a regular expression from the delimiter and search for it in the line text
    //       let expression = this.delimiters[i].replace(/\//gi, "\\/");
    //       let removeRange = this.editRanges[i];
    //       let regEx = new RegExp(expression, "ig");
    //       let match = regEx.exec(line.text);
    //       // If the delimiter is found, edit the comment and set matched to true
    //       if (match) {
    //         if (removeRange) {
    //           // Create a range from the start of the comment to the end of the line
    //           let startPos = new vscode.Position(l, match.index);
    //           let endPos = new vscode.Position(l, line.text.length);
    //           let range = new vscode.Range(startPos, endPos);
    //           // Get the text of the comment and fix it using the fixComment method
    //           let newText = this.fixComment(line.text);
    //           // Replace the comment with the fixed comment
    //           this.edit.replace(this.uri, range, newText);
    //         } else {
    //           // Create a range from the start of the comment to the end of the line
    //           let startPos = new vscode.Position(l, match.index);
    //           let endPos = new vscode.Position(l + 1, 0);
    //           let range = new vscode.Range(startPos, endPos);
    //           // Get the text of the comment and fix it using the fixComment method
    //           let newText = this.fixComment(line.text);
    //           // Replace the comment with the fixed comment
    //           this.edit.replace(this.uri, range, newText);
    //         }
    //         // Set matched to true
    //         matched = true;
    //       }
    //     }
    //   }
    // }
  }

  /** Find and edit multiline comments */
  public findComments(activeEditor: vscode.TextEditor): void {
    let text = activeEditor.document.getText();
    let uri = activeEditor.document.uri;
    let languageCode = activeEditor.document.languageId;
    let regEx: RegExp;

    // Set the delimiter based on the language code
    if (!this.setDelimiter(languageCode)) {
      // If the language is not supported, return
      return;
    }

    // Escape the delimiter characters
    let escapedDelimiters = this.delimiters.map((delimiter) =>
      delimiter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    );

    // Create regular expression to match both single-line and multi-line comments
    regEx = new RegExp(`(?:${escapedDelimiters.join("|")})(?:\\s*.*|$)`, "g");

    let match: any;

    while ((match = regEx.exec(text))) {
      let startPos = activeEditor.document.positionAt(match.index);
      let endPos = activeEditor.document.positionAt(
        match.index + match[0].length
      );
      let range = new vscode.Range(startPos, endPos);
      let delimiter = match[0].match(
        new RegExp(`^(${escapedDelimiters.join("|")})`)
      )[1]; // Extract the delimiter from the matched comment
      let newText = this.fixComment(
        activeEditor.document.getText(range),
        delimiter
      );
      this.edit.replace(uri, range, newText);
    }
  }

  /** Make the fixes you want to make to the Comment */
  private fixComment(comment: string, delimiter: string): string {
    // Remove leading delimiter and whitespaces from the comment
    comment = comment.replace(new RegExp(`^${delimiter}\\s*`), "");
    // Capitalize the first letter of the comment string
    comment = comment.charAt(0).toUpperCase() + comment.slice(1);

    // Create a new array to hold the new comment
    let newComment: string[] = [];

    // Split the comment into words and iterate over them
    comment.split(" ").forEach((word) => {
      // If the word is a noun, capitalize the first letter
      if (checkNoun(word)) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      // Add the word to the new comment array
      newComment.push(word);
    });

    // Join the new comment array into a string, add delimiter, and return it
    return `${delimiter} ${newComment.join(" ")}`;
  }

  private setDelimiter(languageCode: string): boolean {
    this.supportedLanguage = true;
    this.delimiters = [];
    this.editRanges = [];

    switch (languageCode) {
      case "al":
      case "c":
      case "cpp":
      case "csharp":
      case "css":
      case "dart":
      case "fsharp":
      case "go":
      case "haxe":
      case "java":
      case "javascript":
      case "javascriptreact":
      case "jsonc":
      case "kotlin":
      case "less":
      case "pascal":
      case "objectpascal":
      case "php":
      case "rust":
      case "scala":
      case "swift":
      case "typescript":
      case "typescriptreact":
        this.delimiters.push("//");
        this.delimiters.push("/\\*\\*");
        this.editRanges.push(true);
        this.editRanges.push(true);
        break;

      case "coffeescript":
      case "dockerfile":
      case "elixir":
      case "graphql":
      case "julia":
      case "makefile":
      case "perl":
      case "perl6":
      case "powershell":
      case "python":
      case "r":
      case "ruby":
      case "shellscript":
      case "yaml":
        this.delimiters.push("#");
        this.editRanges.push(true);
        break;

      case "ada":
      case "haskell":
      case "plsql":
      case "sql":
      case "lua":
        this.delimiters.push("--");
        this.editRanges.push(true);
        break;

      case "vb":
        this.delimiters.push("'");
        this.editRanges.push(true);
        break;

      case "erlang":
      case "latex":
        this.delimiters.push("%");
        this.editRanges.push(true);
        break;

      case "clojure":
      case "racket":
      case "lisp":
        this.delimiters.push(";");
        this.editRanges.push(true);
        break;

      case "terraform":
        this.delimiters.push("#");
        this.editRanges.push(true);
        break;

      case "ACUCOBOL":
      case "OpenCOBOL":
      case "COBOL":
        this.delimiters.push("\\*>");
        this.editRanges.push(true);
        this.delimiters.push("^......\\*");
        this.editRanges.push(false);
        break;
      default:
        this.supportedLanguage = false;
        break;
    }

    return this.supportedLanguage;
  }
}
