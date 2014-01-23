var monitor = require('../');
var server = require('./server');
var test = require('tap').test;
var req = require('request');

var PORT = 13532;
var INTERVAL = 100;
var HOST = 'http://localhost:'+PORT;
var TIMEOUT = 1000;
var OPTIONS = {
	interval: INTERVAL,
	timeout: TIMEOUT,
	once: true
};

var test1 = function() {
	test('Server running', function(t) {
		t.plan(1);
		var m = monitor(HOST+'/ok', OPTIONS);
		m.on('error', function() {
			t.ok(false);
		});
		setTimeout(function() {
			m.destroy();
			t.ok(true);
		}, 1000);
	});
};
var test2 = function() {
	test('Server returns errornous statuscode', function(t) {
		t.plan(1);

		var m = monitor(HOST+'/500', OPTIONS);
		m.on('http-error', function(err) {
			t.ok(err);
		});
	});
};
var test3 = function() {
	test('Server times out', function(t) {
		t.plan(1);

		var m = monitor(HOST+'/timeout', OPTIONS);
		m.on('connection-error', function(err) {
			t.ok(err);
		});
	});
};
var test4 = function() {
	var options = {
		interval: INTERVAL,
		retries: 1,
		once: true,
		allowed: [500]
	};
	test('Server errors, but 500 allowed', function(t) {
		t.plan(1);

		var m = monitor(HOST+'/500', options);
		m.on('error', function(err) {
			t.ok(false);
		});
		setTimeout(function() {
			t.ok(true);
			m.destroy();
		}, 1000);
	});
};
var test5 = function() {
	var url = HOST+'/everyThirdIsOk';
	var options = {
		interval: INTERVAL,
		retries: 2
	};
	test('If server errors less than "retries" number of times in a row, it doesn\'t cause an error', function(t) {
		t.plan(1);

		var checks = 6;
		var m = monitor(url, options);
		m.on('check', function(statusCode) {
			checks++;
			if (checks >= 6) {
				t.ok(true);
				m.destroy();
			}
		});
		m.on('error', function(err) {
			t.ok(false);
		});
	});
};
var test6 = function() {
	test('Error when hostname doesn\'t exist', function(t) {
		t.plan(1);

		var m = monitor('http://nosuchhost:12345', OPTIONS);
		m.on('connection-error', function() {
			t.ok(true);
		});
	});
};
var test7 = function() {
	var options = {
		interval: INTERVAL,
		once: true,
		disallowed: [200]
	};
	test('Disallow 200', function(t) {
		t.plan(1);

		var m = monitor(HOST+'/ok', options);
		m.on('http-error', function(err) {
			t.ok(err);
		});
	});
};
var test8 = function() {
	var options = {
		interval: 10,
		retries: 2
	};

	test('Only run the error function once, even though the service keeps erroring', function(t) {
		var calls = 0;
		var m = monitor(HOST+'/failAfterThird', options);
		m.on('error', function(err) {
			t.ok(!calls++, 'Call once');
		});
		setTimeout(function() {
			m.destroy();
			t.end();
		}, 2000);
	});
};
var test9 = function() {
	var options = {
		interval: 10,
		retries: 2
	};

	test('Server errors, then recovers, then errors - should invoke callback three times, twice with an error', function(t) {
		var errors = 0;
		var recoveries = 0;
		var m = monitor(HOST+'/failAfterThird', options);
		m.on('error', function(err) {
			errors++;

			if (errors === 1) t.ok(err);
			if (errors === 2) t.ok(err);
			if (errors > 2) t.ok(false);
		});
		m.on('recovery', function() {
			recoveries++;

			if (recoveries === 1) t.ok(true);
			if (recoveries > 1) t.ok(false);
		});
		setTimeout(function() {
			req(HOST+'/resetFailAfterThird');
		}, 1000);
		setTimeout(function() {
			m.destroy();
			t.end();
		}, 2000);
	});
};

server.listen(PORT, function() {
	test1();
	test2();
	test3();
	test4();
	test5();
	test6();
	test7();
	test8();
	test9();
});
