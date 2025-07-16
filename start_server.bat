@echo off
REM Ścieżka do folderu z serwerem
SET SERVER_DIR=.\server

REM Sprawdź, czy folder serwera istnieje
IF NOT EXIST "%SERVER_DIR%" (
  ECHO Błąd: Folder serwera '%SERVER_DIR%' nie istnieje.
  ECHO Upewnij się, że skrypt 'start_server.bat' znajduje się w folderze 'cs2-crosshairs-app',
  ECHO a folder serwera to 'server'.
  PAUSE
  EXIT /b 1
)

ECHO Przechodzę do folderu serwera: %SERVER_DIR%
CD "%SERVER_DIR%"

REM Sprawdź, czy Node.js jest zainstalowany
WHERE node >NUL 2>NUL
IF %ERRORLEVEL% NEQ 0 (
  ECHO Błąd: Node.js nie jest zainstalowany. Zainstaluj Node.js aby uruchomić serwer.
  ECHO Instrukcje znajdziesz na: https://nodejs.org/
  PAUSE
  EXIT /b 1
)

REM Sprawdź, czy zależności są zainstalowane
IF NOT EXIST "node_modules" (
  ECHO Zależności Node.js nie zostały zainstalowane. Uruchamiam 'npm install'...
  npm install
  IF %ERRORLEVEL% NEQ 0 (
    ECHO Błąd: Nie udało się zainstalować zależności.
    PAUSE
    EXIT /b 1
  )
  ECHO Zależności zainstalowane pomyślnie.
)

ECHO Uruchamiam serwer Node.js...
node server.js

REM Opcjonalnie: poczekaj na zamknięcie serwera, jeśli chcesz, aby okno pozostało otwarte
REM PAUSE