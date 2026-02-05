#!/bin/bash

# Echo the steps the script will perform
echo "This script will:"
echo "1. Check if dependencies are installed."
echo "2. Pull the latest changes from the specified remote repository."
echo "3. If the .git folder is not found, clone the repository from the specified URL. (https://gitgud.io/pregmodfan/fc-pregmod.git)"

# Set the URL to clone the repository
REPO_URL=https://gitgud.io/pregmodfan/fc-pregmod.git

# Ask if we should proceed with the Git installation check
read -p "Do you want to proceed? (y/n): " PROCEED
if [[ ! "$PROCEED" =~ ^[Yy]$ ]]; then
    echo "Operation aborted."
    exit 0
fi

# Run dependencyCheck.sh
./devTools/scripts/dependencyCheck.sh
CODE=$?

if [ $CODE -eq 0 ]; then
    # Ensure we are inside the Git repository
    if [ -d ".git" ]; then
        echo "Pulling the latest changes from the specified remote repository..."
        git pull origin
    else
        echo ".git folder not found. Cloning the repository..."

        # Initialize a new Git repository and set the origin
        git init
        git remote add origin $REPO_URL
        git pull origin pregmod-master
    fi
    echo "Update complete!"
fi
