@echo off
echo === Setup GitHub Repository ===
echo.

REM Verifica se Git e' installato
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE: Git non trovato!
    echo.
    echo Scarica Git da: https://git-scm.com/download/win
    echo.
    echo Dopo l'installazione, riavvia il terminale e riprova.
    pause
    exit /b 1
)

echo Git trovato!
echo.

REM Verifica se e' gia' un repository git
if exist ".git" (
    echo Repository Git gia' inizializzato.
    set /p continue="Vuoi continuare comunque? (s/n): "
    if /i not "%continue%"=="s" exit /b 0
) else (
    echo Inizializzazione repository Git...
    git init
    if %ERRORLEVEL% NEQ 0 (
        echo ERRORE durante l'inizializzazione!
        pause
        exit /b 1
    )
    echo OK Repository inizializzato
)

echo.
echo Aggiunta file al repository...
git add .
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE durante l'aggiunta dei file!
    pause
    exit /b 1
)
echo OK File aggiunti

echo.
set /p commitMessage="Messaggio per il commit (premi Invio per usare il default): "
if "%commitMessage%"=="" set commitMessage=Initial commit: Sistema completo di geoblocking e protezione DDoS

echo.
echo Creazione commit...
git commit -m "%commitMessage%"
if %ERRORLEVEL% NEQ 0 (
    echo ERRORE durante il commit!
    echo.
    echo Assicurati di aver configurato Git:
    echo   git config --global user.name "Il Tuo Nome"
    echo   git config --global user.email "tua.email@example.com"
    pause
    exit /b 1
)
echo OK Commit creato

echo.
echo === Prossimi Passi ===
echo.
echo 1. Crea un nuovo repository su GitHub:
echo    https://github.com/new
echo.
echo 2. Dopo aver creato il repository, esegui questi comandi:
echo.
echo    git remote add origin https://github.com/TUO_USERNAME/STUDIO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Per l'autenticazione, usa un Personal Access Token:
echo    https://github.com/settings/tokens
echo.
echo Per maggiori dettagli, consulta: GITHUB_SETUP.md
echo.
pause
