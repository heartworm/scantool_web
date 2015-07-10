angular.module("scannerApp").service("Scanner", function(ScannerData, Status) {
	
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
						var data = Uint8ClampedArray(message.image.deskewData);
						ctx.putImageData(data, 0, 0);
						output.deskewCanvas = deskewCanvas;
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
			ScannerData.updateImage(message.image.number, message.image.hash, output);
		}
	};
	
	this.onUpdate = function() {
		if (typeof this.updateCb === "function") {
			this.updateCb();
		}	
	};
	
});