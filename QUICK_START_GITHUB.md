# 🚀 Guida Rapida: Esportare su GitHub

## ⚠️ Git non è installato

Per esportare il progetto su GitHub, devi prima installare Git.

## 📥 Passo 1: Installa Git

1. **Scarica Git per Windows**: https://git-scm.com/download/win
2. **Installa Git** usando le impostazioni predefinite
3. **Riavvia il terminale** dopo l'installazione

## 🔄 Passo 2: Esegui lo Script Automatico

Dopo aver installato Git, esegui:

```powershell
.\setup-github.ps1
```

## 📝 Passo 3: Comandi Manuali (Alternativa)

Se preferisci fare tutto manualmente:

### 1. Inizializza Git
```bash
git init
```

### 2. Configura Git (solo la prima volta)
```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@example.com"
```

### 3. Aggiungi i file
```bash
git add .
```

### 4. Crea il commit
```bash
git commit -m "Initial commit: Sistema completo di geoblocking e protezione DDoS"
```

### 5. Crea repository su GitHub
- Vai su: https://github.com/new
- Nome repository: `STUDIO` (o quello che preferisci)
- **NON** selezionare "Initialize with README"
- Clicca "Create repository"

### 6. Collega e pusha
```bash
git remote add origin https://github.com/TUO_USERNAME/STUDIO.git
git branch -M main
git push -u origin main
```

**Nota**: Quando ti chiede username/password:
- **Username**: Il tuo username GitHub
- **Password**: Usa un **Personal Access Token** (non la password normale)
  - Crea token qui: https://github.com/settings/tokens
  - Seleziona permessi `repo`
  - Usa quel token come password

## ✅ Verifica

Dopo il push, ricarica la pagina del repository su GitHub. Dovresti vedere tutti i file!

## 🆘 Problemi?

- **Git non trovato**: Assicurati di aver riavviato il terminale dopo l'installazione
- **Errore autenticazione**: Usa Personal Access Token invece della password
- **Errore "remote origin already exists"**: 
  ```bash
  git remote remove origin
  git remote add origin https://github.com/TUO_USERNAME/STUDIO.git
  ```

## 📚 Documentazione Completa

Vedi `GITHUB_SETUP.md` per la guida dettagliata.
