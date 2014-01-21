var monitor = require('../');
var server = require('./server');
var test = require('tap').test;
var req = require('request');

var PORT = 13532;
var INTERVAL = 100;
var HOST = 'http://localhost:'+PORT;
var OPTIONS = {
	interval: INTERVAL,
	once: true
};

var test1 = function() {
	test('Server up', function(t) {
		t.plan(1);
		monitor(HOST+'/ok', OPTIONS, function(err) {
			t.notOk(err);
		});
	});
};
var test2 = function() {
	test('Server errors', function(t) {
		t.plan(1);
		monitor(HOST+'/500', OPTIONS, function(err) {
			t.ok(err);
		});
	});
};
var test3 = function() {
	test('Server errors, but 500 allowed', function(t) {
		var options = {
			interval: INTERVAL,
			once: true,
			allowed: [500]
		};

		t.plan(1);
		monitor(HOST+'/500', options, function(err) {
			t.notOk(err);
		});
	});
};
var test4 = function() {
	var url = HOST+'/everyThirdIsOk';
	var options = {
		interval: INTERVAL,
		retries: 2,
		once: true
	};

	test('Correct returns after several wrong ones resets the "wrong stack"', function(t) {
		t.plan(2);
		monitor(url, options, function(err) {
			t.notOk(err);

			req(HOST+'/resetEveryThirdIsOk', function() {
				options.retries = 2;
				monitor(url, options, function(err) {
					t.notOk(err);
				});
			});
		});
	});
};
var test5 = function() {
	test('Error and no statuscode when hostname doesn\'t exist', function(t) {
		t.plan(2);
		monitor('http://nosuchhost:12345', OPTIONS, function(err) {
			t.ok(err);
			t.equal(undefined, err.statusCode);
		});
	});
};
var test6 = function() {
	var options = {
		interval: INTERVAL,
		once: true,
		disallowed: [200]
	};
	test('Disallow 200', function(t) {
		t.plan(1);
		monitor(HOST+'/ok', OPTIONS, function(err) {
			t.notOk(err);
		});
	});
};
var test7 = function() {
	var options = {
		interval: 10,
		retries: 2
	};

	test('Only run the error function once, even though the service keeps erroring', function(t) {
		var calls = 0;
		var stop = monitor(HOST+'/failAfterThird', options, function(err) {
			t.ok(!calls++, "Call once");
		});
		setTimeout(function() {
			stop();
			t.end();
		}, 2000);
	});
};
var test8 = function() {
	var options = {
		interval: 10,
		retries: 2
	};

	test('Server errors, then recovers, then errors - should invoke callback three times, twice with an error', function(t) {
		var calls = 0;
		var stop = monitor(HOST+'/failAfterThird', options, function(err) {
			calls++;
			if (calls === 1) t.ok(err);
			if (calls === 2) t.notOk(err);
			if (calls === 3) t.ok(err);
			if (calls > 3) t.ok(false);
		});
		setTimeout(function() {
			req(HOST+'/resetFailAfterThird');
		}, 1000);
		setTimeout(function() {
			stop();
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
});
