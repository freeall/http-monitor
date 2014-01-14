# http-monitor

Check if a server is running. Is both a module and an executable.

Will report an error on none, 4xx, or 5xx

## Installation

	npm install -g http-monitor

## Usage (command-line)

```
http-monitor http://localhost:12345/foo
	--on-error "commandline..."            # When both connection/http errors occur
	--on-connection-error "commandline..." # When there is no reply from the server
	--on-http-error "commandline..."       # When there is a 4xx or 5xx response code
	--interval 5min                        # How often to check
	--max-retries 4                        # How many times to retry
	--allow 501                            # Allow a 4xx or 5xx code which would otherwise cause an error
	--disallow 301                         # Disallow a 1xx, 2xx, or 3xx code which wouldn't otherwise cause an error
	--test
 ```

The `"commandline..."` part is a command you want executed when an error occurs. You can use `%url`, `%statuscode`, and `%body` in this. e.g. `--on-error "call 1234567890 Hi Bill. Server crashed, %url. Returned %statuscode and %body"`.

## Usage (module)

### Example

``` js
var monitor = require('http-monitor');

monitor('http://localhost:13532/', {
	tries: 1
}, function(err, statusCode, body) {
	if (!err) return;
	if (!statusCode) {
		console.log('Could not reach host');
	} else {
		console.log('Error! ['+statusCode+'] '+body);
	}
});
```

### Options

#### interval (miliseconds)

How many miliseconds to wait between the checks. Default is `5000`.

#### tries (integer)

How many tries in a row that should fail before it will call the callback with an error. Default is `1`.

#### allowed (array)

As default http-monitor will call the callback with an error if the server returned a 4xx or 5xx status code. This allows http-monitor to allow certain error codes. `[501, 502]` would allow the server to return 501 and 502. Default is `[]`.

#### disallowed (array)

As default http-monitor will call the callback without an error if the server returned a 1xx, 2xx, or 3xx status code. Use this to disallow certain error codes and call the callback with an error. `[301, 307]` would disallow the server to return 301 and 307. Default is `[]`.

#### once (bool)

http-monitor will keep pinging the server at the url, but if you set once to true, then it will only happen once and after the callback has been called the first time, it will stop. Default is `false`.