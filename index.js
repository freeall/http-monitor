var check = require('httpcheck');
var events = require('events');

module.exports = function(url, options) {
	options = options || {};
	options.interval = options.interval || 5000;
	options.retries = options.retries || 1;
	options.allowed = options.allowed || [];
	options.disallowed = options.disallowed || [];

	var that = new events.EventEmitter();
	var inErrorState = false;
	var keepRunning = !options.once;
	var checks = 0;
	var doCheck = function() {
		var statusCode;
		var body;

		check({
			url: url,
			checkInterval: options.interval,
			checkTries: options.retries,
			checkTimeout: options.timeout,
			log: function(){},
			check: function(request) {
				statusCode = request.statusCode;
				body = request.body;

				var isError = request.statusCode >= 400;
				var isAllowed = options.allowed.indexOf(statusCode) >= 0;
				var isDisallowed = options.disallowed.indexOf(statusCode) >= 0;

				that.emit('check', request.statusCode);

				if (isError && !isAllowed) return false;
				if (!isError && isDisallowed) return false;
				return true;
			}
		}, function(err) {
			if (err) err.statusCode = statusCode;
			if (err) err.body = body;

			if (err && !inErrorState) {
				inErrorState = true;

				if (!statusCode) that.emit('connection-error', err);
				if (statusCode) that.emit('http-error', err);
				if (that.listeners('error').length) that.emit('error', err);
			}
			if (!err && inErrorState) {
				inErrorState = false;
				that.emit('recovery', err);
			}

			if (!keepRunning) return that.emit('end');
			wait();
		});
	};

	var timeout;
	var wait = function() {
		if (!keepRunning && checks++) return;
		timeout = setTimeout(doCheck, options.interval);
	};

	wait();

	that.destroy = function() {
		keepRunning = false;
		clearTimeout(timeout);
	};
	return that;
};
