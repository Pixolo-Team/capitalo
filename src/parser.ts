// OTHERS //
import * as vscode from "vscode";
import { checkNoun } from "./check.util";

export class Parser {
  // Initialize class properties
  private delimiters: { regexString: string; commentType: string }[] = [];
  private editRanges: boolean[] = [];
  public edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
  public uri: any;
  public supportedLanguage = true;

  // Method to set regular expressions based on language code
  public SetRegex(activeEditor: vscode.TextEditor, languageCode: string) {
    // If the language is supported, initialize workspace edit and URI
    if (this.setDelimiter(languageCode)) {
      this.edit = new vscode.WorkspaceEdit();
      this.uri = activeEditor.document.uri;
    } else {
      // Show message if language is not supported
      vscode.window.showInformationMessage(
        "Cannot edit comments: unknown language (" + languageCode + ")"
      );
    }
  }

  public findAndCapitalizeComments(activeEditor: vscode.TextEditor): void {
    let text = activeEditor.document.getText();
    let uri = activeEditor.document.uri;
    let languageCode = activeEditor.document.languageId;

    if (!this.setDelimiter(languageCode)) {
      return;
    }

    for (const delimiter of this.delimiters) {
      let regexString = delimiter.regexString;
      let commentType = delimiter.commentType;
      const regex = new RegExp(regexString, "g");

      text = text.replace(regex, (_match, group) => {
        // First, capitalize nouns within the comment
        let processedComment = this.capitalizeNoun(group);
        // Then, capitalize the first letter of the processed comment
        processedComment = this.capitalizeFirstLetterOfComment(
          processedComment,
          commentType
        );
        const trimmedComment = processedComment.trim();
        if (trimmedComment !== "") {
          return `${commentType} ${trimmedComment}`;
        } else {
          return _match;
        }
      });
    }

    this.edit.replace(
      uri,
      new vscode.Range(0, 0, activeEditor.document.lineCount, 0),
      text
    );
  }

  // Method to capitalize comment words if they are nouns
  private capitalizeFirstLetterOfComment(
    comment: string,
    commentType: string
  ): string {
    // Check if the comment is empty
    if (!comment) {
      return comment;
    }

    // Trim the comment to remove any leading or trailing spaces
    comment = comment.trim();

    // Find the index of the first space after the comment type
    const firstSpaceIndex = comment.indexOf(" ");

    // If the comment type is /**/, ensure there's a */ at the end
    if (commentType === "/*") {
      // If comment does not end with */
      if (!comment.endsWith("*/")) {
        comment += " */";
      }
    }

    // If no space is found, return the capitalized comment
    if (firstSpaceIndex === -1) {
      return comment.charAt(0).toUpperCase() + comment.slice(1);
    }

    // Capitalize the first letter of the comment and add one space after the comment type
    return (
      comment.charAt(0).toUpperCase() +
      comment.slice(1, firstSpaceIndex) +
      " " +
      comment.slice(firstSpaceIndex + 1)
    );
  }

  // Method to capitalise first letter of Noun words
  private capitalizeNoun(comment: string): string {
    // Split the comment into words
    const words = comment.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (checkNoun(words[i])) {
        // Capitalize the first letter of the word
        words[i] = this.capitalizeFirstLetter(words[i]);
      }
    }

    // Check if a space is present before joining the words
    if (comment.indexOf(" ") !== -1) {
      // Join the words back into a string with a space
      return words.join(" ");
    } else {
      // Join the words back into a string without a space
      return words.join("");
    }
  }

  // Method to capitalize the first letter of a word
  private capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Method to set delimiters based on language code
  private setDelimiter(languageCode: string): boolean {
    // Reset properties
    this.supportedLanguage = true;
    this.delimiters = [];
    this.editRanges = [];

    // Switch statement to set delimiters and edit ranges
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
        this.delimiters.push({
          regexString: "//(.*)",
          commentType: "//",
        });
        this.delimiters.push({
          regexString: "/\\*(.*?)\\*/",
          commentType: "/*",
        });
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
        this.delimiters.push({
          regexString: "#(.*)",
          commentType: "#",
        });
        this.editRanges.push(true);
        break;
      case "ada":
      case "haskell":
      case "plsql":
      case "sql":
      case "lua":
        this.delimiters.push({
          regexString: "--(.*)",
          commentType: "--",
        });
        this.editRanges.push(true);
        break;
      case "vb":
        this.delimiters.push({
          regexString: "'(.*)",
          commentType: "'",
        });
        this.editRanges.push(true);
        break;
      case "erlang":
      case "latex":
        this.delimiters.push({
          regexString: "%(.*)",
          commentType: "%",
        });
        this.editRanges.push(true);
        break;
      case "clojure":
      case "racket":
      case "lisp":
        this.delimiters.push({
          regexString: ";(.*)",
          commentType: ";",
        });
        this.editRanges.push(true);
        break;
      case "terraform":
        this.delimiters.push({
          regexString: "#(.*)",
          commentType: "#",
        });
        this.editRanges.push(true);
        break;
      case "ACUCOBOL":
      case "OpenCOBOL":
      case "COBOL":
        this.delimiters.push({
          regexString: "\\*>(.*)",
          commentType: "\\*",
        });
        this.delimiters.push({
          regexString: "^......\\*(.*)",
          commentType: "\\*",
        });
        this.editRanges.push(true);
        this.editRanges.push(false);
        break;
      default:
        this.supportedLanguage = false;
        break;
    }

    return this.supportedLanguage;
  }
}
