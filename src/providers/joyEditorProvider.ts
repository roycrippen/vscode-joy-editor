import * as vscode from 'vscode';
import * as path from 'path';

const fs = require('fs');

var _pointlessExtension = "pless";
var _providerHtml = "";

export class JoyEditorProvider implements vscode.TextDocumentContentProvider {

    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    /**
     * Constructor.
     * 
     * @param options - socket options
     */
    public constructor() {
    }

    /**
     * Function that provides the text document content.
     * 
     * @param uri - provided file uri
     */
    public provideTextDocumentContent(uri: vscode.Uri): string {
        return this.createPointlessEditorPreview(uri);
    }

    /**
     * Function invoked after changes on made to the provided text document content.
     */
    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    /**
     * Update Callback.
     * 
     * @param uri - provided file uri
     */
    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }

    /**
     * Create the Joy Editor Preview.
     * 
     * @param uri - provided file uri
     */
    public createPointlessEditorPreview(uri: vscode.Uri): string {
        const reason = "Active editor doesn't show a Pointless script - please open one and/or relaunch the Pointless Editor extension.";
        if (typeof vscode.window.activeTextEditor === 'undefined' || !vscode.window.activeTextEditor.document.fileName.endsWith(_pointlessExtension)) {
            _providerHtml = this.errorPreview(reason);
            return _providerHtml
        }
        return this.pointlessEditorPreview(uri);
    }


    // /**
    //  * Parse a joy file into memory. This function will return an array of joy files represented as strings.
    //  * If the root joy file references other joy files (via the libload keyword) those files will are added
    //  * to the array via recursion.
    //  * 
    //  * @param array - array of joy files represented as strings
    //  * @param filename - the root joy file to parse
    //  */
    // private recursiveLibloadParseAsArray(array: string[], filename: string): string[] {
    //     console.log(`parsing file: ${filename}`);

    //     if (vscode.window.activeTextEditor === undefined) {
    //         return []
    //     }

    //     var filePath = vscode.window.activeTextEditor.document.fileName.substring(0, filename.lastIndexOf(path.sep)) + path.sep;

    //     if (fs.existsSync(filename)) {
    //         const rawFile = fs.readFileSync(filename, 'utf8')
    //         const strippedRawFile = lexJoyCommands(rawFile).reduce((acc, token) => {
    //             return `${acc} ${token.value}`
    //         }, "")

    //         var strFile = JSON.stringify(strippedRawFile, null, 4);

    //         array.push(strFile);
    //         var pattern = /(?!^)"([\w+]|[.]+)+.*?"(\s+)(libload)(\s?)./g;
    //         var newlibMatch = strFile.match(pattern);

    //         if (newlibMatch !== null && typeof newlibMatch !== 'undefined') {
    //             newlibMatch.forEach((a) => {
    //                 var lib = a.match(/(^)".*?"/g);
    //                 if (lib !== null && typeof lib !== 'undefined' && lib.length > 0) {
    //                     array = this.recursiveLibloadParseAsArray(array, filePath + lib[0].trim().replace(/^"(.*)\\"$/g, '$1') + '.' + _joyExtension);
    //                 }
    //             });
    //         }
    //     }

    //     return array;
    // }

    /**
     * Read current Pointless file.
     * 
     * @param array - array of joy files represented as strings
     * @param filename - the root joy file to parse
     */
    loadPointlessFile(filename: string): string {
        console.log(`loading file: ${filename}`);

        if (vscode.window.activeTextEditor === undefined) {
            return ""
        }

        if (fs.existsSync(filename)) {
            let source = fs.readFileSync(filename, 'utf8')
            return JSON.stringify(source).slice(1).slice(0, -1)
        }
        return ""
    }

    /**
     * Create the Joy Editor extension as a preview tab within vscode.
     * 
     * @param uri - provided file uri
     */
    private pointlessEditorPreview(uri: vscode.Uri): string {

        if (vscode.window.activeTextEditor === undefined) {
            return ""
        }

        const relativePath = path.dirname(__dirname);
        const pathMain = relativePath.replace('/out', '/src/providers/')
        const filename = vscode.window.activeTextEditor.document.fileName;
        const source = this.loadPointlessFile(filename)

        _providerHtml = fs.readFileSync(pathMain + 'main.html', 'utf8')
            .replace(/\${relativePath}/g, relativePath)
            .replace(/\${joyFileStr}/g, source);

        let pathEditor = relativePath.replace('/out', '/editor/src/')
        fs.writeFileSync(pathEditor + 'testprovider.html', _providerHtml)

        return _providerHtml;
    }

    /**
     * Get the HTML markup.
     */
    public getProviderHtml(): string {
        return _providerHtml;
    }

    /**
     * Construct html markup based on a error message.
     * 
     * @param error - error message
     */
    private errorPreview(error: string): string {
        return `
      <body>
        ${error}
      </body>`;
    }
}