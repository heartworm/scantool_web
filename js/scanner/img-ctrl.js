angular.module("scannerApp").controller("EditImgCtrl", function($scope, $location, hotkeys, ScannerData, Scanner, CanvasInterface){
	$scope.prev = function() { $location.path("/step1"); }
		
	$scope.images = ScannerData.images;
	$scope.curIndex = 0;
	var canvas = $("#cornerCanvas")[0];
	var canvasInt = new CanvasInterface(canvas, $scope.images[0]);
	$scope.editCorner = "";
	
	$scope.prevImg = function() {
		if ($scope.curIndex > 0)
			canvasInt.loadImage($scope.images[--$scope.curIndex]);
	} 
	
	$scope.nextImg = function() {
		if ($scope.curIndex < $scope.images.length - 1) 
			canvasInt.loadImage($scope.images[++$scope.curIndex]);
	}
	
	
	$scope.cornerClick = function(e) {
		if ($scope.editCorner != "") {
			// gets x and y relative to whole document
			// elements from http://diveintohtml5.info/canvas.html
			var x;
			var y;
			if (e.pageX !== undefined && e.pageY !== undefined) {
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

			if (canvasInt.onClick($scope.editCorner, x, y)) $scope.editCorner = "";
		}
	}
	
	$scope.toggleCorner = function(corner) {
		if ($scope.editCorner === corner) {
			$scope.editCorner = "";
		} else {
			$scope.editCorner = corner;
		}
	}
	
	hotkeys.bindTo($scope).add({
		combo: 'q', callback: function() {$scope.toggleCorner("tl");}
	}).add({
		combo: 'e', callback: function() {$scope.toggleCorner("tr");}
	}).add({
		combo: 'a', callback: function() {$scope.toggleCorner("bl");}
	}).add({
		combo: 'd', callback: function() {$scope.toggleCorner("br");}
	}).add({
		combo: 's', callback: $scope.prevImg
	}).add({
		combo: 'w', callback: $scope.nextImg
	}); //limits hotkey lifecycle to this page

});