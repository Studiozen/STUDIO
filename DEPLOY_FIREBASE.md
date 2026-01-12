# 🚀 Guida al Deploy su Firebase

## 📋 Prerequisiti

1. **Account Firebase**: https://console.firebase.google.com/
2. **Firebase CLI**: Installazione necessaria
3. **Node.js**: Già installato ✅

## 🔧 Installazione Firebase CLI

### Opzione 1: Installazione Globale (Consigliata)

```bash
npm install -g firebase-tools
```

### Opzione 2: Usa npx (senza installazione)

```bash
npx firebase-tools login
npx firebase-tools deploy
```

## 📝 Configurazione

### 1. Login a Firebase

```bash
firebase login
```

Questo aprirà il browser per autenticarti.

### 2. Inizializza Firebase (se necessario)

Se non esiste `firebase.json`, inizializza:

```bash
firebase init
```

Scegli:
- ✅ **Hosting** (per Next.js)
- ✅ **Firestore** (per database)
- ✅ **App Hosting** (se disponibile)

### 3. Configura il Progetto

Il progetto è già configurato con:
- **Project ID**: `studio-30473466-5d76c`
- **App Hosting**: `apphosting.yaml` presente
- **Firestore Rules**: `firestore.rules` presente

## 🚀 Deploy

### Deploy Completo

```bash
firebase deploy
```

### Deploy Solo Hosting

```bash
firebase deploy --only hosting
```

### Deploy Solo Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy App Hosting

```bash
firebase deploy --only apphosting
```

## ⚙️ Configurazione Firebase App Hosting

Il file `apphosting.yaml` è già configurato:

```yaml
runConfig:
  maxInstances: 1
```

Puoi aumentare `maxInstances` per gestire più traffico.

## 🔐 Variabili d'Ambiente

Per le variabili d'ambiente in produzione, configurale su Firebase Console:

1. Vai su: https://console.firebase.google.com/
2. Seleziona il progetto
3. Vai su **App Hosting** → **Settings** → **Environment Variables**
4. Aggiungi le variabili necessarie (vedi `env.example.txt`)

## 📊 Build e Deploy

### Build Locale (Test)

```bash
npm run build
```

### Deploy con Build

Firebase App Hosting farà il build automaticamente durante il deploy.

## 🎯 URL di Deploy

Dopo il deploy, l'app sarà disponibile su:
- **App Hosting**: `https://studio-30473466-5d76c.web.app`
- **Hosting Classico**: `https://studio-30473466-5d76c.firebaseapp.com`

## ⚠️ Note Importanti

1. **Variabili d'Ambiente**: Configura tutte le chiavi API su Firebase Console
2. **Firestore Rules**: Le regole sono già configurate in `firestore.rules`
3. **Sicurezza**: Il middleware di geoblocking funzionerà anche su Firebase
4. **Rate Limiting**: Se usi Redis, configura l'URL su Firebase

## 🆘 Troubleshooting

### Errore: "firebase: command not found"
```bash
npm install -g firebase-tools
```

### Errore: "Project not found"
```bash
firebase use studio-30473466-5d76c
```

### Errore: "Permission denied"
```bash
firebase login --reauth
```

### Build Fallisce
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla i log di build su Firebase Console

## 📚 Risorse

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Next.js on Firebase](https://firebase.google.com/docs/hosting/frameworks/nextjs)
