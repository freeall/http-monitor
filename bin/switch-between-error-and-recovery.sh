echo "NOTE: Remember to do 'npm run server' first"
echo ""
echo "This example demonstrates how http-monitor reacts when being used on a server that runs for a long time."
echo "The server switches between returning a 500 and 200 status code."
echo "If working you should see 'error' and 'recovery' being printed."
echo ""
./http-monitor http://localhost:13532/switchBetweenErrorAndRecovery --on-error "echo error" --on-recovery "echo recovery" --interval 200ms --retries 1
