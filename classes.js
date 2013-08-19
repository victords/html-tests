/* Copyright (c) 2013, Victor David Santos
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Victor David Santos nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL VICTOR DAVID SANTOS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *********************************************************************************/

// Creating namespace
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

Game.Elevator = function(x, y, w, h, speed) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.speed = { x: 0, y: 0, m: speed };
	this.point = 0;
	this.moving = false;
	this.passable = true;
	
	this.moveTo = function(x, y, obst) {
		if (!this.moving) {
			var xDist = x - this.x, yDist = y - this.y, freq = this.speed.m / Math.sqrt(xDist * xDist + yDist * yDist);
			this.speed.x = xDist * freq;
			this.speed.y = yDist * freq;
			this.moving = true;
		}
		var xAim = this.x + this.speed.x, yAim = this.y + this.speed.y, passengers = [];
		for (var i in obst)
			if (this.x + this.w > obst[i].x && obst[i].x + obst[i].w > this.x) {
				var foot = obst[i].y + obst[i].h;
				if (foot > this.y - Game.Main.EPSILON && foot < this.y + Game.Main.EPSILON || this.speed.y < 0 && foot < this.y && foot > yAim)
					passengers.push(obst[i]);
			}
		
		if (this.speed.x > 0 && xAim >= x || this.speed.x < 0 && xAim <= x) {
			for (var i in passengers) passengers[i].x += x - this.x;
			this.x = x;
			this.speed.x = 0;
		}
		else {
			for (var i in passengers) passengers[i].x += this.speed.x;
			this.x = xAim;
		}
		if (this.speed.y > 0 && yAim >= y || this.speed.y < 0 && yAim <= y) {
			this.y = y;
			this.speed.y = 0;
		}
		else this.y = yAim;
		for (var i in passengers) passengers[i].y = this.y - passengers[i].h;
		if (this.speed.x == 0 && this.speed.y == 0) this.moving = false;
	};
	this.cycle = function(points, obst) {
		this.moveTo(points[this.point][0], points[this.point][1], obst);
		if (!this.moving) {
			if (this.point == points.length - 1) this.point = 0;
			else this.point++;
		}
	};
	this.isVisible = function() {return true;}
	this.draw = function() {
		Game.Main.ctx.fillRect(this.x - Game.Main.camX, this.y - Game.Main.camY, this.w, this.h);
	}
}

Game.GameObject = function(x, y, image, w, h, imgX, imgY, passable, spriteWidth, spriteHeight, animation, animInterval) {
	this.x = x;
	this.y = y;
	this.image = image;
	this.w = w || image.width;
	this.h = h || image.height;
	this.imgX = imgX || 0;
	this.imgY = imgY || 0;
	this.passable = passable;
	this.speed = { x: 0, y: 0 };
	this.storedForces = { x: 0, y: 0 };
	this.top = this.bottom = this.left = this.right = null;
	this.sprite = { x: 0, y: 0, w: spriteWidth || (image ? image.width : 0), h: spriteHeight || (image ? image.height : 0),
		cols: (spriteWidth ? image.width / spriteWidth : 0) };
	if (animation) this.animation = animation;
	else if (spriteWidth) {
		this.animation = [];
		var total = this.sprite.cols * (image.height / spriteHeight);
		for (var i = 0; i < total; i++)
			this.animation.push(i);
	}
	else this.animation = null;
	
	this.animInterval = animInterval || 8;
	this.animIndex = 0;
	this.animCounter = 0;
	
	this.move = function(forces, obst, ramps) {
		this.top = this.bottom = this.left = this.right = null;
		forces.x += Game.Main.GRAVITY.x; forces.y += Game.Main.GRAVITY.y;
		forces.x += this.storedForces.x; forces.y += this.storedForces.y;
		this.storedForces.x = this.storedForces.y = 0;
		for (var i in obst) {
			var x2 = this.x + this.w, y2 = this.y + this.h, x2o = obst[i].x + obst[i].w, y2o = obst[i].y + obst[i].h;
			if (!obst[i].passable && x2 > obst[i].x - Game.Main.EPSILON && x2 < obst[i].x + Game.Main.EPSILON && y2 > obst[i].y &&
				this.y < y2o && forces.x > 0) { forces.x = 0; this.right = obst[i]; }
			if (!obst[i].passable && this.x > x2o - Game.Main.EPSILON && this.x < x2o + Game.Main.EPSILON && y2 > obst[i].y &&
				this.y < y2o && forces.x < 0) { forces.x = 0; this.left = obst[i]; }
			if (y2 > obst[i].y - Game.Main.EPSILON && y2 < obst[i].y + Game.Main.EPSILON && x2 > obst[i].x &&
				this.x < x2o && forces.y > 0) { forces.y = 0; this.bottom = obst[i]; }
			if (!obst[i].passable && this.y > y2o - Game.Main.EPSILON && this.y < y2o + Game.Main.EPSILON && x2 > obst[i].x &&
				this.x < x2o && forces.y < 0) { forces.y = 0; this.top = obst[i]; }
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
		if (this.animation) {
			this.animCounter++;
			if (this.animCounter == this.animInterval) {
				if (this.animIndex == this.animation.length - 1) this.animIndex = 0;
				else this.animIndex++;
				var index = this.animation[this.animIndex];
				this.sprite.x = (index % this.sprite.cols) * this.sprite.w;
				this.sprite.y = Math.floor(index / this.sprite.cols) * this.sprite.h;
				this.animCounter = 0;
			}
		}
	};
	
	this.isVisible = function() {
		var imgX = this.x + this.imgX - Game.Main.camX, imgY = this.y + this.imgY - Game.Main.camY;
		return imgX < Game.Main.SCREEN_WIDTH && imgX + (this.image ? this.image.width : this.w) > 0 &&
			imgY < Game.Main.SCREEN_HEIGHT && imgY + (this.image ? this.image.height : this.h) > 0;
	};
	
	this.draw = function() {
		Game.Main.ctx.globalAlpha = this.alpha;
		if (this.image) Game.Main.ctx.drawImage(this.image, this.sprite.x, this.sprite.y, this.sprite.w, this.sprite.h,
			this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY, this.sprite.w, this.sprite.h);
		else Game.Main.ctx.fillRect(this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY, this.w, this.h);
	};
};
