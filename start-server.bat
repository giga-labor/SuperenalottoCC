@echo off
setlocal

cd /d "%~dp0"
echo Avvio server locale su http://localhost:8000
rem python scripts\build-cards-index.py
python -m http.server 8000

endlocal
