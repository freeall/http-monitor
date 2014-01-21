var http = require('http');

var requestsEveryThirdIsOk = 0;
var requestsFailAfterThird = 0;
var server = http.createServer(function(request, response) {
	var url = request.url;

	if (url === '/ok') return response.end('ok');
	if (url === '/timeout') return;
	if (url === '/500') {
		response.statusCode = 500;
		return response.end('error');
	}
	if (url === '/everyThirdIsOk') {
		++requestsEveryThirdIsOk;
		response.statusCode = !(requestsEveryThirdIsOk % 3) ? 500 : 200;
		return response.end();
	}
	if (url === '/resetEveryThirdIsOk') {
		requestsEveryThirdIsOk = 0;
		return response.end();
	}
	if (url === '/failAfterThird') {
		response.statusCode = ++requestsFailAfterThird > 3 ? 500 : 200;
		return response.end();
	}
	if (url === '/resetFailAfterThird') {
		requestsFailAfterThird = 0;
		return response.end();
	}
});
server.on('listening', function() {
	server.unref();
});
module.exports = server;