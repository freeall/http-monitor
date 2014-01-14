pinger http://localhost:12345/foo
	--on-error                   // On any type of errors
	--on-connection-error "...." // When there is no reply from the server
	--on-http-error "...."       // When there is a 4xx or 5xx response code
	--interval 5min
	--timeout 1min
	--allow 501
	--max-retries 4
	--test
 
The "...." binds a few variables.
$url='http://localhost:12345/foo'
$errorcode='505'
$message='Got a bad response from mongohq.com, blablaa'
 
Eg,
--on-connection-error "sendtext 22305200 No response from $url"
--on-http-error "sendtext 22305200 Error: $errorcode\nUrl: $url\nMessage:$message"