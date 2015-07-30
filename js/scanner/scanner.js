angular.module("scannerApp").service("Scanner", function($rootScope, ScannerData, Status) {	
	this.onMessage = function(message) {
		if (message.command === "update") {
			var output = {};
			if (message.image.deskewStatus !== undefined) {
				switch (message.image.deskewStatus) {
					case "FAILED":
						output.deskewStatus = Status.FAILED;
						break;
					case "SUCCESS":
						var deskewCanvas = document.createElement("canvas");
						deskewCanvas.height = message.image.deskewHeight;
						deskewCanvas.width = message.image.deskewWidth;
						var ctx = deskewCanvas.getContext("2d");
						var imData = new ImageData(new Uint8ClampedArray(message.image.deskewData), message.image.deskewWidth,
											message.image.deskewHeight);
						ctx.putImageData(imData, 0, 0);
						
						output.deskewImgURL = deskewCanvas.toDataURL("image/png");
						break;
					default: 
						return;
				}
			} else if (message.image.cornersStatus !== undefined) {
				switch(message.image.cornersStatus) {
					case "FAILED":
						output.cornersStatus = Status.FAILED;
						output.cornersErr = message.image.cornersErr;
						break;
					case "SUCCESS":
						output.cornersStatus = Status.SUCCESS;
						output.corners = message.image.corners;
						break;
					default:
						return;
				}
			}
			ScannerData.updateImage(message.image.number, message.image.id, output);
		}
	};
	
	this.autoCorners = function(img, number) {
		if (img.cornersStatus !== Status.PROCESSING) { //user may spam the autocorners button		
			var msg = {
				command: "corners",
				image: {
					number: number,
					id: img.id,
					data: img.getImageData(),
					height: img.getHeight(),
					width: img.getWidth(),
					corners: img.corners
				}
			}
			img.cornersStatus = Status.PROCESSING;
			$rootScope.naclMod.postMessage(msg);
		}
	};
	
	this.deskew = function(img, number) {
		if (img.deskewstatus !== Status.PROCESSING) {
			var msg = {
				command: "deskew",
				image: {
					number: number,
					id: img.id,
					data: img.getImageData(),
					height: img.getHeight(),
					width: img.getWidth(),
					corners: img.corners
				}
			};
			img.deskewStatus = Status.PROCESSING;
			$rootScope.naclMod.postMessage(msg);
		}
	};
	
	this.finalDeskew = function(type, quality, cb) {
		var self = this;
		var whenDeskewed = function() {
			var deskewedCount = ScannerData.deskewReadyCount();
			if (deskewedCount === -1) {
				if (type === "PDF") {
					cb({
						status: Status.PROCESSING,
						percent: 100,
						text: "Generating PDF..."
					});
					$rootScope.$apply();
					
					var doc = new jsPDF();
					for (var i = 0; i < ScannerData.images.length; i++) {
						var scanImg = ScannerData.images[i];
						var height = 297; var width = 210; //A4 in mm
						//algorithm is unit agnostic, will fit to dimensions in any case
						var dispH, dispW, dispY, dispX;
						var dispAR = scanImg.deskewImgElem.height / scanImg.deskewImgElem.width;
						
						if ((dispAR * width) > height) { 
							// DUPLICATE OF CanvasInterface
							// if expanding the wide image to fit the width of the port causes the height to overflow
							// just expand to fit the height. 
							// TODO: Could probably somehow compare aspect ratios to achieve same thing
							var dispScale = height / scanImg.deskewImgElem.height;
							dispH = height;
							dispW = scanImg.deskewImgElem.width * dispScale;
							dispY = 0;
							dispX = (width - dispW) / 2;
						} else  {
							var dispScale = width / scanImg.deskewImgElem.width;
							dispW = width;
							dispH = scanImg.deskewImgElem.height * dispScale;
							dispX = 0;
							dispY = (height - dispH) / 2;
						}
						
						
						var cnv = document.createElement("canvas");
						cnv.width = scanImg.deskewImgElem.width;
						cnv.height = scanImg.deskewImgElem.height;
						var ctx = cnv.getContext("2d");
						ctx.drawImage(scanImg.deskewImgElem, 0, 0);
						
						var dataURL = cnv.toDataURL("image/jpeg", quality);
						delete cnv;
						
						if (i > 0) doc.addPage(); //first page already exists.
						doc.addImage(dataURL, "JPEG", dispX, dispY, dispW, dispH);
					}
					
					cb({
						status: Status.SUCCESS,
						percent: 100,
						text: "Done!",
						blobURL: URL.createObjectURL(dataURLtoBlob(doc.output("datauristring")))
					});
					$rootScope.$apply();
					
					doc = null;
				} else if (type === "JPEG" || type === "PNG") {
					var zip = new JSZip();
					for (var i = 0; i < ScannerData.images.length; i++) {
						var scanImg = ScannerData.images[i];
						if (type === "PNG") {							
							var b64 = scanImg.deskewImgElem.src.split(',')[1];
							zip.file(i+1 + ".png", b64, {base64: true});
						} else if (type === "JPEG") {
							var cnv = document.createElement("canvas");
							cnv.width = scanImg.deskewImgElem.width;
							cnv.height = scanImg.deskewImgElem.height;
							var ctx = cnv.getContext("2d");
							ctx.drawImage(scanImg.deskewImgElem, 0, 0);
							var dataURL = cnv.toDataURL("image/jpeg", quality);
							
							var b64 = dataURL.split(',')[1];
							zip.file(i+1 + ".jpg", b64, {base64: true});
						}
					}
					cb({
						status: Status.SUCCESS,
						blobURL: URL.createObjectURL(zip.generate({type: "blob"}))
					});
					$rootScope.$apply();
				}
				ScannerData.delUpdateCb(whenDeskewed);
			} else {
				self.deskew(ScannerData.images[deskewedCount], deskewedCount);
				cb({
					status: Status.PROCESSING,
					percent: 100 * (deskewedCount / ScannerData.images.length),
					text: "Deskewing images..."
				});
				$rootScope.$apply();
			}
		};
		ScannerData.addUpdateCb(whenDeskewed);
		ScannerData.resetDeskewStatus();
		cb({
			status: Status.PROCESSING,
			percent: 0,
			text: "Deskewing images..."
		});
		this.deskew(ScannerData.images[0], 0);

	}
	
	function dataURLtoBlob(dataURI) { 
		//Obtained from:
		//https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ia], {type:mimeString});
	}
	
});