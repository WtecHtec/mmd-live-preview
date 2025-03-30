// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from 'path';
import fs from 'fs';
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
        // 获取mmd 内容
        const mermaidContent = document.getText();

        const panel = createMermaidWebview(context, 'Mermaid Preview', mermaidContent, true);

    });


    // 注册命令：渲染选中的 Mermaid 数据
    const disposablePreviewSelect = vscode.commands.registerCommand('mmd-live-preview.previewSelect', () => {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText.trim()) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        const panel = createMermaidWebview(context, 'Mermaid Preview (Selection)', selectedText, false);
    });



    context.subscriptions.push(disposable, disposablePreviewSelect);
}

function createMermaidWebview(context: vscode.ExtensionContext,
    title: string,
    mermaidContent: string,
    shouldListenToFileChanges: boolean) {
    // 创建新的面板
    const panel = vscode.window.createWebviewPanel(
        'mermaidPreview',
        title,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'media'))
            ]
        }
    );

    // 更新 webview 内容
    updateWebview(panel, mermaidContent, context);
    // 如果需要监听文件修改，则添加监听逻辑
    if (shouldListenToFileChanges) {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (document) {
            // 监听工作区文件内容修改
            const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.uri.toString() === document?.uri.toString()) {
                    updateWebview(panel, e.document.getText(), context);
                }
            });

            // Clean up when the panel is closed
            panel.onDidDispose(() => {
                changeDocumentSubscription.dispose();
            });
        }
    }
}


async function exportPNG(svgContent: string, width: number = 800, height: number = 600) {
    // 获取当前工作区的根目录
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

    // 显示保存对话框，默认路径为工作区根目录
    const saveUri = await vscode.window.showSaveDialog({
        filters: {
            Images: ['png']
        },
        defaultUri: vscode.Uri.file(path.join(workspaceFolder, 'diagram.png'))
    });

    if (!saveUri) {
        vscode.window.showInformationMessage('Export cancelled.');
        return;
    }
    vscode.window.showInformationMessage(`PNG saved: successfully`);
    //    svg2img(svgContent, function(error, buffer) {
    //         //returns a Buffer
    //         // fs.writeFileSync('foo1.png', buffer);
    //     });
    // 使用 svg2img 将 SVG 转换为 PNG
    //  svg2img(svgContent, (error, buffer) => {
    //     if (error) {
    //         vscode.window.showErrorMessage(`Failed to export PNG: ${error.message}`);
    //         return;
    //     }

    //     // 将 PNG 数据写入文件
    //     fs.writeFile(saveUri.fsPath, buffer, (err) => {
    //         if (err) {
    //             vscode.window.showErrorMessage(`Failed to save PNG: ${err.message}`);
    //         } else {
    //             vscode.window.showInformationMessage(`PNG exported successfully: ${saveUri.fsPath}`);
    //         }
    //     });
    // });
}

async function exportSVG(svgContent: string) {
    const uri = await vscode.window.showSaveDialog({
        filters: {
            'SVG': ['svg']
        },
        defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'diagram.svg'))
    });

    if (uri) {
        fs.writeFileSync(uri.fsPath, svgContent);
        vscode.window.showInformationMessage('SVG exported successfully!');
    }
}

// This method is called when your extension is deactivated
export function deactivate() { }
