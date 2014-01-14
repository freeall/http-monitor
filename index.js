var check = require('httpcheck');

module.exports = function(url, options, callback) {
	if (arguments.length === 2) return module.exports(url, null, options);
	options = options || {};
	options.interval = options.interval || 5000;
	options.tries = options.tries || 1;
	options.once = options.once === undefined ? false : options.once;
	options.allowed = options.allowed || [];
	options.disallowed = options.disallowed || [];

	var checks = 0;
	var doCheck = function() {
		var statusCode;
		var body;

		check({
			url: url,
			checkInterval: options.interval || 5000,
			checkTries: options.tries || 1,
			log: function(){},
			check: function(request) {
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
			callback(err, statusCode, body);
			wait();
		});
	};

	var wait = function() {
		if (options.once && checks++) return;
		setTimeout(doCheck, options.interval);
	};

	wait();
};
