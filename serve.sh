#!/bin/bash

# run a Node based web server

# run dependencyCheck.sh
./devTools/scripts/dependencyCheck.sh
exitCode=$?
# exit code is now stored in $exitCode

# if exit code is 69, then we don't have all the dependencies we need
if [[ $exitCode -eq 69 ]]; then
    echo "Dependencies not met."
    echo ""
   exit 0
# if exit code is not 0, print error message
elif [[ $exitCode -ne 0 ]]; then
	echo "dependencyCheck.sh exited with code: $exitCode"
    echo "Dependency check failed."
    echo ""
    exit 0
# if exit code is 0, run web server
else
    npx http-server --port 6969 -c-1
fi
