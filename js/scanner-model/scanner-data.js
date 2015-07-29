//window.scannerModel = {};
angular.module("scannerModel", []).service("ScannerData", function($rootScope, ScanImage, Status) {
	this.images = [];
	
	this.addImages = function(files) {
		for (var i = 0; i < files.length; i++) {
			var im = new ScanImage(files[i], nextUID(), this.onUpdate);
			this.images.push(im);
		}
	};
	
	this.removeImage = function(i) {
		this.images.splice(i, 1);
	}
	
	this.updateImage = function(number, id, im) {
		if (number !== undefined && id !== undefined) {
			//get the old one, if we're lucky itll be in the same spot
			// else just search thru em until we find one with exactly the same img (id == id)
			// worst case user deleted the photo, return gracefully
			var old = this.images[number];
			if (old.id !== id) {
				var match = undefined;
				jQuery.each(this.images, function(ind, obj) {
					if (obj.id === im.id) match = obj;
				});
				
				if (match !== undefined) 
					old = match;
				else 
					return;
			}
			console.log(old);
			for (prop in im) {
				if (im.hasOwnProperty(prop)) { //dont include weird ass inherited properties
					old.updateProperty(prop, im[prop]);
				}
			}
			console.log(old);
		}
	};
	
	this.imagesReady = function() {
		for (var i = 0; i < this.images.length; i++) {
			if (this.images[i].imageLoadStatus != 2) {
				return false;		
			}
		};
		return true;
	}
	
	this.sortBy = function(field, descending) {
		this.images.sort(function(a, b) {
			var out = 0;
			var compA = "";
			var compB = "";

			if (field ===  "fileName") {
				compA = a.fileName.toLowerCase();
				compB = b.fileName.toLowerCase();
			} else if (field === "date") {
				compA = a.dateModified;
				compB = b.dateModified;
			} else return out;

			//weird string comparison anomaly with uppercase in JS
			if (compA < compB) {
				out = -1;
			} else if (compA > compB) {
				out = 1;
			}
			
			if (descending) out = out * -1;
			
			return out;
		});
	};
	
	this.swapImages = function(a, b) {
		var tmp = this.images[a];
		this.images[a] = this.images[b];
		this.images[b] = tmp;
	}
	
	this.onUpdate = function() {
		$rootScope.$apply();	
	};
	
	//switched from a hash to a counting UID, as user adding same file twice could be a wanted characteristic
	//	(dunno why) and would screw up with a unique hash. Google closure if forget how works...
	var nextUID = (function() {
		var id = 0;
		return function() { return id++; };
	})();
	
}).constant("Status", Object.freeze({
    INITIAL: 0,
    PROCESSING: 1,
    SUCCESS: 2,
    FAILED: 3
})); //like an enum, used throughout