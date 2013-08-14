/* Creating namespace */
var Game = Game || {};

Game.Rectangle = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Game.Ramp = function(x, y, w, h, left) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	// Indicates whether the ramp raises from left to right
	this.left = left;
	
	this.intersects = function(obj) {
		return obj.x + obj.width > this.x && obj.x < this.x + this.w && obj.y > this.getY(obj) && obj.y <= this.y + this.h - obj.height;
	}
	this.getY = function(obj) {
		if (this.left && obj.x + obj.width > this.x + this.w) return this.y - obj.height;
		else if (this.left) return this.y + (1.0 * (this.x + this.w - obj.x - obj.width) * this.h / this.w) - obj.height;
		else if (obj.x < this.x) return this.y - obj.height;
		else return this.y + (1.0 * (obj.x - this.x) * this.h / this.w) - obj.height;
	}
	this.draw = function() {
		Game.Main.ctx.beginPath();
		Game.Main.ctx.moveTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x : this.x + this.w) - Game.Main.camX, this.y + this.h - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y + this.h - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y - Game.Main.camY);
		Game.Main.ctx.stroke();
	}
}

Game.GameObject = function(x, y, image, width, height, imgX, imgY, animation) {
	this.x = x;
	this.y = y;
	this.image = image;
	this.width = width || image.width;
	this.x2 = this.x + this.width;
	this.height = height || image.height;
	this.y2 = this.y + this.height;
	this.imgX = imgX || 0;
	this.imgY = imgY || 0;
	this.bounds = new Game.Rectangle(this.x, this.y, this.width, this.height);
	this.speed = { x: 0, y: 0 };
	this.storedForces = { x: 0, y: 0 };
	this.top = this.bottom = this.left = this.right = null;
	this.animation = animation;
	this.animIndex = 0;
	this.animCounter = 0;
	
	this.move = function(forces, obstacles, ramps) {
		this.top = this.bottom = this.left = this.right = null;
		forces.x += Game.Main.GRAVITY.x; forces.y += Game.Main.GRAVITY.y;
		forces.x += this.storedForces.x; forces.y += this.storedForces.y;
		this.storedForces.x = this.storedForces.y = 0;
		this.speed.x += forces.x; this.speed.y += forces.y;
		for (var i in obstacles) {
			if (this.x + this.width == obstacles[i].x && this.y + this.height > obstacles[i].y &&
				this.y < obstacles[i].y + obstacles[i].height && this.speed.x > 0) { this.speed.x = 0; this.right = obstacles[i]; }
			if (this.x == obstacles[i].x + obstacles[i].width && this.y + this.height > obstacles[i].y &&
				this.y < obstacles[i].y + obstacles[i].height && this.speed.x < 0) { this.speed.x = 0; this.left = obstacles[i]; }
			if (this.y + this.height == obstacles[i].y && this.x + this.width > obstacles[i].x &&
				this.x < obstacles[i].x + obstacles[i].width && this.speed.y > 0) { this.speed.y = 0; this.bottom = obstacles[i]; }
			if (this.y == obstacles[i].y + obstacles[i].height && this.x + this.width > obstacles[i].x &&
				this.x < obstacles[i].x + obstacles[i].width && this.speed.y < 0) { this.speed.y = 0; this.top = obstacles[i]; }
		}
		
		var x = this.speed.x < 0 ? this.x + this.speed.x : this.x,
			y = this.speed.y < 0 ? this.y + this.speed.y : this.y,
			w = this.width + (this.speed.x < 0 ? -this.speed.x : this.speed.x),
			h = this.height + (this.speed.y < 0 ? -this.speed.y : this.speed.y);
		var moveBounds = new Game.Rectangle(x, y, w, h), collList = [];
		for (var i in obstacles) {
			if (Game.Support.intersects(moveBounds, obstacles[i].bounds))
				collList.push(obstacles[i]);
		}
		
		if (collList.length > 0) {
			var up = this.speed.y < 0, rt = this.speed.x > 0, dn = this.speed.y > 0, lf = this.speed.x < 0, xLim, yLim;
			if (this.speed.x == 0 || this.speed.y == 0) {
				// Movimento ortogonal
				if (rt) xLim = Game.Support.minProp(collList, "x");
				else if (lf) xLim = Game.Support.maxProp(collList, "x2");
				else if (dn) yLim = Game.Support.minProp(collList, "y");
				else if (up) yLim = Game.Support.maxProp(collList, "y2");
				if (rt && this.x + this.width + this.speed.x > xLim) { this.x = xLim - this.width; this.speed.x = 0; }
				else if (lf && this.x + this.speed.x < xLim) { this.x = xLim; this.speed.x = 0; }
				else if (dn && this.y + this.height + this.speed.y > yLim) { this.y = yLim - this.height; this.speed.y = 0; }
				else if (up && this.y + this.speed.y < yLim) { this.y = yLim; this.speed.y = 0; }
			}
			else {
				// Movimento diagonal
				var xLimDef = this.x + this.speed.x + (rt ? this.width : 0),
					yLimDef = this.y + this.speed.y + (dn ? this.height : 0);
				for (var i in collList) {
					if (rt) xLim = collList[i].x;
					else xLim = collList[i].x2;
					if (dn) yLim = collList[i].y;
					else yLim = collList[i].y2;
					
					if (rt && this.x + this.width > xLim || lf && this.x < xLim) {
						// Sem chance de limitar x, limitando y
						if (dn && yLim < yLimDef || up && yLim > yLimDef) yLimDef = yLim;
					}
					else if (dn && this.y + this.height > yLim || up && this.y < yLim) {
						// Sem chance de limitar y, limitando x
						if (rt && xLim < xLimDef || lf && xLim > xLimDef) xLimDef = xLim;
					}
					else {
						var xTime = 1.0 * (xLim - this.x - (this.speed.x < 0 ? 0 : this.width)) / this.speed.x;
						var yTime = 1.0 * (yLim - this.y - (this.speed.y < 0 ? 0 : this.height)) / this.speed.y;
						if (xTime > yTime) {
							// Limitando x
							if (rt && xLim < xLimDef || lf && xLim > xLimDef) xLimDef = xLim;
						}
						else {
							// Limitando y
							if (dn && yLim < yLimDef || up && yLim > yLimDef) yLimDef = yLim;
						}
					}
				}
				if (lf) this.x = xLimDef;
				else this.x = xLimDef - this.width;
				if (up) this.y = yLimDef;
				else this.y = yLimDef - this.height;
				this.speed.x = this.speed.y = 0;
			}
		}
		this.x += this.speed.x;
		this.y += this.speed.y;
		
		for (var i in ramps)
			if (ramps[i].intersects(this))
				{ this.y = ramps[i].getY(this); this.bottom = ramps[i]; }
	}
	
	this.update = function() {
		this.animCounter++;
		if (this.animCounter == 7) {
			if (this.animation) {
				if (this.animIndex == this.animation.length - 1) this.animIndex = 0;
				else this.animIndex++;
				this.image = Game.Main.imgs[this.animation[this.animIndex]];
			}
			this.animCounter = 0;
		}
	}
	
	this.isVisible = function() {
		var imgX = this.x + this.imgX - Game.Main.camX, imgY = this.y + this.imgY - Game.Main.camY;
		return imgX < Game.Main.SCREEN_WIDTH && imgX + (this.image ? this.image.width : this.width) > 0 &&
			imgY < Game.Main.SCREEN_HEIGHT && imgY + (this.image ? this.image.height : this.height) > 0;
	}
	
	this.draw = function() {
		Game.Main.ctx.globalAlpha = this.alpha;
		if (this.image) Game.Main.ctx.drawImage(this.image, this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY);
		else Game.Main.ctx.fillRect(this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY, this.width, this.height);
	}
};

Game.Support = {
	intersects: function(a, b) {
		return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
	},
	minProp: function(objs, prop) {
		var min = objs[0][prop];
		for (var i = 1; i < objs.length; i++)
			if (objs[i][prop] < min) min = objs[i][prop];
		return min;
	},
	maxProp: function(objs, prop) {
		var max = objs[0][prop];
		for (var i = 1; i < objs.length; i++)
			if (objs[i][prop] > max) max = objs[i][prop];
		return max;
	}
};
