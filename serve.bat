@echo off
:: run a Node based web server

:: Set working directory
pushd %~dp0
SET BASEDIR=%~dp0

:: run dependencyCheck.bat
CALL .\devTools\scripts\dependencyCheck.bat
SET CODE=%ERRORLEVEL%

IF %CODE% EQU 69 (
	:: if exit code is 69, then we don't have all the dependencies we need
	ECHO.
	ECHO Dependencies not met.
    ECHO.
	EXIT /b 0
) ELSE IF %CODE% EQU 0 (
	:: if exit code is 0, run web server
	CALL npx http-server --port 6969 -c-1
	EXIT /b 0
) ELSE (
	:: if exit code is not 0, print error message
	ECHO.
	ECHO dependencyCheck.bat exited with code: %CODE%
	ECHO Dependency check failed.
    ECHO.
    EXIT /b 0
)
