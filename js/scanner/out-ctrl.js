angular.module("scannerApp").controller("OutputCtrl", function($scope, $location, hotkeys, Status, ScannerData, Scanner) {
	$scope.images = ScannerData.images;
	$scope.outputType = "PDF";
	$scope.jpegQuality = 85;
	
	
	$scope.deskew = function() {
		for (var i = 0; i < $scope.images.length; i++) {
			Scanner.deskew($scope.images[i], i);
		}
	}
	
});