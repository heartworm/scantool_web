chrome.app.runtime.onLaunched.addListener(function() {
  	chrome.app.window.create('window.html', {
		innerBounds: {
			minWidth: 1300,
      		height: 750
		}
  	});
});