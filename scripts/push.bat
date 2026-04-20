@echo off
REM ╔══════════════════════════════════════════════════╗
REM ║  OncologyReport — Push to GitHub                 ║
REM ║  Usage: scripts\push.bat "Your commit message"   ║
REM ╚══════════════════════════════════════════════════╝

cd /d "%~dp0.."

REM Check for commit message
IF "%~1"=="" (
    echo.
    echo  ERROR: Please provide a commit message.
    echo  Usage: scripts\push.bat "Add Apr 28 C5D7 draw"
    echo.
    pause
    exit /b 1
)

echo.
echo  ─────────────────────────────────────────────
echo  Step 1: Running validation checks...
echo  ─────────────────────────────────────────────
echo.

node scripts\validate.js
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ✗ Validation FAILED. Fix errors before pushing.
    echo.
    pause
    exit /b 1
)

echo.
echo  ─────────────────────────────────────────────
echo  Step 2: Staging files...
echo  ─────────────────────────────────────────────
echo.

git add index.html labs.html images\ favicon-512.png favicon-256.png favicon.ico 2>nul
git add index.html labs.html 2>nul

git status --short

echo.
echo  ─────────────────────────────────────────────
echo  Step 3: Committing...
echo  ─────────────────────────────────────────────
echo.

git commit -m "%~1"
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  Nothing to commit, or commit failed.
    echo.
    pause
    exit /b 1
)

echo.
echo  ─────────────────────────────────────────────
echo  Step 4: Pushing to GitHub...
echo  ─────────────────────────────────────────────
echo.

git push origin main
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ✗ Push FAILED. Check your GitHub credentials.
    echo.
    pause
    exit /b 1
)

echo.
echo  ─────────────────────────────────────────────
echo  ✅  Done! GitHub Pages will update in ~60s.
echo.
echo  Live URL:
echo  https://mph1969.github.io/cbc-oncology-report/
echo.
echo  Dr. Liu link:
echo  https://mph1969.github.io/cbc-oncology-report/?view=doctor
echo.
echo  Dr. Wen link (Chinese):
echo  https://mph1969.github.io/cbc-oncology-report/?view=doctor^&lang=zh
echo  ─────────────────────────────────────────────
echo.
pause
