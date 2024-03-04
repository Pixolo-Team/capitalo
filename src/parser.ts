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

  /** Find and edit comments, capitalizing them */
  public findAndCapitalizeComments(activeEditor: vscode.TextEditor): void {
    let text = activeEditor.document.getText();
    let uri = activeEditor.document.uri;
    let languageCode = activeEditor.document.languageId;

    // Set the delimiter based on the language code
    if (!this.setDelimiter(languageCode)) {
      // If the language is not supported, return
      return;
    }

    // Regular expression to match single-line comments (//)
    const singleLineRegex = /\/\/(.*)/g;

    // Regular expression to match multi-line comments (/* */ or /** */)
    const multiLineRegex = /\/\*(.*?)\*\//gs;

    // Replace single-line comments
    text = text.replace(singleLineRegex, (match, group) => {
      const capitalized =
        group.trim().charAt(0).toUpperCase() + group.trim().slice(1);
      return `// ${capitalized}`;
    });

    // Replace multi-line comments
    text = text.replace(multiLineRegex, (match, group) => {
      const capitalized =
        group.trim().charAt(0).toUpperCase() + group.trim().slice(1);
      return `/* ${capitalized} */`;
    });

    // Update the document with the capitalized comments
    this.edit.replace(
      uri,
      new vscode.Range(0, 0, activeEditor.document.lineCount, 0),
      text
    );
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
