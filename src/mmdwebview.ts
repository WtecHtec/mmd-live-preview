import path from "path";
import * as vscode from 'vscode';
export function updateWebview(panel: any, mermaidContent: string, context: any) {
    // Get the local path to mermaid.js
    const mermaidJsPath = vscode.Uri.file(
        path.join(context.extensionPath, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js')
    );
    
    // And get the URI to use in the webview
    const mermaidJsUri = panel.webview.asWebviewUri(mermaidJsPath);

    panel.webview.html = getWebviewContent(mermaidContent, mermaidJsUri);
    
}

export function getWebviewContent(mermaidContent: string, mermaidJsUri: string) {


    return `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${mermaidJsUri}</title>
    <script src="https://unpkg.com/svg2roughjs/dist/svg2roughjs.umd.min.js"></script>
    <script type="module">
    //  mermaid 绘制
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/+esm'
      // 缩放
      import panzoom from 'https://cdn.jsdelivr.net/npm/panzoom@9.4.3/+esm'
     
   
     
      // 初始化
      mermaid.initialize({ 
            startOnLoad: true,  
            theme: 'default'
        });

      // 渲染
        async function renderMermaid() {
            const container = document.getElementById("mermaid-container");
            try {
                await mermaid.run({ nodes: [container] });
                setupHandeDraw()
                setupPanZoom();
            } catch (error) {
                console.error("Mermaid 渲染错误: ", error);
            }
        }

        // 设置可缩放
        function setupPanZoom() {
            const container = document.getElementById("result-mermaid");
            const panzoomInstance = panzoom(container, {
                maxZoom: 4,
                minZoom: 0.2,
                zoomDoubleClickSpeed: 1
            });
        }
        
        // 设置手绘
        function setupHandeDraw() {
            const svgConverter = new svg2roughjs.Svg2Roughjs('#result-mermaid')
            svgConverter.svg = document.querySelector('#mermaid-container svg')
            svgConverter.sketch()
             
        }

        document.addEventListener("DOMContentLoaded", renderMermaid);
    </script>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            background-color: #f0f0f0;
        }

        .nodeLabel  p, .edgeLabel p {
           
            display: inline !important;

        }


        #mermaid-container {

            opacity: 0;   
        }
        
    </style>
</head>
<body>
    <div id="mermaid-container">
        ${mermaidContent}
    </div>
    <div id="result-mermaid"></div>
</body>
</html>
    `;
}