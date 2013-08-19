Game.Main = {
	KEYS: { UP: 38, RIGHT: 39, DOWN: 40, LEFT: 37, ENTER: 13 },
	SCREEN_WIDTH: 800,
	SCREEN_HEIGHT: 600,
	TOTAL_IMAGES: 2,
	FRAME_DURATION: 16.6667,
	GRAVITY: { x: 0, y: 1 },
	EPSILON: 0.000001,
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
		Game.Main.man = new Game.GameObject(100, 100, Game.Main.imgs[0], 18, 100, -41, 0, false, 100, 100);
		//Game.Main.man = new Game.GameObject(100, 100, null, 100, 100);
		Game.Main.ramps.push(new Game.Ramp(100, 400, 230, 100, true));
		Game.Main.ramps.push(new Game.Ramp(330, 400, 230, 100, false));
		Game.Main.objs.push(new Game.GameObject(0, 500, null, 660, 10));
		
		Game.Main.objs.push(new Game.GameObject(600, 150, null, 45, 33));
		Game.Main.objs.push(new Game.GameObject(645, 120, null, 100, 10));
		Game.Main.objs.push(new Game.GameObject(600, 190, null, 28, 136));
		Game.Main.objs.push(new Game.GameObject(790, -400, null, 10, 1000));
		Game.Main.objs.push(new Game.GameObject(-10, -400, null, 10, 1000));
		Game.Main.objs.push(new Game.GameObject(0, 590, null, 790, 10));
		
		Game.Main.objs.push(new Game.GameObject(275, 300, null, 110, 10, 0, 0, true));
		
		Game.Main.el = new Game.Elevator(0, 0, 100, 20, 7);
		Game.Main.objs.push(Game.Main.el);
		
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
		var forces = { x: 0, y: 0 };
		if (Game.Main.keyDown(Game.Main.KEYS.UP) && Game.Main.man.bottom)
			forces.y = -20;
		//if (Game.Main.keyDown(Game.Main.KEYS.UP)) forces.y = -0.4;
		if (Game.Main.keyDown(Game.Main.KEYS.RIGHT)) forces.x = 0.4;
		//if (Game.Main.keyDown(Game.Main.KEYS.DOWN)) forces.y = 0.4;
		if (Game.Main.keyDown(Game.Main.KEYS.LEFT)) forces.x = -0.4;
		
		Game.Main.man.move(forces, Game.Main.objs, Game.Main.ramps);
		
		Game.Main.man.update();
		Game.Main.el.cycle([[100, 100], [180, 500], [0, 0]], [Game.Main.man]);
		
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
		Game.Main.el.draw();
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
