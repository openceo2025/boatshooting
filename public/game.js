// Basic structure for the PlayCanvas game
var canvasContainer = document.getElementById('canvas-container');
var opening = document.getElementById('opening');
var ending = document.getElementById('ending');
var endingVideo = document.getElementById('endingVideo');
var startBtn = document.getElementById('startBtn');
var shareBtn = document.getElementById('shareBtn');
var restartBtn = document.getElementById('restartBtn');
var ranking = document.getElementById('ranking');
var scoreList = document.getElementById('scoreList');
var scoreForm = document.getElementById('scoreForm');
var playerNameInput = document.getElementById('playerName');
var playerScoreInput = document.getElementById('playerScore');
var closeRanking = document.getElementById('closeRanking');
var joystick = document.getElementById('joystick');
var stick = document.getElementById('stick');
var lookArea = document.getElementById('lookArea');
var moveVec = { x: 0, y: 0 };
var lookActive = false;
var lookLastX = 0;
var lookLastY = 0;
var lookStartX = 0;
var lookStartY = 0;
var lookStartTime = 0;
// initialize PlayCanvas application upfront so scripts can be registered
var app = new pc.Application(canvasContainer, {
    mouse: new pc.Mouse(canvasContainer),
    touch: new pc.TouchDevice(canvasContainer)
});
app.keyboard = new pc.Keyboard(window);
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
window.addEventListener('resize', function () {
    app.resizeCanvas();
});
var appStarted = false;

function startGame() {
    opening.style.display = 'none';
    canvasContainer.style.display = 'block';
    joystick.style.display = 'block';
    lookArea.style.display = 'block';
    moveVec.x = 0;
    moveVec.y = 0;

    if (!appStarted) {
        app.start();
        appStarted = true;
    } else {
        app.resizeCanvas();
        while (app.root.children.length > 0) {
            app.root.children[0].destroy();
        }
    }

    // simple scene setup
    var light = new pc.Entity('light');
    light.addComponent('light', {
        type: 'directional',
        color: new pc.Color(1, 1, 1)
    });
    light.setLocalEulerAngles(45, 45, 0);
    app.root.addChild(light);

    var ground = new pc.Entity('ground');
    ground.addComponent('model', { type: 'box' });
    ground.setLocalScale(20, 1, 20);
    ground.setLocalPosition(0, -0.5, 0);
    app.root.addChild(ground);

    // goal area with red floor so the player can easily recognize it
    var goalArea = new pc.Entity('goalArea');
    goalArea.addComponent('model', { type: 'box' });
    goalArea.setLocalScale(2, 0.1, 2);
    goalArea.setLocalPosition(0, 0, -8);
    var red = new pc.StandardMaterial();
    red.diffuse.set(1, 0, 0);
    red.update();
    goalArea.model.material = red;
    app.root.addChild(goalArea);

    var player = new pc.Entity('player');
    player.addComponent('camera', { clearColor: new pc.Color(0.4, 0.45, 0.5) });
    player.addComponent('script');
    // pass the goal area entity to the player controller
    player.script.create('playerControls', { attributes: { goalArea: goalArea } });
    player.setLocalPosition(0, 1, 5);
    app.root.addChild(player);
}

function loadRanking() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../server/get_scores.php', false); // sync
    xhr.send(null);
    if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        scoreList.innerHTML = '';
        data.forEach(function(row, idx) {
            var li = document.createElement('li');
            li.textContent = (idx + 1) + '. ' + row.name + ': ' + row.score;
            scoreList.appendChild(li);
        });
    }
}

function showRanking(score) {
    canvasContainer.style.display = 'none';
    joystick.style.display = 'none';
    lookArea.style.display = 'none';
    ending.style.display = 'none';
    ranking.style.display = 'flex';
    scoreForm.style.display = 'block';
    playerScoreInput.value = score || 0;
    loadRanking();
}

function showEnding() {
    ranking.style.display = 'none';
    ending.style.display = 'flex';
    if (endingVideo) {
        endingVideo.style.display = 'block';
        endingVideo.play().catch(function(){});
    }
}

// player movement and shooting logic
var PlayerControls = pc.createScript('playerControls');

PlayerControls.attributes.add('speed', { type: 'number', default: 4 });
PlayerControls.attributes.add('lookSpeed', { type: 'number', default: 0.2 });
// the area that triggers game clear
PlayerControls.attributes.add('goalArea', { type: 'entity' });

PlayerControls.prototype.initialize = function () {
    this.app.mouse.disableContextMenu();
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    PlayerControls.instance = this;
    this.lastFire = 0;
    this.reachedGoal = false;
};

PlayerControls.prototype.onMouseDown = function (e) {
    if (!pc.Mouse.isPointerLocked()) {
        this.app.mouse.enablePointerLock();
    } else if (e.button === pc.MOUSEBUTTON_LEFT) {
        this.shoot();
    }
};

