# Script per deploy su Firebase
# Esegui questo script: .\deploy-firebase.ps1

Write-Host "=== Deploy su Firebase ===" -ForegroundColor Cyan
Write-Host ""

# Verifica Node.js
$nodePath = $null
$npmPath = $null

$possibleNodePaths = @(
    "$env:ProgramFiles\nodejs\node.exe",
    "$env:ProgramFiles(x86)\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $possibleNodePaths) {
    if (Test-Path $path) {
        $nodePath = $path
        $npmPath = Join-Path (Split-Path $path) "npm.cmd"
        break
    }
}

# Cerca anche npm direttamente
if (-not $npmPath) {
    $possibleNpmPaths = @(
        "$env:ProgramFiles\nodejs\npm.cmd",
        "$env:ProgramFiles(x86)\nodejs\npm.cmd",
        "$env:LOCALAPPDATA\Programs\nodejs\npm.cmd"
    )
    
    foreach ($path in $possibleNpmPaths) {
        if (Test-Path $path) {
            $npmPath = $path
            break
        }
    }
}

if (-not $npmPath) {
    Write-Host "ERRORE: Node.js/npm non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installa Node.js da: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Dopo l'installazione, riavvia il terminale e riprova." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Oppure usa npx direttamente:" -ForegroundColor Yellow
    Write-Host "  npx firebase-tools login" -ForegroundColor Gray
    Write-Host "  npx firebase-tools deploy" -ForegroundColor Gray
    exit 1
}

Write-Host "Node.js trovato: $nodePath" -ForegroundColor Green
Write-Host "npm trovato: $npmPath" -ForegroundColor Green
Write-Host ""

# Verifica se Firebase CLI e' installato
Write-Host "Verifica Firebase CLI..." -ForegroundColor Cyan
$firebaseCheck = & $npmPath list -g firebase-tools 2>&1
if ($LASTEXITCODE -ne 0 -or $firebaseCheck -match "empty") {
    Write-Host "Firebase CLI non installato. Installazione..." -ForegroundColor Yellow
    & $npmPath install -g firebase-tools
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRORE durante l'installazione di Firebase CLI!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Prova manualmente:" -ForegroundColor Yellow
        Write-Host "  npm install -g firebase-tools" -ForegroundColor Gray
        exit 1
    }
    Write-Host "OK Firebase CLI installato" -ForegroundColor Green
} else {
    Write-Host "OK Firebase CLI gia' installato" -ForegroundColor Green
}

Write-Host ""

# Verifica login
Write-Host "Verifica login Firebase..." -ForegroundColor Cyan
$loginCheck = & firebase projects:list 2>&1
if ($LASTEXITCODE -ne 0 -or $loginCheck -match "not logged in") {
    Write-Host "Login necessario. Apertura browser..." -ForegroundColor Yellow
    & firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRORE durante il login!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK Già autenticato" -ForegroundColor Green
}

Write-Host ""

# Seleziona progetto
Write-Host "Configurazione progetto Firebase..." -ForegroundColor Cyan
& firebase use studio-30473466-5d76c
if ($LASTEXITCODE -ne 0) {
    Write-Host "Avviso: Impossibile selezionare progetto automaticamente" -ForegroundColor Yellow
    Write-Host "Seleziona manualmente con: firebase use studio-30473466-5d76c" -ForegroundColor Gray
}

Write-Host ""

# Verifica se esiste firebase.json
if (-not (Test-Path "firebase.json")) {
    Write-Host "firebase.json non trovato. Inizializzazione..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IMPORTANTE: Segui le istruzioni interattive:" -ForegroundColor Cyan
    Write-Host "  - Seleziona: Hosting, Firestore, App Hosting" -ForegroundColor Gray
    Write-Host "  - Usa il progetto: studio-30473466-5d76c" -ForegroundColor Gray
    Write-Host "  - Per Next.js, usa: out (per export) o .next (per App Hosting)" -ForegroundColor Gray
    Write-Host ""
    
    $continue = Read-Host "Premi Invio per continuare con firebase init"
    & firebase init
} else {
    Write-Host "OK firebase.json trovato" -ForegroundColor Green
}

Write-Host ""

# Deploy
Write-Host "=== Deploy ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opzioni di deploy:" -ForegroundColor Yellow
Write-Host "  1. Deploy completo (tutto)" -ForegroundColor Gray
Write-Host "  2. Solo App Hosting" -ForegroundColor Gray
Write-Host "  3. Solo Firestore Rules" -ForegroundColor Gray
Write-Host "  4. Solo Hosting" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Scegli opzione (1-4, default: 1)"

switch ($choice) {
    "2" { 
        Write-Host "Deploy App Hosting..." -ForegroundColor Cyan
        & firebase deploy --only apphosting
    }
    "3" { 
        Write-Host "Deploy Firestore Rules..." -ForegroundColor Cyan
        & firebase deploy --only firestore:rules
    }
    "4" { 
        Write-Host "Deploy Hosting..." -ForegroundColor Cyan
        & firebase deploy --only hosting
    }
    default { 
        Write-Host "Deploy completo..." -ForegroundColor Cyan
        & firebase deploy
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Deploy Completato! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "L'app e' disponibile su:" -ForegroundColor Cyan
    Write-Host "  https://studio-30473466-5d76c.web.app" -ForegroundColor Gray
    Write-Host "  https://studio-30473466-5d76c.firebaseapp.com" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ERRORE durante il deploy!" -ForegroundColor Red
    Write-Host "Controlla i messaggi di errore sopra." -ForegroundColor Yellow
}
