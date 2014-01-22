echo "NOTE: Remember to do 'npm run server' first"
echo ""
echo "This example demonstrates how http-monitor reacts when a server times out."
echo "The server will never reply."
echo "If working you should see 'error' being printed out once."
echo ""
./http-monitor http://localhost:13532/timeout --on-error "echo error" --on-recovery "echo recovery" --timeout 3s --interval 200ms --retries 1
