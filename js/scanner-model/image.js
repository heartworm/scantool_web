angular.module("scannerModel").factory("ScanImage", function(Status) { 
	//Factory, runs passed function then returned value is issued as a singleton to dependency injector
	//In this case the singleton is a constructor (of a class), so our classes can be defined within a module namespace

	function ScanImage(fileIn) {
		
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

		this.fileReader.readAsDataURL(fileIn);


		this.id = "wadoo";
		this.canvas = document.createElement("canvas");

		this.deskewCanvas = null;
		this.deskewStatus = Status.INITIAL;

		this.corners = {
			tlx: 0, tly: 0,
			trx: this.canvas.width, try: 0,
			blx: 0, bly: this.canvas.height,
			brx: this.canvas.width, bry: this.canvas.height
		};
		this.cornersStatus = Status.INITIAL;

	}

	//Loading Callbacks

	ScanImage.prototype.onReadError = function() {
		console.log("onreaderror");
		this.imageLoadStatus = Status.FAILED;
		this.imageLoadReason = this.fileReader.error.name;

		//delete this.img;
		delete this.fileReader;
		this.onUpdate();
	};

	ScanImage.prototype.onReadLoad = function() {
		console.log("onreadload");
		this.imageLoadStatus = Status.PROCESSING;
		this.imgElem.src = this.fileReader.result;
		this.onUpdate();
	};

	ScanImage.prototype.onImageLoad = function() {
		console.log("onimageload");
		this.canvas.height = this.imgElem.height;
		this.canvas.width = this.imgElem.width;
		var ctx = this.canvas.getContext('2d');
		ctx.drawImage(this.imgElem, 0, 0);

		this.imageLoadStatus = Status.SUCCESS;

		//Cleanup
		//delete this.img;
		delete this.fileReader;
		this.onUpdate();
	};

	ScanImage.prototype.onImageError  = function() {
		console.log("onimageerror");
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

	ScanImage.prototype.getThumbnailURI = function() {
		if (this.thumbnailURI !== undefined) return this.thumbnailURI;
		else {
			var ar = this.canvas.width / this.canvas.height;
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
			this.thumbnailURI = cnv.toDataURL();
			return this.thumbnailURI;
		}
	};
	
	ScanImage.prototype.getWidth = function() {
		return this.imgElem.width;
	}
	
	ScanImage.prototype.getHeight = function() {
		return this.imgElem.height;
	}

	return ScanImage;
	
});