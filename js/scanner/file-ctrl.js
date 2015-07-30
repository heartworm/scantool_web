angular.module("scannerApp").controller("AddImgCtrl", function($rootScope, $scope, $window, $location, Status, Scanner, ScannerData){
	
	//navigation
	$scope.prev = function() {
		$location.path("/log");
	}
	$scope.next = function() {
		$location.path("/step2");
	}
	
	
	
	//sorting vars
	$scope.images = ScannerData.images;
	
	if ($scope.descending === undefined) $scope.descending = false;
	if ($scope.sortBy === undefined) $scope.sortBy = "fileName"; //no sorting will occur with anything other than fileName or date
	
	//toolbar funcs
	
	$scope.addImages = function() {
		var fileIn = $("#fileIn")[0];
		var files = fileIn.files;
		if (files.length === 0) {
			$window.alert("No Files Selected!");
		} else {
			ScannerData.addImages(files);
			fileIn.value = null;
		}
		ScannerData.sortBy($scope.sortBy, $scope.descending);
	}
	
	$scope.toggleDescending = function() {
		$scope.descending = !($scope.descending);
		ScannerData.sortBy($scope.sortBy, $scope.descending);
	};
	
	$scope.setSortBy = function(str) {
		$scope.sortBy = str;
		ScannerData.sortBy($scope.sortBy, $scope.descending);
	};
	
	//list manip funcs
	//all take $index as arg
	
	$scope.imgUp = function(i) {
		ScannerData.swapImages(i, i-1);
		$scope.sortBy = ""; //user has chosen to reorder manually ofc
	}
	
	$scope.imgDown = function(i) {
		ScannerData.swapImages(i, i+1);
		$scope.sortBy = ""; //user has chosen to reorder manually ofc
	}
	
	$scope.imgRemove = function(i) {
		ScannerData.removeImage(i);
	}
	
	//visual info funcs
	
	$scope.statusClassList = function(img) {
		switch(img.imageLoadStatus) {
			case Status.FAILED:
				return "list-group-item-danger";
			case Status.INITIAL:
			case Status.PROCESSING:
				return "list-group-item-warning";
			default:
				return "";
		}
	}
	
	$scope.statusClassLabel = function(img) {
		switch(img.imageLoadStatus) {
			case Status.FAILED:
				return "label-danger";
			case Status.INITIAL:
			case Status.PROCESSING:
				return "label-warning";
			case Status.SUCCESS:
				return "label-success";
			default:
				return "";
		}
	}
	
	$scope.statusString = function(img) {
		switch(img.imageLoadStatus) {
			case Status.FAILED:
				return "Image failed to load: " + img.imageLoadReason;
			case Status.INITIAL:
			case Status.PROCESSING:
				return "Loading image...";
			case Status.SUCCESS:
				return "Finished loading image.";
			default:
				return "";
		}
	}
	
}); 