chrome.app.runtime.onLaunched.addListener(function() {
  	chrome.app.window.create('window.html', {
		innerBounds: {
			minWidth: 992,
      		height: 750
		}
  	});
});