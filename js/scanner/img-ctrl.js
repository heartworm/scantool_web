angular.module("scannerApp").controller("EditImgCtrl", function($scope, $location, ScannerData, Scanner, CanvasInterface){
	$scope.prev = function() { $location.path("/step1"); }
		
	$scope.images = ScannerData.images;
	var canvas = $("#cornerCanvas")[0];
	var ctrl = new CanvasInterface(canvas, $scope.images[0]);
});