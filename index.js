var check = require('httpcheck');

module.exports = function(url, options, callback) {
	if (arguments.length === 2) return module.exports(url, null, options);
	options = options || {};
	options.interval = options.interval || 5000;
	options.retries = options.retries || 1;
	options.allowed = options.allowed || [];
	options.disallowed = options.disallowed || [];
	options.once = !!options.once;

	var inErrorState = false;
	var keepRunning = !options.once;
	var checks = 0;
	var doCheck = function() {
		var statusCode;
		var body;

		check({
			url: url,
			checkInterval: options.interval || 5000,
			checkTries: options.retries || 1,
			log: function(){},
			check: function(request) {
				// console.log('check check')
				statusCode = request.statusCode;
				body = request.body;

				var isError = request.statusCode >= 400;
				var isAllowed = options.allowed.indexOf(statusCode) >= 0;
				var isDisallowed = options.disallowed.indexOf(statusCode) >= 0;

				if (isError && !isAllowed) return false;
				if (!isError && isDisallowed) return false;
				return true;
			}
		}, function(err) {
			if (err) err.statusCode = statusCode;
			if (err) err.body = body;

			if (options.once) return callback(err);
			if (!keepRunning) return;

			if (err && !inErrorState) {
				inErrorState = true;
				callback(err);
			}
			if (!err && inErrorState) {
				inErrorState = false;
				callback(null);
			}

			wait();
		});
	};

	var wait = function() {
		if (!keepRunning && checks++) return;
		setTimeout(doCheck, options.interval);
	};

	wait();

	return function() {
		keepRunning = false;
	};
};
