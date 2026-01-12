# 🤖 Deploy Automatico su Firebase

## ✅ Configurazione Automatica Completata

Ho creato i file necessari per il deploy automatico. Ora hai due opzioni:

## 🎯 Opzione 1: Integrazione GitHub → Firebase (CONSIGLIATA)

Questo è il metodo più semplice e completamente automatico:

### Passo 1: Collega Repository nella Console Firebase

1. Vai su: **https://console.firebase.google.com/project/studio-30473466-5d76c/apphosting**
2. Clicca **"Connect repository"** o **"Get started"**
3. Seleziona **GitHub**
4. Autorizza Firebase (una volta sola)
5. Seleziona repository: **Studiozen/STUDIO**
6. Seleziona branch: **main**
7. Configura:
   - **Framework**: Next.js
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
8. Clicca **"Save"**

### ✅ Risultato

Dopo questa configurazione (una volta sola):
- ✅ **Ogni `git push`** → Deploy automatico
- ✅ **Build automatico** su Firebase
- ✅ **Deploy automatico** dell'app
- ✅ **Zero configurazione** aggiuntiva

## 🚀 Opzione 2: GitHub Actions (Alternativa)

Ho creato i workflow GitHub Actions in `.github/workflows/`:

### Configurazione Necessaria

1. Vai su GitHub: **https://github.com/Studiozen/STUDIO/settings/secrets/actions**

2. Aggiungi questi secrets:
   - `FIREBASE_SERVICE_ACCOUNT` - JSON della service account Firebase
   - `FIREBASE_API_KEY` - La tua API key Firebase
   - `FIREBASE_AUTH_DOMAIN` - studio-30473466-5d76c.firebaseapp.com

### Come Ottenere Firebase Service Account

1. Vai su: **https://console.firebase.google.com/project/studio-30473466-5d76c/settings/serviceaccounts/adminsdk**
2. Clicca **"Generate new private key"**
3. Scarica il file JSON
4. Copia tutto il contenuto
5. Incollalo come secret `FIREBASE_SERVICE_ACCOUNT` su GitHub

## 📝 Variabili d'Ambiente

**IMPORTANTE**: Configura le variabili su Firebase Console:

1. Vai su: **https://console.firebase.google.com/project/studio-30473466-5d76c/apphosting/settings/environment-variables**

2. Aggiungi tutte le variabili da `env.example.txt`

### Variabili Minime Necessarie:
```
GEO_BLOCKING_ENABLED=true
VPN_DETECTION_ENABLED=true
DDOS_PROTECTION_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## 🔄 Deploy Automatico

Dopo la configurazione iniziale:

1. **Fai modifiche al codice**
2. **Commit e push**:
   ```bash
   git add .
   git commit -m "Aggiornamento"
   git push origin main
   ```
3. **Firebase fa automaticamente**:
   - ✅ Rileva il push
   - ✅ Fa il build
   - ✅ Deploya l'app
   - ✅ Aggiorna l'URL live

## 🎯 URL Dopo Deploy

- **App Live**: https://studio-30473466-5d76c.web.app
- **Alternativo**: https://studio-30473466-5d76c.firebaseapp.com

## 📊 Monitoraggio

Puoi vedere:
- **Log di build**: Nella console Firebase App Hosting
- **Deploy status**: Nella console Firebase
- **GitHub Actions**: Se usi l'opzione 2, vedi i workflow su GitHub

## ✅ Checklist

- [x] Repository GitHub configurato
- [x] File di configurazione creati
- [ ] Repository collegato su Firebase Console (Opzione 1)
- [ ] Variabili d'ambiente configurate
- [ ] Firestore Rules deployate (una volta)

## 🆘 Problemi?

### Deploy non parte automaticamente
- Verifica che il repository sia collegato su Firebase Console
- Controlla che il branch sia `main`
- Verifica i log su Firebase Console

### Build fallisce
- Controlla i log di build su Firebase
- Verifica che `package.json` sia corretto
- Assicurati che tutte le dipendenze siano installate

---

**Una volta configurato, il deploy sarà completamente automatico! 🚀**
