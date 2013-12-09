#! /bin/sh

#Run

echo "Starting Orchestrator Service"

forever start -o ./orchestrator.log orchestrator.js