// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from 'path';
import * as vscode from 'vscode';
import { updateWebview } from './mmdwebview';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mmd-live-preview" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('mmd-live-preview.preview', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const editor = vscode.window.activeTextEditor;
		// 判断是否在文件编辑区
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
		// 判断当前文件是否是 .mmd
        if (path.extname(document.fileName) !== '.mmd') {
            vscode.window.showErrorMessage('Not a Mermaid file. Only .mmd files are supported.');
            return;
        }

		// 创建新的面板
		const panel = vscode.window.createWebviewPanel(
            'mermaidPreview',
            'Mermaid Preview',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'media'))
                ]
            }
        );
		// 获取mmd 内容
		const mermaidContent = document.getText();

		 // 更新 webview 内容
		 updateWebview(panel, mermaidContent, context);

		 // 监听工作区文件内容修改
		 const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview(panel, e.document.getText(), context);
            }
        });

        // Clean up when the panel is closed
        panel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
