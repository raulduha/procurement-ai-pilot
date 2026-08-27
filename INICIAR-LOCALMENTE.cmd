@echo off
setlocal
if not exist .env.local (
  copy .env.example .env.local >nul
  echo Se creo .env.local. Abrelo y completa las claves antes de usar Claude, Supabase o SharePoint.
)
call npm install
if errorlevel 1 goto :error
call npm run dev
goto :end
:error
echo No se pudieron instalar las dependencias. Confirma que Node.js 22 este instalado y que tienes internet.
pause
:end
endlocal
