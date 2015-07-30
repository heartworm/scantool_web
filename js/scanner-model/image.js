angular.module("scannerModel").factory("ScanImage", function(Status) { 
	var MAXW = 2480;
	var MAXH = 3508;
	
	//Factory, runs passed function then returned value is issued as a singleton to dependency injector
	//In this case the singleton is a constructor (of a class), so our classes can be defined within a module namespace

	function ScanImage(fileIn, id, cb) {
		this.id = id;		
		this.updateCb = cb;		
		
		this.fileName = fileIn.name;
		this.dateModified = fileIn.lastModifiedDate;
		this.imageLoadStatus = Status.INITIAL;
		this.imageLoadReason = "";

		// TEMP ITEMS DURING LOAD
		this.fileReader = new FileReader();
		this.fileReader.onerror = $.proxy(this.onReadError, this);
		this.fileReader.onload = $.proxy(this.onReadLoad, this);

		this.imgElem = new Image();
		this.imgElem.onload = $.proxy(this.onImageLoad, this);
		this.imgElem.onerror = $.proxy(this.onImageError, this);
		//END	
		
		this.deskewImgElem = null;
		this.deskewStatus = Status.INITIAL;
		
		this.cornersStatus = Status.INITIAL;
		this.cornersErr = "";
		
		this.fileReader.readAsDataURL(fileIn);	

	}

	//Loading Callbacks

	ScanImage.prototype.onReadError = function() {
		this.imageLoadStatus = Status.FAILED;
		this.imageLoadReason = this.fileReader.error.name;

		//delete this.img;
		delete this.fileReader;
		this.onUpdate();
	};

	ScanImage.prototype.onReadLoad = function() {
		this.imageLoadStatus = Status.PROCESSING;
		this.imgElem.src = this.fileReader.result;
		this.onUpdate();
	};

	ScanImage.prototype.onImageLoad = function() {
		this.corners = {
			tlx: 0, tly: 0,
			trx: this.getWidth(), try: 0,
			blx: 0, bly: this.getHeight(),
			brx: this.getWidth(), bry: this.getHeight()
		};
		this.imageLoadStatus = Status.SUCCESS;

		//Cleanup
		//delete this.img;
		delete this.fileReader;
		this.onUpdate();
	};
	

	ScanImage.prototype.onImageError  = function() {
		this.imageLoadStatus = Status.FAILED;
		this.imageLoadReason = "Could not read file into image.";

		//delete this.img;
		delete this.fileReader;
		this.onUpdate();
	};

	ScanImage.prototype.onUpdate = function() {
		if (typeof this.updateCb === "function") {
			this.updateCb();
		}
	}
	
	ScanImage.prototype.setDeskewImg = function(dataURL) {
		var self = this;
		this.deskewImgElem = new Image();
		this.deskewImgElem.onload = function() {
			self.onUpdate();
			self.deskewStatus = Status.SUCCESS;	
		};
		this.deskewImgElem.onerror = function() {
			self.deskewStatus = Status.FAILED;
		};
		this.deskewImgElem.src = dataURL;
	}
	
	ScanImage.prototype.getImageData = function() { 
		var cnv = document.createElement("canvas");
		cnv.height = this.getHeight();
		cnv.width = this.getWidth();
		var ctx = cnv.getContext("2d");
		ctx.drawImage(this.imgElem, 0, 0, this.getWidth(), this.getHeight());
		var out = ctx.getImageData(0, 0, this.getWidth(), this.getHeight()).data.buffer;
		return out;
	}

	ScanImage.prototype.getThumbnailURI = function() {
		if (this.thumbnailURI !== undefined) return this.thumbnailURI;
		else {
			var ar = this.getHeight() / this.getWidth();
			var cnv = document.createElement("canvas");
			if (ar > 1) {
				cnv.width = 150;
				cnv.height = Math.round(150 / ar);
			} else {
				cnv.height = 150;
				cnv.width = 150 * ar;
			}
			var ctx = cnv.getContext("2d");
			ctx.drawImage(this.imgElem, 0, 0, cnv.width, cnv.height);
			this.thumbnailURI = cnv.toDataURL(); //nice and small
			return this.thumbnailURI;
		}
	};
	
	//image is downscaled to max res of A4 at 300ppi
	ScanImage.prototype.getWidth = function() { 
		if (this.imgElem.width > this.imgElem.height) {
			return MAXW;
		} else {
			return (MAXH / this.imgElem.height) * this.imgElem.width;
		}
	}
	
	ScanImage.prototype.getHeight = function() {
		if (this.imgElem.height > this.imgElem.width) {
			return MAXH;
		} else {
			return (MAXW / this.imgElem.width) * this.imgElem.height;
		}
	}
	
	ScanImage.prototype.updateProperty = function(prop, val) {
		if (prop === "cornersStatus" || prop === "corners") {
			if (this.cornersStatus === Status.INITIAL) {
				return;
			}
		} else if (prop === "deskewImgURL") {
			if (this.deskewStatus === Status.INITIAL) {
				return;
			} else {
				this.setDeskewImg(val);
				return;
			}
		}
		this[prop] = val;
	}

	return ScanImage;
	
});