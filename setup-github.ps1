# Script per esportare il progetto su GitHub
# Esegui questo script da PowerShell: .\setup-github.ps1

Write-Host "=== Setup GitHub Repository ===" -ForegroundColor Cyan
Write-Host ""

# Verifica se Git e' installato
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe",
    "$env:ProgramFiles(x86)\Git\cmd\git.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitPath = $path
        break
    }
}

if (-not $gitPath) {
    Write-Host "ERRORE: Git non trovato!" -ForegroundColor Red
    Write-Host "Scarica Git da: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Oppure esegui manualmente i comandi in Git Bash:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor Gray
    Write-Host "  git add ." -ForegroundColor Gray
    Write-Host "  git commit -m 'Initial commit'" -ForegroundColor Gray
    Write-Host "  git remote add origin https://github.com/TUO_USERNAME/STUDIO.git" -ForegroundColor Gray
    Write-Host "  git push -u origin main" -ForegroundColor Gray
    exit 1
}

Write-Host "Git trovato: $gitPath" -ForegroundColor Green
Write-Host ""

# Verifica se e' gia' un repository git
if (Test-Path ".git") {
    Write-Host "Repository Git gia' inizializzato." -ForegroundColor Yellow
    $continue = Read-Host "Vuoi continuare comunque? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
} else {
    Write-Host "Inizializzazione repository Git..." -ForegroundColor Cyan
    & $gitPath init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRORE durante l'inizializzazione!" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK Repository inizializzato" -ForegroundColor Green
}

Write-Host ""
Write-Host "Aggiunta file al repository..." -ForegroundColor Cyan
& $gitPath add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE durante l'aggiunta dei file!" -ForegroundColor Red
    exit 1
}
Write-Host "OK File aggiunti" -ForegroundColor Green

Write-Host ""
$commitMessage = Read-Host "Messaggio per il commit (premi Invio per usare il default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Initial commit: Sistema completo di geoblocking e protezione DDoS"
}

Write-Host "Creazione commit..." -ForegroundColor Cyan
& $gitPath commit -m "$commitMessage"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE durante il commit!" -ForegroundColor Red
    Write-Host "Assicurati di aver configurato Git:" -ForegroundColor Yellow
    Write-Host "  git config --global user.name 'Il Tuo Nome'" -ForegroundColor Gray
    Write-Host "  git config --global user.email 'tua.email@example.com'" -ForegroundColor Gray
    exit 1
}
Write-Host "OK Commit creato" -ForegroundColor Green

Write-Host ""
Write-Host "=== Prossimi Passi ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crea un nuovo repository su GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Dopo aver creato il repository, esegui questi comandi:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git remote add origin https://github.com/TUO_USERNAME/STUDIO.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Per l'autenticazione, usa un Personal Access Token:" -ForegroundColor Yellow
Write-Host "   https://github.com/settings/tokens" -ForegroundColor Gray
Write-Host ""
Write-Host "Per maggiori dettagli, consulta: GITHUB_SETUP.md" -ForegroundColor Cyan
