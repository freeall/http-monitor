var monitor = require('../');
var server = require('./server');
var test = require('tap').test;
var req = require('request');

var PORT = 13532;
var INTERVAL = 200; // TODO: Set to 1 after httpcheck is updated when pull request is accepted by niallo
var HOST = 'http://localhost:'+PORT;
var OPTIONS = {
	interval: INTERVAL,
	once: true
};

var test1 = function() {
	test('Server replies', function(t) {
		t.plan(1);
		monitor(HOST+'/ok', OPTIONS, function(err, statusCode, body) {
			t.notOk(err);
		});
	});
};
var test2 = function() {
	test('Server errors', function(t) {
		t.plan(1);
		monitor(HOST+'/500', OPTIONS, function(err, statusCode, body) {
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
		monitor(HOST+'/500', options, function(err, statusCode, body) {
			t.notOk(err);
		});
	});
};
var test4 = function() {
	var url = HOST+'/everyThirdIsOk';
	var options = {
		interval: INTERVAL,
		tries: 2,
		once: true
	};

	test('Correct returns after several wrong ones resets the "wrong stack"', function(t) {
		t.plan(2);
		monitor(url, options, function(err, statusCode) {
			t.ok(err);

			req(HOST+'/reset', function() {
				options.tries = 3;
				monitor(url, options, function(err, statusCode, body) {
					t.notOk(err);
				});
			});
		});
	});
};
var test5 = function() {
	test('Body and statuscode is set correctly', function(t) {
		t.plan(3);
		monitor(HOST+'/ok', OPTIONS, function(err, statusCode, body) {
			t.notOk(err);
			t.equal(statusCode, 200);
			t.equal(body, 'ok');
		});
	});
};
var test6 = function() {
	test('Error and no statuscode when hostname doesn\'t exist', function(t) {
		t.plan(2);
		monitor('http://nosuchhost:12345', OPTIONS, function(err, statusCode, body) {
			t.ok(err);
			t.equal(undefined, statusCode);
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
		monitor(HOST+'/ok', OPTIONS, function(err, statusCode, body) {
			t.notOk(err);
		});
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
});