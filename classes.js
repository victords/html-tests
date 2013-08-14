/* Creating namespace */
var Game = Game || {};

Game.Rectangle = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	
	this.intersects = function(other) {
		return this.x < other.x + other.w && this.x + this.w > other.x && this.y < other.y + other.h && this.y + this.h > other.y;
	};
};

Game.Ramp = function(x, y, w, h, left) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	// Indicates whether the ramp raises from left to right
	this.left = left;
	
	this.intersects = function(obj) {
		return obj.x + obj.w > this.x && obj.x < this.x + this.w && obj.y > this.getY(obj) && obj.y <= this.y + this.h - obj.h;
	};
	this.isBelow = function(obj) {
		return obj.x + obj.w > this.x && obj.x < this.x + this.w && obj.y == this.getY(obj);
	};
	this.getY = function(obj) {
		if (this.left && obj.x + obj.w > this.x + this.w) return this.y - obj.h;
		else if (this.left) return this.y + (1.0 * (this.x + this.w - obj.x - obj.w) * this.h / this.w) - obj.h;
		else if (obj.x < this.x) return this.y - obj.h;
		else return this.y + (1.0 * (obj.x - this.x) * this.h / this.w) - obj.h;
	};
	this.draw = function() {
		Game.Main.ctx.beginPath();
		Game.Main.ctx.moveTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x : this.x + this.w) - Game.Main.camX, this.y + this.h - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y + this.h - Game.Main.camY);
		Game.Main.ctx.lineTo((this.left ? this.x + this.w : this.x) - Game.Main.camX, this.y - Game.Main.camY);
		Game.Main.ctx.stroke();
	};
};

