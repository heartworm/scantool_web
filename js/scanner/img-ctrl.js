angular.module("scannerApp").controller("EditImgCtrl", function($scope, $location, ScannerData, Scanner, CanvasInterface){
	$scope.prev = function() { $location.path("/step1"); }
		
	$scope.images = ScannerData.images;
	var canvas = $("#cornerCanvas")[0];
	var canvasInt = new CanvasInterface(canvas, $scope.images[0]);
	$scope.editCorner = "";
	
	$scope.cornerClick = function(e) {
		// gets x and y relative to whole document
		// from http://diveintohtml5.info/canvas.html
		var x;
		var y;
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		} else {
			//X and Y relative to the browser's (client's) viewport
			//therefore needs to take into account user scrolling
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		x -= $(canvas).offset().left;
		y -= $(canvas).offset().top;
		
		//internal canvas bitmap dimension is different to displayed dimension!
		//jquery func width() height() gives css displayed dimension
		// .width .height gets canvas internal dimension
		x *= canvas.width / $(canvas).width();
		y *= canvas.height / $(canvas).height();
		
		canvasInt.onClick("tl", x, y);
	}
	
});