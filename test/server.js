var http = require('http');

var requests = 0;
var server = http.createServer(function(request, response) {
	var url = request.url;

	if (url === '/ok') return response.end('ok');
	if (url === '/timeout') return;
	if (url === '/500') {
		response.statusCode = 500;
		return response.end('error');
	}
	if (url === '/everyThirdIsOk') {
		response.statusCode = !(++requests % 3) ? 200 : 500;
		return response.end();
	}
	if (url === '/reset') {
		requests = 0;
		return response.end();
	}
});
server.on('listening', function() {
	server.unref();
});
module.exports = server;