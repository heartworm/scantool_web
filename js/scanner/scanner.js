angular.module("scannerApp").service("Scanner", function($rootScope, ScannerData, Status) {
	
	this.onMessage = function(message) {
		console.log(message);
		if (message.command === "update") {
			var output = {};
			if (message.image.deskewStatus !== undefined) {
				switch (message.image.deskewStatus) {
					case "FAILED":
						output.deskewStatus = Status.FAILED;
						break;
					case "SUCCESS":
						output.deskewStatus = Status.SUCCESS;
						var deskewCanvas = document.createElement("canvas");
						deskewCanvas.height = message.image.deskewHeight;
						deskewCanvas.width = message.image.deskewWidth;
						var ctx = deskewCanvas.getContext("2d");
						var imData = new ImageData(new Uint8ClampedArray(message.image.deskewData), message.image.deskewWidth,
											message.image.deskewHeight);
						ctx.putImageData(imData, 0, 0);
						output.deskewCanvas = deskewCanvas;
						var doc = new jsPDF();
						
						//window.open(deskewCanvas.toDataURL("image/jpeg", 0.1));
						doc.addImage(deskewCanvas.toDataURL("image/jpeg", 0.1), 'JPEG', 0, 0, 210, 297);
						console.log(doc.output("datauristring"));
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
			console.log(msg);
			$rootScope.naclMod.postMessage(msg);
		}
	};
	
	this.onUpdate = function() {
		if (typeof this.updateCb === "function") {
			this.updateCb();
		}	
	};
	
});