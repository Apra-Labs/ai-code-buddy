@echo off
REM AI Code Buddy - Test Runner (Windows)
REM Wrapper that calls run-tests.sh using Git Bash

REM Check if bash is available
where bash >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: bash not found in PATH
    echo.
    echo This test runner requires Git Bash to be installed.
    echo Please install Git for Windows from: https://git-scm.com/download/win
    echo.
    echo Alternative: Run run-tests.sh directly in Git Bash or use "npm test"
    pause
    exit /b 1
)

REM Call run-tests.sh using bash
bash run-tests.sh
set EXIT_CODE=%ERRORLEVEL%

REM Pass through the exit code
if %EXIT_CODE% neq 0 (
    exit /b %EXIT_CODE%
)

exit /b 0
