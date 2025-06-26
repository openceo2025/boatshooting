// Basic structure for the PlayCanvas game
var canvasContainer = document.getElementById('canvas-container');
var opening = document.getElementById('opening');
var ending = document.getElementById('ending');
var startBtn = document.getElementById('startBtn');
var shareBtn = document.getElementById('shareBtn');
var restartBtn = document.getElementById('restartBtn');
var ranking = document.getElementById('ranking');
var scoreList = document.getElementById('scoreList');
var scoreForm = document.getElementById('scoreForm');
var playerNameInput = document.getElementById('playerName');
var playerScoreInput = document.getElementById('playerScore');
var closeRanking = document.getElementById('closeRanking');
var app;

function startGame() {
    opening.style.display = 'none';
    canvasContainer.style.display = 'block';

    app = new pc.Application(canvasContainer, {
        mouse: new pc.Mouse(canvasContainer),
        touch: new pc.TouchDevice(canvasContainer)
    });
    app.start();

    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    window.addEventListener('resize', function () {
        app.resizeCanvas();
    });

    // Placeholder for loading FPS Starter Kit
    // Here you would load PlayCanvas assets and scripts
    // such as the FPS starter kit, scenes, and player controls.

    // Example placeholder entity
    var box = new pc.Entity('box');
    box.addComponent('model', { type: 'box' });
    app.root.addChild(box);
    box.setLocalPosition(0, 0, 0);
}

function loadRanking() {
    fetch('../server/get_scores.php')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            scoreList.innerHTML = '';
            data.forEach(function(row) {
                var li = document.createElement('li');
                li.textContent = row.name + ': ' + row.score;
                scoreList.appendChild(li);
            });
        });
}

function showEnding(score) {
    canvasContainer.style.display = 'none';
    ending.style.display = 'flex';
    ranking.style.display = 'flex';
    playerScoreInput.value = score || 0;
    loadRanking();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', function() {
    ending.style.display = 'none';
    ranking.style.display = 'none';
    startGame();
});
shareBtn.addEventListener('click', function() {
    var text = encodeURIComponent('I just played Boat Shooting!');
    var url = encodeURIComponent(window.location.href);
    window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url,
        '_blank');
});

scoreForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var params = new URLSearchParams();
    params.append('name', playerNameInput.value);
    params.append('score', playerScoreInput.value);
    fetch('../server/submit_score.php', {
        method: 'POST',
        body: params
    }).then(function() {
        loadRanking();
    });
});

closeRanking.addEventListener('click', function() {
    ranking.style.display = 'none';
});

// This would be triggered when the game ends
// showEnding();
