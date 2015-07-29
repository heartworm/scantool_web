angular.module('scannerApp', ["ngRoute", "cfp.hotkeys", "scannerModel"]);
angular.module("scannerApp").config(["$routeProvider", function($routeProvider) {
	var checkPage = function($q, $window, $rootScope, $location, Status, ScannerData) {
		var def = $q.defer();
		var step = parseInt($location.path().slice(-1));  // "/step1" will = 1
		
		if ($rootScope.naclStatus != Status.SUCCESS) { //if the core is loaded then the app was already running and shit
            $location.path("/log");
            return def.reject();
        }
		
		if (step >= 2) { //if there are no images in list, or some images were loading/corrupted, send user back to file selection page 
			if (ScannerData.images.length == 0) {
				$location.path("/step1");
				$window.alert("No images in list. Add images to continue.");
				return def.reject();
			} else if (!ScannerData.imagesReady()) {
				$location.path("/step1");
				$window.alert("One or more images in the list haven't loaded. Remove them before continuing.");
				return def.reject();
			}
		}
		
		return def.resolve(true);       
    }
	
    $routeProvider.when("/log", {
		controller: "LogCtrl",
		templateUrl: "views/log-view.html"
	}).when("/step1", {
        controller: "AddImgCtrl",
        templateUrl: "views/file-view.html",
        resolve: {
            factory: checkPage
        }
    }).when("/step2", {
		controller: "EditImgCtrl",
		templateUrl: "views/img-view.html",
		resolve: {
			factory: checkPage
		}
	}).when("/step3", {
		controller: "OutputCtrl",
		templateUrl: "views/out-view.html",
		resolve: {
			factory: checkPage
		}
	}).otherwise("/log");
    
}]);
angular.module("scannerApp").controller("LogCtrl", function($scope, $location) {
    $scope.next = function() {
        $location.path("/step1");
    };
});