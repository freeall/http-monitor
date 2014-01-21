http-monitor http://localhost:13532/switchBetweenErrorARecovery --on-error "echo error" --on-recovery "echo recovery" --interval 200ms --retries 1
