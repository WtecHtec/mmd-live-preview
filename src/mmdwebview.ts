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
  <script src="https://cdn.jsdelivr.net/npm/canvg@3.0.7/lib/umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
    <script type="module">
    //  mermaid 绘制
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/+esm'
      // 缩放
      import panzoom from 'https://cdn.jsdelivr.net/npm/panzoom@9.4.3/+esm'
     
     const vscode = acquireVsCodeApi();
     
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

                // 手动移除多余的 <p> 标签
        const pTags = container.querySelectorAll("g p");
        pTags.forEach((p) => {
            const parent = p.parentNode;
            while (p.firstChild) {
                parent.insertBefore(p.firstChild, p);
            }
            parent.removeChild(p);
        });

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

        function exportToSVG() {
            const svgElement = document.querySelector("#result-mermaid svg");
            if (!svgElement) {
                alert("No diagram to export!");
                return;
            }
            // 序列化 SVG 数据
            const svgData = new XMLSerializer().serializeToString(svgElement);
             vscode.postMessage({
                    command: 'exportSVG',
                    svgContent: svgData
                });
}

async function exportToPng() {
    const svgElement = document.querySelector("#result-mermaid svg");
    if (!svgElement) {
        alert("No diagram to export!");
        return;
    }


    // 使用 html2canvas 捕获整个容器
    const container = document.getElementById("result-mermaid");
    html2canvas(container).then((canvas) => {
        // 导出为 PNG
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        const fileName = \`mermaid-diagram-\${Date.now()}.png\`;
        link.download = fileName;
        link.click();
    }).catch((err) => {
        console.error("Failed to export PNG:", err);
        alert("Failed to export PNG. Please try again.");
    });
}

       

        document.getElementById("export-button").addEventListener("click", exportToPng);
         document.getElementById("export-svg-button").addEventListener("click", exportToSVG);

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

          #export-button {
            margin: 0 10px;
            padding: 4px 10px;
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
         
        }
        #export-svg-button {
            padding: 4px 10px;
            background-color: #007acc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          
        }
            .toolbar {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            justify-content: flex-end;
        }
        
    </style>
</head>
<body>
    <div class="toolbar">
         <button id="export-button">Export as PNG</button>
    <button id="export-svg-button">Export as SVG</button>
    </div>
   
    <div id="mermaid-container">
        ${mermaidContent}
    </div>
    <div id="result-mermaid"></div>
</body>
</html>
    `;
}