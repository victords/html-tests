Game.Main = {
	KEYS: { UP: 38, RIGHT: 39, DOWN: 40, LEFT: 37, ENTER: 13 },
	SCREEN_WIDTH: 800,
	SCREEN_HEIGHT: 600,
	TOTAL_IMAGES: 6,
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
		Game.Main.man = new Game.GameObject(100, 100, Game.Main.imgs[0], 16, 100, -42, 0, [0, 1, 2, 1, 0, 3, 4, 3]);
		Game.Main.ramps.push(new Game.Ramp(100, 500, 20, 15, true));
		Game.Main.ramps.push(new Game.Ramp(120, 488, 20, 12, true));
		Game.Main.ramps.push(new Game.Ramp(140, 478, 20, 10, true));
		Game.Main.ramps.push(new Game.Ramp(160, 470, 20, 8, true));
		Game.Main.ramps.push(new Game.Ramp(180, 464, 20, 6, true));
		Game.Main.ramps.push(new Game.Ramp(200, 461, 20, 3, true));
		Game.Main.ramps.push(new Game.Ramp(220, 460, 20, 1, true));
		Game.Main.ramps.push(new Game.Ramp(240, 460, 20, 1, false));
		Game.Main.ramps.push(new Game.Ramp(260, 461, 20, 3, false));
		Game.Main.ramps.push(new Game.Ramp(280, 464, 20, 6, false));
		Game.Main.ramps.push(new Game.Ramp(300, 470, 20, 8, false));
		Game.Main.ramps.push(new Game.Ramp(320, 478, 20, 10, false));
		Game.Main.ramps.push(new Game.Ramp(340, 488, 20, 12, false));
		Game.Main.ramps.push(new Game.Ramp(360, 500, 20, 15, false));
		Game.Main.objs.push(new Game.GameObject(0, 515, null, 480, 10));
		Game.Main.objs.push(new Game.GameObject(120, 500, null, 240, 15));
		Game.Main.objs.push(new Game.GameObject(140, 488, null, 200, 12));
		Game.Main.objs.push(new Game.GameObject(160, 478, null, 160, 10));
		Game.Main.objs.push(new Game.GameObject(180, 470, null, 120, 8));
		Game.Main.objs.push(new Game.GameObject(200, 464, null, 80, 6));
		Game.Main.objs.push(new Game.GameObject(220, 461, null, 40, 3));
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
Game.Main.loadImage("face-l1.png");
Game.Main.loadImage("face-l2.png");
Game.Main.loadImage("face-r1.png");
Game.Main.loadImage("face-r2.png");
Game.Main.loadImage("sphere.png");
