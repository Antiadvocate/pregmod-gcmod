@echo off

REM Echo the steps the script will perform
echo This script will:
echo 1. Check if dependencies are installed.
echo 2. Pull the latest changes from the specified remote repository.
echo 3. If the .git folder is not found, clone the repository from the specified URL. (https://gitgud.io/pregmodfan/fc-pregmod.git)

REM Get the directory where the batch file is located (repository directory)
set SCRIPT_DIR=%~dp0

REM Set the URL to clone the repository
set REPO_URL=https://gitgud.io/pregmodfan/fc-pregmod.git

REM Ask if we should proceed with the Git installation check
set /p PROCEED="Do you want to proceed? (y/n): "
if /I "%PROCEED%" neq "y" (
    echo Operation aborted.
    exit /B 0
)

:: run dependencyCheck.bat
CALL .\devTools\scripts\dependencyCheck.bat
SET CODE=%ERRORLEVEL%

IF %CODE% EQU 0 (
    REM Ensure we are inside the Git repository
    if exist ".git" (
        echo Pulling the latest changes from the specified remote repository...
        git pull origin
    ) else (
        echo .git folder not found. Cloning the repository...

        REM Initialize a new Git repository and set the origin
        git init
        git remote add origin %REPO_URL%
        git pull origin pregmod-master
    )
    echo Update complete!
)

@echo Exit
pause
