@echo off
setlocal

rem Wrapper locale: esegue lo script Python in ..\src
rem ma opera sempre sulla repo corrente (archives/draws/draws.csv).

set "REPO_DIR=%~dp0.."
for %%I in ("%REPO_DIR%") do set "REPO_DIR=%%~fI"
set "PY_SCRIPT=%REPO_DIR%\..\src\update_archives_draws.py"

if not exist "%PY_SCRIPT%" (
  echo [ERRORE] Script non trovato: "%PY_SCRIPT%"
  echo Verifica che la cartella "..\src" esista accanto a secc.
  exit /b 1
)

python "%PY_SCRIPT%" update --repo "%REPO_DIR%" %*
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
  echo [ERRORE] update-draws fallito. exit_code=%RC%
  exit /b %RC%
)

if /I "%~1"=="--help" exit /b 0
if /I "%~1"=="-h" exit /b 0

echo [OK] comando completato. Target: "%REPO_DIR%\archives\draws\draws.csv"
exit /b 0
