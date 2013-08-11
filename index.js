Game.Main = {
	KEYS: { UP: 38, RIGHT: 39, DOWN: 40, LEFT: 37, ENTER: 13 },
	SCREEN_WIDTH: 800,
	SCREEN_HEIGHT: 600,
	TOTAL_IMAGES: 2,
	FRAME_DURATION: 16.6667,
	loaded: 0,
	frame: 0,
	objs: [],
	ramps: [],
	imgs: [],
	keyState: [],
	prevKeyState: [],
	camX: 100,
	camY: 100,	
	keyPressed: function(code) {
		return Game.Main.keyState[code] && !Game.Main.prevKeyState[code];
	},
	keyDown: function(code) {
		return Game.Main.keyState[code];
	},
	keyReleased: function(code) {
		return !Game.Main.keyState[code] && Game.Main.prevKeyState[code];
	},
	loadResources: function() {
		Game.Main.loaded++;
		if (Game.Main.loaded == Game.Main.TOTAL_IMAGES)
			Game.Main.initialize();
	},
	loadImage: function(src) {
		var img = new Image();
		img.onload = Game.Main.loadResources;
		img.src = src;
		Game.Main.imgs.push(img);
	},
	initialize: function() {
		// Initialization
		Game.Main.man = new Game.GameObject(100, 100, Game.Main.imgs[0]);
		Game.Main.objs.push(new Game.GameObject(400, 100, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(398, 102, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(396, 104, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(394, 106, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(392, 108, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(390, 110, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(388, 112, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(386, 114, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(384, 116, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(382, 118, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(380, 120, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(378, 122, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(376, 124, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(374, 126, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(372, 128, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(370, 130, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(368, 132, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(366, 134, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(364, 136, Game.Main.imgs[1]));
		Game.Main.objs.push(new Game.GameObject(362, 138, Game.Main.imgs[1]));
		Game.Main.ramps.push(new Game.Ramp(100, 400, 200, 130, true));
		//Game.Main.objs.push(new Game.GameObject(300, 400, Game.Main.imgs[1], 200, 10));
		Game.Main.ramps.push(new Game.Ramp(300, 400, 200, 250, false));
		//Game.Main.objs.push(new Game.GameObject(100, 400, Game.Main.imgs[1], 200, 10));
		Game.Main.objs.push(new Game.GameObject(100, 530, Game.Main.imgs[1], 200, 10));
		Game.Main.objs.push(new Game.GameObject(290, 540, Game.Main.imgs[1], 10, 120));
		Game.Main.objs.push(new Game.GameObject(300, 650, Game.Main.imgs[1], 200, 10));
		Game.Main.ctx = document.getElementById("screen").getContext("2d");
		Game.Main.ctx.fillStyle = "black";
		Game.Main.ctx.lineWidth = 1;
		Game.Main.ctx.strokeStyle = "black";
		
		// Main loop
		setInterval(function(){
			Game.Main.update();
			Game.Main.draw();
		}, Game.Main.FRAME_DURATION);
		
		// Showing the FPS
		setInterval(function(){
			console.log(Game.Main.frame);
			Game.Main.frame = 0;
		}, 1000);
	},
	update: function() {
		//if (keyPressed(KEYS.UP) || keyPressed(KEYS.RIGHT) || keyPressed(KEYS.DOWN) || keyPressed(KEYS.LEFT))
			//console.log("Iniciou o movimento!");
		var xVar = 0, yVar = 0;
		if (Game.Main.keyDown(Game.Main.KEYS.UP)) yVar = -Game.Main.man.speed;
		if (Game.Main.keyDown(Game.Main.KEYS.RIGHT)) xVar = Game.Main.man.speed;
		if (Game.Main.keyDown(Game.Main.KEYS.DOWN)) yVar = Game.Main.man.speed;
		if (Game.Main.keyDown(Game.Main.KEYS.LEFT)) xVar = -Game.Main.man.speed;
		//if (keyReleased(KEYS.UP) || keyReleased(KEYS.RIGHT) || keyReleased(KEYS.DOWN) || keyReleased(KEYS.LEFT))
			//console.log("Parou o movimento!");		
		Game.Main.man.move(xVar, yVar, Game.Main.objs, Game.Main.ramps);
		
		Game.Main.man.update();
		for (var i in Game.Main.objs)
			Game.Main.objs[i].update();
		
		// Updating camera
		Game.Main.camX = Game.Main.man.x - 350; Game.Main.camY = Game.Main.man.y - 250;
		if (Game.Main.camX < 0) Game.Main.camX = 0; if (Game.Main.camY < 0) Game.Main.camY = 0;
		
		// Updating keyboard
		for (var i in Game.Main.keyState)
			Game.Main.prevKeyState[i] = Game.Main.keyState[i];
		
		Game.Main.frame++;
	},
	draw: function() {
		//Game.Main.ctx.globalAlpha = 1;
		Game.Main.ctx.clearRect(0, 0, Game.Main.SCREEN_WIDTH, Game.Main.SCREEN_HEIGHT);
		Game.Main.ctx.font = "16px Arial";
		Game.Main.ctx.fillText("Jogo Teste", 10, 30);
		Game.Main.man.draw();
		for (var i in Game.Main.objs)
			if (Game.Main.objs[i].isVisible())
				Game.Main.objs[i].draw();
		for (var i in Game.Main.ramps)
			Game.Main.ramps[i].draw();
	}
};

/* Keyboard */
document.onkeydown = function(e) {
	e = e || window.event;
	for (var k in Game.Main.KEYS)
		if (Game.Main.KEYS[k] == e.keyCode) {
			e.preventDefault();
			break;
		}
	Game.Main.keyState[e.keyCode] = true;
};
document.onkeyup = function(e) {
	e = e || window.event;
	Game.Main.keyState[e.keyCode] = false;
};

Game.Main.loadImage("face.png");
Game.Main.loadImage("sphere.png");
