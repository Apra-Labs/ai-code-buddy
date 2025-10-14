@echo off
REM AI Code Buddy - Build Script (Windows)
REM Wrapper that calls build.sh using Git Bash

REM Check if bash is available
where bash >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: bash not found in PATH
    echo.
    echo This build script requires Git Bash to be installed.
    echo Please install Git for Windows from: https://git-scm.com/download/win
    echo.
    echo Alternative: Run build.sh directly in Git Bash
    pause
    exit /b 1
)

REM Call build.sh using bash
echo Calling build.sh via Git Bash...
echo.
bash build.sh
set EXIT_CODE=%ERRORLEVEL%

REM Pass through the exit code
if %EXIT_CODE% neq 0 (
    echo.
    echo Build failed with exit code %EXIT_CODE%
    pause
    exit /b %EXIT_CODE%
)

echo.
pause
exit /b 0
