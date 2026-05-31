@echo off
echo.
echo  Tivo Design CRM - Deploy Script (Windows)
echo  ==========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Node.js not found. Install from: https://nodejs.org
    pause
    exit /b 1
)

echo  Installing dependencies...
call npm install

if not exist .env (
    echo.
    echo  Creating .env from template...
    copy .env.example .env
    echo.
    echo  IMPORTANT: Edit .env with your credentials before continuing!
    echo  Then run this script again.
    pause
    exit /b 1
)

echo  Building app...
call npm run build

echo  Installing Netlify CLI...
call npm install -g netlify-cli

echo  Deploying to Netlify...
call netlify login
call netlify deploy --prod --dir=dist --site=d9b0dea9-9435-45bb-bc47-153402593d8d

echo.
echo  DONE! Visit: https://tivo-design-crm.netlify.app
pause
