# Guida per Esportare il Progetto su GitHub

Questa guida ti aiuterà a pubblicare il progetto STUDIO su GitHub.

## Prerequisiti

1. **Account GitHub**: Se non ce l'hai, creane uno su [github.com](https://github.com)
2. **Git installato**: Scarica Git da [git-scm.com](https://git-scm.com/download/win)

## Passo 1: Inizializza il Repository Git

Apri Git Bash o il terminale e naviga nella cartella del progetto:

```bash
cd C:\Users\franc\Documents\STUDIO-main\STUDIO-main
```

Inizializza il repository:

```bash
git init
```

## Passo 2: Configura Git (se non l'hai già fatto)

```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@example.com"
```

## Passo 3: Aggiungi i File

Aggiungi tutti i file al repository:

```bash
git add .
```

Verifica i file aggiunti:

```bash
git status
```

## Passo 4: Crea il Primo Commit

```bash
git commit -m "Initial commit: Sistema completo di geoblocking e protezione DDoS"
```

## Passo 5: Crea il Repository su GitHub

1. Vai su [github.com](https://github.com) e accedi
2. Clicca sul pulsante **"+"** in alto a destra
3. Seleziona **"New repository"**
4. Compila i dettagli:
   - **Repository name**: `STUDIO` (o il nome che preferisci)
   - **Description**: "Sistema di studio avanzato con geoblocking e protezione DDoS"
   - **Visibility**: Scegli **Public** o **Private**
   - **NON** selezionare "Initialize with README" (abbiamo già i file)
5. Clicca **"Create repository"**

## Passo 6: Collega il Repository Locale a GitHub

GitHub ti mostrerà le istruzioni. Esegui questi comandi (sostituisci `TUO_USERNAME` con il tuo username GitHub):

```bash
git remote add origin https://github.com/TUO_USERNAME/STUDIO.git
git branch -M main
git push -u origin main
```

Se GitHub ti chiede autenticazione:
- **Username**: Il tuo username GitHub
- **Password**: Usa un **Personal Access Token** (non la password normale)
  - Vai su GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Genera un nuovo token con permessi `repo`
  - Usa quel token come password

## Alternativa: Usa GitHub CLI

Se hai installato GitHub CLI:

```bash
gh repo create STUDIO --public --source=. --remote=origin --push
```

## Verifica

Dopo il push, ricarica la pagina del repository su GitHub. Dovresti vedere tutti i tuoi file!

## File Importanti da NON Committare

Il `.gitignore` è già configurato per escludere:
- `.env.local` (contiene chiavi API sensibili)
- `node_modules/`
- `.next/`
- File di build

**IMPORTANTE**: Prima di fare push, assicurati che:
- ✅ Non ci siano file `.env.local` nel repository
- ✅ Le chiavi API siano solo in `.env.local` (non committate)
- ✅ Il file `env.example.txt` sia presente (senza valori reali)

## Prossimi Passi

Dopo aver pubblicato su GitHub:

1. **Aggiungi un README.md** descrittivo
2. **Configura GitHub Actions** per CI/CD (opzionale)
3. **Aggiungi licenza** (MIT, Apache, etc.)
4. **Configura GitHub Pages** se vuoi hostare il sito (opzionale)

## Troubleshooting

### Errore: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TUO_USERNAME/STUDIO.git
```

### Errore: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Errore di autenticazione
- Usa un Personal Access Token invece della password
- Oppure configura SSH keys

## Supporto

Per problemi, consulta:
- [Documentazione Git](https://git-scm.com/doc)
- [GitHub Help](https://help.github.com)
