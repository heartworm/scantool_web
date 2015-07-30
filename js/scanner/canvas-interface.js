angular.module("scannerApp").factory("CanvasInterface", function() {
	
	function CanvasInterface(canvas, image) {
		this.canvas = canvas;
		this.loadImage(image);
	}
	
	CanvasInterface.prototype.loadImage = function(img) {
		this.scanImg = img;
		this.dispCorners = [[0, 0], [0, 0], [0, 0], [0, 0]]; //(x,y): tl, tr, br, bl
		var dispAR = this.scanImg.getHeight() / this.scanImg.getWidth();
		if ((dispAR * this.canvas.width) > this.canvas.height) { 
			// if expanding the wide image to fit the width of the port causes the height to overflow
			// just expand to fit the height. 
			// TODO: Could probably somehow compare aspect ratios to achieve same thing
			this.dispScale = this.canvas.height / this.scanImg.getHeight();
			this.dispH = this.canvas.height;
			this.dispW = this.scanImg.getWidth() * this.dispScale;
			this.dispY = 0;
			this.dispX = (this.canvas.width - this.dispW) / 2;
		} else  {
			this.dispScale = this.canvas.width / this.scanImg.getWidth();
			this.dispW = this.canvas.width;
			this.dispH = this.scanImg.getHeight() * this.dispScale;
			this.dispX = 0;
			this.dispY = (this.canvas.height - this.dispH) / 2;
		}
		this.readCorners();
	}

	CanvasInterface.prototype.readCorners = function() {
		this.dispCorners[0] = [this.dispX + (this.dispScale * this.scanImg.corners.tlx),
							   this.dispY + (this.dispScale * this.scanImg.corners.tly)];
		this.dispCorners[1] = [this.dispX + (this.dispScale * this.scanImg.corners.trx),  this.dispY + (this.dispScale * this.scanImg.corners.try)];
		this.dispCorners[3] = [this.dispX + (this.dispScale * this.scanImg.corners.blx),  this.dispY + (this.dispScale * this.scanImg.corners.bly)];
		this.dispCorners[2] = [this.dispX + (this.dispScale * this.scanImg.corners.brx),  this.dispY + (this.dispScale * this.scanImg.corners.bry)];
		this.redraw();
	}

	CanvasInterface.prototype.writeCorners = function() {
		this.scanImg.corners = {
			tlx: (this.dispCorners[0][0] - this.dispX) / this.dispScale, tly: (this.dispCorners[0][1] - this.dispY) / this.dispScale,
			trx: (this.dispCorners[1][0] - this.dispX) / this.dispScale, try: (this.dispCorners[1][1] - this.dispY) / this.dispScale,
			brx: (this.dispCorners[2][0] - this.dispX) / this.dispScale, bry: (this.dispCorners[2][1] - this.dispY) / this.dispScale,
			blx: (this.dispCorners[3][0] - this.dispX) / this.dispScale, bly: (this.dispCorners[3][1] - this.dispY) / this.dispScale
		}
	}
	
	CanvasInterface.prototype.redraw = function() {
		//console.log(this.dispCorners);
		var ctx = this.canvas.getContext("2d");
		
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		var outline = new Path2D();
		var circles = [];
		ctx.drawImage(this.scanImg.imgElem, this.dispX, this.dispY, this.dispW, this.dispH);
		ctx.strokeStyle = "red";
		var circleFills = ["rgb(51, 122, 183)", "rgb(92, 184, 92)", "rgb(91, 192, 222)", "rgb(255, 255, 255)"];
		ctx.lineWidth=5;
		
		for (var i = 0; i < this.dispCorners.length; i++) {
			var x = this.dispCorners[i][0];
			var y = this.dispCorners[i][1];
			
			var nx = i+1 >= this.dispCorners.length ? this.dispCorners[0][0] : this.dispCorners[i+1][0];
			var ny = i+1 >= this.dispCorners.length ? this.dispCorners[0][1] : this.dispCorners[i+1][1];
			
			circles[i] = new Path2D();
			
			circles[i].arc(x, y, 15, 0, Math.PI*2, false);
			
			outline.moveTo(x, y);
			outline.lineTo(nx, ny);
		}
		
		ctx.stroke(outline);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 3;
		for (var i = 0; i < circles.length; i++) {
			ctx.fillStyle = circleFills[i];
			ctx.fill(circles[i]);
			ctx.stroke(circles[i]);
		}
	}
	
	CanvasInterface.prototype.onClick = function(corner, x, y) { //returns whether click resulted in a change or not
		//console.log("x: " + (this.dispX) + ", y:" + (this.dispY));
		if (x < this.dispX || x > (this.dispX + this.dispW) ||
				y < this.dispY || y > (this.dispY + this.dispH)) {
			return false;
		}
		
		var newcorners = [x, y];
		switch (corner) {
			case "tl":
				this.dispCorners[0] = newcorners;
				break;
			case "tr":
				this.dispCorners[1] = newcorners;
				break;
			case "br":
				this.dispCorners[2] = newcorners;
				break;
			case "bl":
				this.dispCorners[3] = newcorners;
				break;
		}	
		
		this.writeCorners();	
		this.redraw();
		return true;
	}
	
	return CanvasInterface;
	
});