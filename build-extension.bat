@echo off
REM AI Code Buddy - Build Script (Windows)
REM Creates a production-ready ZIP file for Chrome Web Store

echo.
echo Building AI Code Buddy Extension...
echo.

REM Read version from manifest.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" manifest.json') do set VERSION=%%~a

set BUILD_DIR=build
set OUTPUT_FILE=ai-code-buddy-v%VERSION%.zip

REM Clean previous build
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
if exist ai-code-buddy-*.zip del /q ai-code-buddy-*.zip

REM Create build directory
mkdir "%BUILD_DIR%"
mkdir "%BUILD_DIR%\icons"
mkdir "%BUILD_DIR%\docs"

echo Copying extension files...

REM Get current git commit info
for /f %%i in ('git rev-parse HEAD 2^>nul') do set GIT_COMMIT=%%i
for /f %%i in ('git rev-parse --short HEAD 2^>nul') do set GIT_COMMIT_SHORT=%%i

REM Set default values if git is not available
if not defined GIT_COMMIT set GIT_COMMIT=unknown
if not defined GIT_COMMIT_SHORT set GIT_COMMIT_SHORT=unknown

echo Updating VERSION.json with git commit: %GIT_COMMIT_SHORT%

REM Copy and update VERSION.json with current git commit
if exist VERSION.json (
  powershell -command "(Get-Content VERSION.json) -replace '\"git_commit\": \"[^\"]*\"', '\"git_commit\": \"%GIT_COMMIT%\"' -replace '\"git_commit_short\": \"[^\"]*\"', '\"git_commit_short\": \"%GIT_COMMIT_SHORT%\"' -replace '\"version\": \"[^\"]*\"', '\"version\": \"%VERSION%\"' | Set-Content '%BUILD_DIR%\VERSION.json'"
) else (
  echo Warning: VERSION.json not found, skipping
)

REM Copy essential extension files
copy manifest.json "%BUILD_DIR%\" >nul
copy content.js "%BUILD_DIR%\" >nul
copy background.js "%BUILD_DIR%\" >nul
copy providers.js "%BUILD_DIR%\" >nul
copy popup-multi.html "%BUILD_DIR%\" >nul
copy popup-multi.js "%BUILD_DIR%\" >nul
copy styles.css "%BUILD_DIR%\" >nul

REM Copy only PNG icons and SVG (not the generator or node_modules)
copy icons\*.png "%BUILD_DIR%\icons\" >nul 2>&1
copy icons\icon.svg "%BUILD_DIR%\icons\" >nul 2>&1

REM Copy essential documentation only
copy docs\SECURITY.md "%BUILD_DIR%\docs\" >nul 2>&1
copy docs\TROUBLESHOOTING.md "%BUILD_DIR%\docs\" >nul 2>&1
copy README.md "%BUILD_DIR%\" >nul 2>&1

echo.
echo Excluding from build:
echo    - .git, .claude, .gitignore
echo    - icons/node_modules, icons/package*.json, icons/generate-icons.js
echo    - icons/generate_icons.html (icon generator)
echo    - test/ directory
echo    - popup.html, popup.js (legacy files)
echo    - docs/API-KEYS-GUIDE.md (users can find online)

REM Create ZIP using PowerShell
echo.
echo Creating ZIP file...
powershell -command "Compress-Archive -Path '%BUILD_DIR%\*' -DestinationPath '%OUTPUT_FILE%' -Force"

REM Get file size
for %%A in ("%OUTPUT_FILE%") do set SIZE=%%~zA
set /a SIZE_KB=%SIZE%/1024

echo.
echo ================================
echo Build complete!
echo ================================
echo.
echo Output: %OUTPUT_FILE%
echo Size: %SIZE_KB% KB
echo.
echo Ready to upload to Chrome Web Store!
echo.
echo To test the build:
echo   1. Unzip %OUTPUT_FILE% to a test directory
echo   2. Load unpacked in chrome://extensions/
echo   3. Test all features work correctly
echo.

pause
