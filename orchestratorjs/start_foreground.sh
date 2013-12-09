#! /bin/sh

#Run

echo "Starting Orchestrator Service"

forever -o ./orchestrator.log orchestrator.js