Game.GameObject = function(x, y, image, w, h, imgX, imgY, passable, animation) {
	this.x = x;
	this.y = y;
	this.image = image;
	this.w = w || image.w;
	this.h = h || image.h;
	this.imgX = imgX || 0;
	this.imgY = imgY || 0;
	this.passable = passable;
	this.speed = { x: 0, y: 0 };
	this.storedForces = { x: 0, y: 0 };
	this.top = this.bottom = this.left = this.right = null;
	this.animation = animation;
	this.animIndex = 0;
	this.animCounter = 0;
	
	this.move = function(forces, obst, ramps) {
		this.top = this.bottom = this.left = this.right = null;
		forces.x += Game.Main.GRAVITY.x; forces.y += Game.Main.GRAVITY.y;
		forces.x += this.storedForces.x; forces.y += this.storedForces.y;
		this.storedForces.x = this.storedForces.y = 0;
		for (var i in obst) {
			if (!obst[i].passable && this.x + this.w == obst[i].x && this.y + this.h > obst[i].y &&
				this.y < obst[i].y + obst[i].h && forces.x > 0) { forces.x = 0; this.right = obst[i]; }
			if (!obst[i].passable && this.x == obst[i].x + obst[i].w && this.y + this.h > obst[i].y &&
				this.y < obst[i].y + obst[i].h && forces.x < 0) { forces.x = 0; this.left = obst[i]; }
			if (this.y + this.h == obst[i].y && this.x + this.w > obst[i].x &&
				this.x < obst[i].x + obst[i].w && forces.y > 0) { forces.y = 0; this.bottom = obst[i]; }
			if (!obst[i].passable && this.y == obst[i].y + obst[i].h && this.x + this.w > obst[i].x &&
				this.x < obst[i].x + obst[i].w && forces.y < 0) { forces.y = 0; this.top = obst[i]; }
		}
		if (forces.y > 0) {
			for (var i in ramps)
				if (ramps[i].isBelow(this))
					{ forces.y = 0; this.bottom = ramps[i]; break; }
		}
		
		this.speed.x += forces.x; this.speed.y += forces.y;
		
		var x = this.speed.x < 0 ? this.x + this.speed.x : this.x,
			y = this.speed.y < 0 ? this.y + this.speed.y : this.y,
			w = this.w + (this.speed.x < 0 ? -this.speed.x : this.speed.x),
			h = this.h + (this.speed.y < 0 ? -this.speed.y : this.speed.y);
		var moveBounds = new Game.Rectangle(x, y, w, h), collList = [];
		for (var i in obst) {
			if (moveBounds.intersects(new Game.Rectangle(obst[i].x, obst[i].y, obst[i].w, obst[i].h)))
				collList.push(obst[i]);
		}
		
		if (collList.length > 0) {
			var up = this.speed.y < 0, rt = this.speed.x > 0, dn = this.speed.y > 0, lf = this.speed.x < 0, xLim, yLim;
			if (this.speed.x == 0 || this.speed.y == 0) {
				// Ortogonal
				if (rt) xLim = this.findRightLimit(collList);
				else if (lf) xLim = this.findLeftLimit(collList);
				else if (dn) yLim = this.findDownLimit(collList);
				else if (up) yLim = this.findUpLimit(collList);
				if (rt && this.x + this.w + this.speed.x > xLim) { this.x = xLim - this.w; this.speed.x = 0; }
				else if (lf && this.x + this.speed.x < xLim) { this.x = xLim; this.speed.x = 0; }
				else if (dn && this.y + this.h + this.speed.y > yLim) { this.y = yLim - this.h; this.speed.y = 0; }
				else if (up && this.y + this.speed.y < yLim) { this.y = yLim; this.speed.y = 0; }
			}
			else {
				// Diagonal
				var xAim = this.x + this.speed.x + (rt ? this.w : 0), xLimDef = xAim,
					yAim = this.y + this.speed.y + (dn ? this.h : 0), yLimDef = yAim;
				for (var i in collList) {
					if (collList[i].passable) xLim = xAim;
					else if (rt) xLim = collList[i].x;
					else xLim = collList[i].x + collList[i].w;
					if (dn) yLim = collList[i].y;
					else if (collList[i].passable) yLim = yAim;
					else yLim = collList[i].y + collList[i].h;
					
					if (collList[i].passable) {
						if (dn && this.y + this.h <= yLim && yLim < yLimDef) yLimDef = yLim;
					}
					else if (rt && this.x + this.w > xLim || lf && this.x < xLim) {
						// Can't limit by x, will limit by y
						if (dn && yLim < yLimDef || up && yLim > yLimDef) yLimDef = yLim;
					}
					else if (dn && this.y + this.h > yLim || up && this.y < yLim) {
						// Can't limit by y, will limit by x 
						if (rt && xLim < xLimDef || lf && xLim > xLimDef) xLimDef = xLim;
					}
					else {
						var xTime = 1.0 * (xLim - this.x - (this.speed.x < 0 ? 0 : this.w)) / this.speed.x;
						var yTime = 1.0 * (yLim - this.y - (this.speed.y < 0 ? 0 : this.h)) / this.speed.y;
						if (xTime > yTime) {
							// Will limit by x
							if (rt && xLim < xLimDef || lf && xLim > xLimDef) xLimDef = xLim;
						}
						else {
							// Will limit by y
							if (dn && yLim < yLimDef || up && yLim > yLimDef) yLimDef = yLim;
						}
					}
				}
				if (xLimDef != xAim) {
					this.speed.x = 0;
					if (lf) this.x = xLimDef;
					else this.x = xLimDef - this.w;
				}
				if (yLimDef != yAim) {
					this.speed.y = 0;
					if (up) this.y = yLimDef;
					else this.y = yLimDef - this.h;
				}
			}
		}
		this.x += this.speed.x;
		this.y += this.speed.y;
		
		for (var i in ramps)
			if (ramps[i].intersects(this))
				{ this.y = ramps[i].getY(this); this.speed.y = 0; }
	};
	this.findRightLimit = function(collList) {
		var limit = this.x + this.w + this.speed.x;
		for (var i in collList)
			if (!collList[i].passable && collList[i].x < limit)
				limit = collList[i].x;
		return limit;
	};
	this.findLeftLimit = function(collList) {
		var limit = this.x + this.speed.x;
		for (var i in collList)
			if (!collList[i].passable && collList[i].x + collList[i].w > limit)
				limit = collList[i].x + collList[i].w;
		return limit;
	};
	this.findDownLimit = function(collList) {
		var limit = collList[0].y;
		for (var i = 1; i < collList.length; i++)
			if (collList[i].y < limit)
				limit = collList[i].y;
		return limit;
	};
	this.findUpLimit = function(collList) {
		var limit = this.y + this.speed.y;
		for (var i in collList)
			if (!collList[i].passable && collList[i].y + collList[i].h > limit)
				limit = collList[i].y + collList[i].h;
		return limit;
	};
	
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
	};
	
	this.isVisible = function() {
		var imgX = this.x + this.imgX - Game.Main.camX, imgY = this.y + this.imgY - Game.Main.camY;
		return imgX < Game.Main.SCREEN_WIDTH && imgX + (this.image ? this.image.w : this.w) > 0 &&
			imgY < Game.Main.SCREEN_HEIGHT && imgY + (this.image ? this.image.h : this.h) > 0;
	};
	
	this.draw = function() {
		Game.Main.ctx.globalAlpha = this.alpha;
		if (this.image) Game.Main.ctx.drawImage(this.image, this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY);
		else Game.Main.ctx.fillRect(this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY, this.w, this.h);
	};
};
