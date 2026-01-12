# 🚀 Deploy Rapido su Firebase

## ⚠️ Node.js/npm non trovati nel PATH

Per fare il deploy su Firebase, hai due opzioni:

## Opzione 1: Usa npx (Nessuna Installazione)

Se Node.js è installato ma non nel PATH, puoi usare `npx` direttamente:

### 1. Login a Firebase
```bash
npx firebase-tools login
```

### 2. Seleziona il Progetto
```bash
npx firebase-tools use studio-30473466-5d76c
```

### 3. Deploy
```bash
npx firebase-tools deploy
```

## Opzione 2: Aggiungi Node.js al PATH

1. Trova dove è installato Node.js (solitamente):
   - `C:\Program Files\nodejs\`
   - `C:\Program Files (x86)\nodejs\`
   - `%LOCALAPPDATA%\Programs\nodejs\`

2. Aggiungi al PATH di sistema:
   - Apri "Variabili d'ambiente"
   - Modifica "Path"
   - Aggiungi il percorso di Node.js
   - Riavvia il terminale

3. Verifica:
   ```bash
   node --version
   npm --version
   ```

4. Installa Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

5. Deploy:
   ```bash
   firebase login
   firebase use studio-30473466-5d76c
   firebase deploy
   ```

## Opzione 3: Usa Firebase Console (Web)

1. Vai su: https://console.firebase.google.com/
2. Seleziona progetto: `studio-30473466-5d76c`
3. Vai su **App Hosting**
4. Clicca **"Deploy"** o **"Connect repository"**
5. Collega il repository GitHub: `https://github.com/Studiozen/STUDIO`
6. Firebase farà il deploy automatico ad ogni push

## 📝 Configurazione Necessaria

### Variabili d'Ambiente su Firebase

Configura le variabili d'ambiente su Firebase Console:

1. Vai su: https://console.firebase.google.com/project/studio-30473466-5d76c/apphosting
2. Settings → Environment Variables
3. Aggiungi tutte le variabili da `env.example.txt`

### Firestore Rules

Le regole sono già in `firestore.rules` e verranno deployate automaticamente.

## 🎯 URL Dopo Deploy

- **App Hosting**: https://studio-30473466-5d76c.web.app
- **Hosting Classico**: https://studio-30473466-5d76c.firebaseapp.com

## 🆘 Problemi?

### "firebase: command not found"
- Usa `npx firebase-tools` invece di `firebase`
- Oppure installa: `npm install -g firebase-tools`

### "Project not found"
```bash
npx firebase-tools use studio-30473466-5d76c
```

### "Permission denied"
```bash
npx firebase-tools login --reauth
```

## 📚 Documentazione

Vedi `DEPLOY_FIREBASE.md` per la guida completa.
