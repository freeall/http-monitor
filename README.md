# http-monitor [![build status](https://secure.travis-ci.org/freeall/http-monitor.png)](http://travis-ci.org/freeall/http-monitor)

Check if a server is running. Is both a module and an executable.

Will report an error if there is the statuscode is 4xx, 5xx or if the server doesn't respond.

## Installation

	npm install -g http-monitor

## Usage (command-line)

With the commandline tool you can set up commands that will be executed when the status of the server changes:

* The server responds with a 4xx or 5xx error code
* The server doesn't respond (no reply)
* The server recovers after some time where it errored

The commands will only be called once if the state of the server changes. Like this scenario:

	The server is running perfectly for 3 days, but now stops replying.  
	This will cause the on-connection-error to be executed once.  
	After 30 minutes the server starts to reply again, and then the on-recovery command is executed once.

```
http-monitor http://localhost:12345/foo
	--on-http-error "command..."       # When there is a 4xx or 5xx response code
	--on-connection-error "command..." # When there is a connection errror (no reply) from the server
	--on-error "command..."            # When either a connection/http error occur
	--on-recovery "command..."         # When the server recovers after a period with errors
	--interval 5min                    # How often to check
	--retries 4                        # How many times to retry
	--allow 501                        # Allow a 4xx or 5xx code which would otherwise cause an error
	--disallow 301                     # Disallow a 1xx, 2xx, or 3xx code which wouldn't otherwise cause an error
	--once                             # Only run once, then call callback and exit
 ```

The `"command..."` part is a command you want executed when an error occurs. You can use `%url`, `%statuscode`, and `%body` in this. e.g. `--on-http-error "call 1234567890 Hi Bill. Server crashed, %url. Returned %statuscode and %body"`.

## Usage (module)

### Example

``` js
var monitor = require('http-monitor');

monitor('http://localhost:13532/', {
	retries: 1
}).on('http-error', function(err) {
	console.log('The server returned a '+err.statusCode+' statuscode, with the body:'+err.body);
}).on('connection-error', function() {
	console.log('The server could not be reached');
}).on('error', function(err) {
	console.log('This is triggered on both http-error and connection-error');
}).on('recovery', function() {
	console.log('The server just recovered after downtime');
});
```

### Stopping the monitoring

The `monitor` function returns a stop-function. Call this to stop the monitor.

``` js
var monitor = require('http-monitor');

var localhost = monitor('http://localhost:13532/', {
	retries: 1
});

setTimeout(function() {
	// Stop the monitor after 60 seconds
	localhost.destroy();
}, 60000);
```

### Options

#### interval (miliseconds)

How many miliseconds to wait between the checks. Default is `5000`.

#### retries (integer)

How many tries in a row that should fail before it will call the callback with an error. Default is `1`.

#### timeout (integer)

How many miliseconds should each request maximum take before it is seen as an error. Default is `30000`.

#### allowed (array)

As default http-monitor will call the callback with an error if the server returned a 4xx or 5xx status code. This allows http-monitor to allow certain error codes. `[501, 502]` would allow the server to return 501 and 502. Default is `[]`.

#### disallowed (array)

As default http-monitor will call the callback without an error if the server returned a 1xx, 2xx, or 3xx status code. Use this to disallow certain error codes and call the callback with an error. `[301, 307]` would disallow the server to return 301 and 307. Default is `[]`.

#### once (bool)

Normally http-monitor will keep pinging the server at the url, but if you set once to true, then it will only happen once and after the callback has been called the first time, it will stop. Default is `false`.
