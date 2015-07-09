angular.module("scannerApp").factory("CanvasInterface", function() {
	
	function CanvasInterface(canvas, image) {
		this.canvas = canvas;
		this.loadImage(image);
	}
	
	CanvasInterface.prototype.loadImage = function(img) {
		this.scanImg = img;
		this.dispCorners = [[0, 0], [0, 0], [0, 0], [0, 0]]; //(x,y): tl, tr, bl, br
		var dispAR = this.scanImg.getHeight() / this.scanImg.getWidth();
		if ((dispAR * this.canvas.width) > this.canvas.height) {
			this.dispScale = this.canvas.height / this.scanImg.getHeight();
			this.dispH = this.canvas.height;
			this.dispW = this.scanImg.getWidth() * this.dispScale;
			this.dispY = 0;
			this.dispX = (this.canvas.width / 2) - (this.dispW / 2);
		} else  {
			this.dispScale = this.canvas.width / this.scanImg.getWidth();
			this.dispW = this.canvas.width;
			this.dispH = this.scanImg.getHeight() * this.dispScale;
			this.dispX = 0;
			this.dispY = (this.canvas.height / 2) - (this.dispH / 2);
		}
		this.redraw();
	}

	CanvasInterface.prototype.readCorners = function() {
		this.dispCorners[0] = [dispX + (dispScale * this.scanImg.corners.tlx),  dispY + (dispScale * this.scanImg.corners.tly)];
		this.dispCorners[1] = [dispX + (dispScale * this.scanImg.corners.trx),  dispY + (dispScale * this.scanImg.corners.try)];
		this.dispCorners[2] = [dispX + (dispScale * this.scanImg.corners.blx),  dispY + (dispScale * this.scanImg.corners.bly)];
		this.dispCorners[3] = [dispX + (dispScale * this.scanImg.corners.brx),  dispY + (dispScale * this.scanImg.corners.bry)];
		this.redraw();
	}

	CanvasInterface.prototype.writeCorners = function() {
		this.scanImg.corners = {
			tlx: (dispCorners[0][0] - dispX) / dispScale, tly: (dispCorners[0][1] - dispY) / dispScale,
			trx: (dispCorners[1][0] - dispX) / dispScale, try: (dispCorners[1][1] - dispY) / dispScale,
			blx: (dispCorners[2][0] - dispX) / dispScale, bly: (dispCorners[2][1] - dispY) / dispScale,
			brx: (dispCorners[3][0] - dispX) / dispScale, bry: (dispCorners[3][1] - dispY) / dispScale
		}
	}
	
	CanvasInterface.prototype.redraw = function() {
		var ctx = this.canvas.getContext("2d");
		ctx.drawImage(this.scanImg.imgElem, this.dispX, this.dispY, this.dispW, this.dispH);
	}
	
	return CanvasInterface;
	
});