PlayerControls.prototype.onMouseMove = function (e) {
    if (pc.Mouse.isPointerLocked()) {
        this.look(e.dx, e.dy);
    }
};

PlayerControls.prototype.look = function(dx, dy) {
    this.entity.rotate(0, -dx * this.lookSpeed, 0);
    this.entity.rotateLocal(-dy * this.lookSpeed, 0, 0);
};

PlayerControls.prototype.update = function (dt) {
    var forward = 0;
    var right = 0;
    if (this.app.keyboard.isPressed(pc.KEY_W)) forward += 1;
    if (this.app.keyboard.isPressed(pc.KEY_S)) forward -= 1;
    if (this.app.keyboard.isPressed(pc.KEY_D)) right += 1;
    if (this.app.keyboard.isPressed(pc.KEY_A)) right -= 1;
    forward += -moveVec.y;
    right += moveVec.x;

    var move = new pc.Vec3();
    if (forward !== 0 || right !== 0) {
        var f = this.entity.forward.clone().scale(forward);
        var r = this.entity.right.clone().scale(right);
        move.add2(f, r).normalize().scale(this.speed * dt);
        this.entity.translate(move);
    }

    if (this.goalArea && !this.reachedGoal) {
        var pos = this.entity.getPosition();
        var gPos = this.goalArea.getPosition();
        var gScale = this.goalArea.getLocalScale();
        if (Math.abs(pos.x - gPos.x) < gScale.x / 2 &&
            Math.abs(pos.z - gPos.z) < gScale.z / 2 &&
            pos.y <= gPos.y + 1) {
            this.reachedGoal = true;
            showRanking();
        }
    }
};

PlayerControls.prototype.shoot = function () {
    var bullet = new pc.Entity('bullet');
    bullet.addComponent('model', { type: 'sphere' });
    bullet.setLocalScale(0.1, 0.1, 0.1);
    bullet.setPosition(this.entity.getPosition());
    bullet.setRotation(this.entity.getRotation());
    bullet.addComponent('script');
    bullet.script.create('bulletMover');
    this.app.root.addChild(bullet);
};

var BulletMover = pc.createScript('bulletMover');
BulletMover.attributes.add('speed', { type: 'number', default: 20 });
BulletMover.attributes.add('life', { type: 'number', default: 2 });

BulletMover.prototype.initialize = function () {
    this.elapsed = 0;
};

BulletMover.prototype.update = function (dt) {
    this.entity.translateLocal(0, 0, -this.speed * dt);
    this.elapsed += dt;
    if (this.elapsed > this.life) {
        this.entity.destroy();
    }
};

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
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../server/submit_score.php', false); // sync
    xhr.send(params);
    if (xhr.status === 200) {
        scoreForm.style.display = 'none';
        loadRanking();
    }
});

closeRanking.addEventListener('click', function() {
    showEnding();
});

// joystick control
joystick.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    joystick._startX = t.clientX;
    joystick._startY = t.clientY;
    stick.style.transform = 'translate(0px,0px)';
    moveVec.x = 0;
    moveVec.y = 0;
});

joystick.addEventListener('touchmove', function(e) {
    var t = e.touches[0];
    var dx = t.clientX - joystick._startX;
    var dy = t.clientY - joystick._startY;
    var radius = 40;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) {
        var scale = radius / dist;
        dx *= scale;
        dy *= scale;
    }
    stick.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    moveVec.x = dx / radius;
    moveVec.y = dy / radius;
    e.preventDefault();
});

joystick.addEventListener('touchend', function() {
    moveVec.x = 0;
    moveVec.y = 0;
    stick.style.transform = 'translate(0px,0px)';
});

// look and tap to shoot
lookArea.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    lookActive = true;
    lookLastX = lookStartX = t.clientX;
    lookLastY = lookStartY = t.clientY;
    lookStartTime = Date.now();
});

lookArea.addEventListener('touchmove', function(e) {
    if (!lookActive) return;
    var t = e.touches[0];
    var dx = t.clientX - lookLastX;
    var dy = t.clientY - lookLastY;
    lookLastX = t.clientX;
    lookLastY = t.clientY;
    if (PlayerControls.instance) {
        PlayerControls.instance.look(dx, dy);
    }
    e.preventDefault();
});

lookArea.addEventListener('touchend', function() {
    if (!lookActive) return;
    lookActive = false;
    var dt = Date.now() - lookStartTime;
    var mx = Math.abs(lookLastX - lookStartX);
    var my = Math.abs(lookLastY - lookStartY);
    if (dt < 200 && mx < 5 && my < 5) {
        if (PlayerControls.instance) {
            PlayerControls.instance.shoot();
        }
    }
});

// This would be triggered when the game ends
// showEnding();
