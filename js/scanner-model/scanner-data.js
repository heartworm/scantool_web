//window.scannerModel = {};
angular.module("scannerModel", []).service("ScannerData", function($rootScope, ScanImage, Status) {
	this.images = [];
	
	var updateCbs = [
		function() {
			$rootScope.$apply();
		}
	];
	
	var onUpdate = function() {
		for (var i = 0; i < updateCbs.length; i++) {			
			if (typeof updateCbs[i] === "function") {
				updateCbs[i]();
			}
		}	
	};
	
	this.addUpdateCb = function(func) {
		if (typeof func === "function") updateCbs.push(func);
	}
	
	this.delUpdateCb = function(func) {
		var index = updateCbs.indexOf(func);
		if (index !== -1) {
			updateCbs.splice(index, 1);
		}
	}
	
	this.addImages = function(files) {
		for (var i = 0; i < files.length; i++) {
			var im = new ScanImage(files[i], nextUID(), onUpdate);
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
				
				for(var i = 0; i < this.images.length; i++) {
					if (this.images[i].id === im.id) match = this.images[i];
				}
				
				if (match !== undefined) 
					old = match;
				else 
					return;
			}
			for (prop in im) {
				if (im.hasOwnProperty(prop)) { //dont include weird ass inherited properties
					old.updateProperty(prop, im[prop]);
				}
			}	
		}
	};
	
	this.resetDeskewStatus = function() {
		for (var i = 0; i < this.images.length; i++) {
			this.images[i].deskewStatus = Status.INITIAL;
		}
	}
	
	this.imagesReady = function() {
		for (var i = 0; i < this.images.length; i++) {
			if (this.images[i].imageLoadStatus !== Status.SUCCESS) {
				return false;		
			}
		};
		return true;
	}
	
	this.deskewReadyCount = function () {
		var count = 0;
		for (var i = 0; i < this.images.length; i++) {
			if (this.images[i].deskewStatus === Status.SUCCESS) {
				count++;
			}
		};
		return (count < this.images.length) ? count : -1;
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
	

	
	//switched from a hash to a counting UID, as user adding same file twice could be a wanted characteristic
	//	(dunno why) and would screw up with a unique hash. Google closure if forget how it works...
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