angular.module("scannerApp").controller("OutputCtrl", function($scope, $location, $window, hotkeys,
    Status, ScannerData, Scanner) {
    $scope.prev = function() {
        $location.path("/step2");
    }
    $scope.images = ScannerData.images;
    $scope.outputType = "PDF";
    $scope.jpegQuality = 85;
    $scope.deskewProgress = {
        status: Status.INITIAL
    };
    $scope.validateQuality = function() {
        if ($scope.jpegQuality === undefined) $scope.jpegQuality = 85;
    }
    $scope.defaults = function() {
        $scope.outputType = "PDF";
        $scope.jpegQuality = 85;
    }
    $scope.progressCb = function(data) {
        $scope.deskewProgress = data;
        console.log($scope.deskewProgress);
        //$scope.$apply(); //function may be called out of angular context
    }
    $scope.deskew = function() {
        Scanner.finalDeskew($scope.outputType, $scope.jpegQuality / 100, $scope.progressCb);
    }
    $scope.download = function() {
        $window.open($scope.deskewProgress.blobURL);
    }
});