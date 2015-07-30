angular.module("scannerApp").controller("EditImgCtrl", function($scope, $location, hotkeys, Status, ScannerData, Scanner, CanvasInterface){
	$scope.prev = function() { $location.path("/step1"); }
	$scope.next = function() { $location.path("/step3"); }
		
	$scope.images = ScannerData.images;
	$scope.curIndex = 0;
	var canvas = $("#cornerCanvas")[0];
	var canvasInt = new CanvasInterface(canvas, $scope.images[0]);
	$scope.editCorner = "";
	$scope.editAll = false;
	
	$scope.onEdit = function() {
		$scope.images[$scope.curIndex].deskewStatus = Status.INITIAL;
	}
	
	$scope.$watch(function() {
		return $scope.images[$scope.curIndex].corners;
	}, function() {
		canvasInt.loadImage($scope.images[$scope.curIndex]);
	});
	
	
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

			if (canvasInt.onClick($scope.editCorner, x, y)) { 
				$scope.images[$scope.curIndex].cornersStatus = Status.INITIAL;
				if ($scope.editAll) {
					if ($scope.editCorner === "tl") $scope.editCorner = "tr";
					else if ($scope.editCorner === "tl") $scope.editCorner = "tr";
					else if ($scope.editCorner === "tr") $scope.editCorner = "br";
					else if ($scope.editCorner === "br") $scope.editCorner = "bl";
					else {
						$scope.editCorner = "";
						$scope.editAll = false;					
					}
				} else {
					$scope.editCorner = "";
				}
				$scope.onEdit();
			}
		}
	}
	
	$scope.toggleCorner = function(corner) {
		if ($scope.editCorner === corner) {
			$scope.editCorner = "";
			$scope.editAll = false;
		} else if (corner === "all") {
			$scope.editAll = true;
			$scope.editCorner = "tl";
		} else {
			$scope.editCorner = corner;
		}
	}
	
	$scope.autoCorners = function() {
		Scanner.autoCorners(ScannerData.images[$scope.curIndex], $scope.curIndex);
	}
	
	$scope.statusClassLabel = function() {
		switch($scope.images[$scope.curIndex].cornersStatus) {
			case Status.FAILED:
				return "label-danger";
			case Status.INITIAL:
				return "label-default";
			case Status.PROCESSING:
				return "label-warning";
			case Status.SUCCESS:
				return "label-success";
			default:
				return "";
		}
	}
	
	$scope.statusString = function() {
		switch($scope.images[$scope.curIndex].cornersStatus) {
			case Status.FAILED:
				return "AutoCorners failed: " + $scope.images[$scope.curIndex].cornersErr;
			case Status.INITIAL:
				return "AutoCorners disabled.";
			case Status.PROCESSING:
				return "Finding corners...";
			case Status.SUCCESS:
				return "Corners found.";
			default:
				return "default";
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
		combo: 'r', callback: function() {$scope.toggleCorner("all");}
	}).add({
		combo: 's', callback: $scope.prevImg
	}).add({
		combo: 'w', callback: $scope.nextImg
	}).add({
		combo: 'x', callback: $scope.deskew
	}); //$scope limits hotkey lifecycle to this page

});