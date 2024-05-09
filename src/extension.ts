// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let newContent: string = "";

export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode build-in icons" is now active!');

  // 注册命令行打开的 panel
  context.subscriptions.push(
    vscode.commands.registerCommand('icons.find', () => {
      // Create and show a new webview
      const panel = vscode.window.createWebviewPanel(
        'Icons', // Identifies the type of the webview. Used internally
        'VSCode build-in Icons', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true, // 允许执行脚本
          // Webview options. More on these later.
          localResourceRoots: [vscode.Uri.file(context.extensionPath)],
        }
      );
      // And set its HTML content
      panel.webview.html = getWebviewContent(panel.webview, context.extensionPath);


    })
  );
  // 注册 webview 到 sidebar
  const provider = new IconsViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(IconsViewProvider.viewType, provider));

}

// This method is called when your extension is deactivated
export function deactivate() { }

class IconsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'icons.iconsView';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) { }

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {

    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri
      ]
    };
    webviewView.webview.html = getWebviewContent(webviewView.webview, this._extensionUri.fsPath);
  }


}



function getWebviewContent(webview: vscode.Webview, extensionPath: string) {

  if (newContent !== "") {
    return newContent;
  }
  // 从 codicon.html 中获取 html 内容
  const resourcePath = vscode.Uri.file(path.join(extensionPath, 'resources/codicon/codicon.html'));
  const ttfUri = vscode.Uri.file(path.join(extensionPath, 'resources/codicon/codicon.ttf'));
  let webttfUri = webview.asWebviewUri(ttfUri);

  const cssUri = vscode.Uri.file(path.join(extensionPath, 'resources/codicon/codicon.css'));
  let webcssUri = webview.asWebviewUri(cssUri);
  const filePath = resourcePath.fsPath;

  // 使用同步方式读取文件，这种方式会阻塞其他操作直到文件读取完成
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  newContent = fileContent.replace("./codicon.css", webcssUri.toString()).replace("./codicon.ttf", webttfUri.toString());

  return newContent;
}

