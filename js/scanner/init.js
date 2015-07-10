angular.module("scannerApp").run(function($rootScope, $location, $window, Scanner, ScannerData, Status) {
	window.rootsc = $rootScope;//DEBUG LINE
	$rootScope.Status = Status;
	$rootScope.log = "Initialised";
	$rootScope.naclCont = $("#naclCont")[0];
	$rootScope.naclStatus = Status.INITIAL;
	
	//Because these anonymous functions are invoked OUTSIDE of the angular JS world (callbacks), 
	//	$apply needs to be called to update bindings and keep shit in sync
	$rootScope.naclCont.addEventListener("error", $.proxy(function() {
		$rootScope.addLog("There was an error while loading the program.");
		$rootScope.naclStatus = Status.FAILED;
		$rootScope.$apply();
	}, this), true);
	$rootScope.naclCont.addEventListener("crash", $.proxy(function() {
		$rootScope.onCrash("Due to an error that occured while running, the program has crashed.");
		$rootScope.$apply();
	}, this), true);
	$rootScope.naclCont.addEventListener("loadstart", $.proxy(function() {
		$rootScope.addLog("Loading");
		$rootScope.naclStatus = Status.PROCESSING;
		$rootScope.$apply();
	}, this), true);
	$rootScope.naclCont.addEventListener("load", $.proxy(function() {
		$rootScope.addLog("Loaded.");
		$rootScope.naclStatus = Status.SUCCESS;
		$rootScope.$apply();
	}, this), true);
	$rootScope.naclCont.addEventListener("message", $.proxy(function(message) {
		$rootScope.addLog("Message Received");
		console.log(message);
		
		var obj = message.data;
		if (typeof obj === "object") {
			if (obj.command == "error")
				$rootScope.onCrash(obj.type + ": " + obj.what);
			else
				Scanner.onMessage(obj);
		}	
		
		$rootScope.$apply();
	}, this), true);
	
	$rootScope.addLog = function(str) { //can be anything, angular will handle conversion to string and shit lol
		console.log(str);
		//$rootScope.log.push(str);
		$rootScope.log += "\n" + str;
	};
	
	$rootScope.onCrash = function(str) {
		$rootScope.naclStatus = Status.FAILED;
		$rootScope.addLog(str);
		$location.path("/log");
		$window.alert("An error has occured. Please inspect log");
	}
	
	$rootScope.naclCont.innerHTML = '<embed name="naclMod" id="naclMod" width="0" height="0" src="app.nmf" type="application/x-pnacl">';
	$rootScope.naclMod = $("#naclMod")[0];
	
});