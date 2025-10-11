@echo off
REM AI Code Buddy - Test Runner (Windows)
REM Run all unit tests locally

echo.
echo ================================================
echo   AI Code Buddy - Running Unit Tests
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Display Node version
echo Node.js version:
node --version
echo.

REM Run unit tests only (fast)
echo Running unit tests...
echo.
npm test

if %ERRORLEVEL% neq 0 (
    echo.
    echo ================================================
    echo   ❌ UNIT TESTS FAILED!
    echo ================================================
    echo.
    echo Please fix the failing tests before committing.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   ✅ ALL UNIT TESTS PASSED!
echo ================================================
echo.
echo To run full validation (images + links):
echo   npm run test:all
echo.
echo You can safely commit your changes.
echo.

pause
