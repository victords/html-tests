/* Creating namespace */
var Game = Game || {};

Game.Rectangle = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

Game.GameObject = function(x, y, image, width, height, imgX, imgY) {
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
	this.speed = 7;
	
	this.move = function(xVar, yVar, obst) {
		var x = xVar < 0 ? this.x + xVar : this.x,
			y = yVar < 0 ? this.y + yVar : this.y,
			w = this.width + (xVar < 0 ? -xVar : xVar),
			h = this.height + (yVar < 0 ? -yVar : yVar);
		var moveBounds = new Game.Rectangle(x, y, w, h), collList = [];
		
		for (var i in obst)
			if (Game.Support.intersects(moveBounds, obst[i].bounds))
				collList.push(obst[i]);
		
		if (collList.length > 0) {
			var up = yVar < 0, rt = xVar > 0, dn = yVar > 0, lf = xVar < 0, xLim, yLim;
			if (xVar == 0 || yVar == 0) {
				// Movimento ortogonal
				if (rt) xLim = Game.Support.minProp(collList, "x");
				else if (lf) xLim = Game.Support.maxProp(collList, "x2");
				else if (dn) yLim = Game.Support.minProp(collList, "y");
				else if (up) yLim = Game.Support.maxProp(collList, "y2");
				if (rt && this.x + this.width + xVar > xLim) { this.x = xLim - this.width; xVar = 0; }
				else if (lf && this.x + xVar < xLim) { this.x = xLim; xVar = 0; }
				else if (dn && this.y + this.height + yVar > yLim) { this.y = yLim - this.height; yVar = 0; }
				else if (up && this.y + yVar < yLim) { this.y = yLim; yVar = 0; }
			}
			else {
				// Movimento diagonal
				var xLimDef = this.x + xVar + (rt ? this.width : 0),
					yLimDef = this.y + yVar + (dn ? this.height : 0);
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
						var xTime = 1.0 * (xLim - this.x - (xVar < 0 ? 0 : this.width)) / xVar;
						var yTime = 1.0 * (yLim - this.y - (yVar < 0 ? 0 : this.height)) / yVar;
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
				xVar = yVar = 0;
			}
		}
		this.x += xVar;
		this.y += yVar;
	}
	
	this.update = function() {
	}
	
	this.isVisible = function() {
		var imgX = this.x + this.imgX - Game.Main.camX, imgY = this.y + this.imgY - Game.Main.camY;
		return imgX < Game.Main.SCREEN_WIDTH && imgX + this.image.width > 0 &&
			imgY < Game.Main.SCREEN_HEIGHT && imgY + this.image.height > 0;
	}
	
	this.draw = function() {
		//Game.Main.ctx.globalAlpha = this.alpha;
		Game.Main.ctx.fillRect(this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY, this.width, this.height);
		//Game.Main.ctx.drawImage(this.image, this.x + this.imgX - Game.Main.camX, this.y + this.imgY - Game.Main.camY);
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
