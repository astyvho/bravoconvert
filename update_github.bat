@echo off
echo Starting GitHub update...
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Update: BravoConvert v2 - Google AdSense optimization complete"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo GitHub update completed!
echo.
pause 