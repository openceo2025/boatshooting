<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boat Shooting Game</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        #canvas-container { width: 100%; height: 100%; display: none; }
        #opening { position: absolute; width: 100%; height: 100%; background: black; color: white; display: flex; justify-content: center; align-items: center; flex-direction: column; }
        #ending { position: absolute; width: 100%; height: 100%; background: black; color: white; display: none; justify-content: center; align-items: center; flex-direction: column; }
    </style>
</head>
<body>
    <div id="opening">
        <h1>Boat Shooting</h1>
        <button id="startBtn">Start Game</button>
    </div>
    <div id="canvas-container"></div>
    <div id="ending">
        <h2>Game Over</h2>
        <button id="shareBtn">Share on Twitter</button>
        <button id="restartBtn">Restart</button>
    </div>

    <script src="https://code.playcanvas.com/playcanvas-stable.min.js"></script>
    <script src="game.js"></script>
</body>
</html>
