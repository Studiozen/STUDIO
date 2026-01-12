# 🚀 Guida Passo-Passo: Deploy su Firebase

## ✅ Metodo Consigliato: Firebase Console (Web)

Questo è il metodo più semplice e non richiede installazioni locali!

## 📝 Passo 1: Accedi alla Console Firebase

Ho già aperto la console per te. Se non si è aperta, vai su:
**https://console.firebase.google.com/project/studio-30473466-5d76c/apphosting**

## 🔗 Passo 2: Collega il Repository GitHub

1. Nella pagina **App Hosting**, cerca il pulsante:
   - **"Connect repository"** o
   - **"Deploy"** o
   - **"Get started"**

2. Seleziona **GitHub** come provider

3. Autorizza Firebase ad accedere al tuo account GitHub (se richiesto)

4. Seleziona il repository: **Studiozen/STUDIO**

5. Seleziona il branch: **main**

6. Configura il build:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build` (dovrebbe essere già precompilato)
   - **Output directory**: `.next` (per Next.js App Router)

7. Clicca **"Save"** o **"Deploy"**

## ⚙️ Passo 3: Configura Variabili d'Ambiente

**IMPORTANTE**: Configura tutte le variabili d'ambiente prima del deploy!

1. Nella pagina App Hosting, vai su **Settings** → **Environment Variables**

2. Aggiungi tutte le variabili da `env.example.txt`:

### Variabili Essenziali:
```
GEO_BLOCKING_ENABLED=true
VPN_DETECTION_ENABLED=true
DDOS_PROTECTION_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### Variabili API (aggiungi le tue chiavi):
```
IP_API_KEY=la_tua_chiave
IPHUB_API_KEY=la_tua_chiave (opzionale)
GETIPINTEL_API_KEY=la_tua_chiave (opzionale)
IPQS_API_KEY=la_tua_chiave (opzionale)
MAXMIND_LICENSE_KEY=la_tua_chiave (opzionale)
```

### Variabili Firebase (già configurate):
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-30473466-5d76c
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAP_hAHVvjvSUlEYvHuuj2CvYg2iC6YjZ0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-30473466-5d76c.firebaseapp.com
```

### Redis (se usi):
```
REDIS_URL=redis://tuo-redis-url
```

## 🚀 Passo 4: Deploy Automatico

Dopo aver collegato il repository:
- Firebase farà automaticamente il **build** e il **deploy**
- Puoi vedere i log in tempo reale
- Il deploy richiederà alcuni minuti

## ✅ Passo 5: Verifica Deploy

Dopo il deploy completato, l'app sarà disponibile su:
- **https://studio-30473466-5d76c.web.app**
- **https://studio-30473466-5d76c.firebaseapp.com**

## 🔄 Deploy Futuri

Ogni volta che fai `git push` su GitHub:
- Firebase rileva automaticamente le modifiche
- Fa il rebuild automatico
- Rilascia la nuova versione

## 🛠️ Passo 6: Deploy Firestore Rules

Le regole Firestore devono essere deployate separatamente:

### Opzione A: Usa Firebase Console
1. Vai su: **Firestore Database** → **Rules**
2. Copia il contenuto di `firestore.rules`
3. Incolla nelle regole
4. Clicca **"Publish"**

### Opzione B: Usa Firebase CLI (se installato)
```bash
firebase deploy --only firestore:rules
```

## 📊 Monitoraggio

Dopo il deploy, puoi monitorare:
- **Logs**: Vedi i log dell'applicazione
- **Metrics**: Metriche di performance
- **Usage**: Utilizzo risorse

## 🆘 Problemi Comuni

### Build Fallisce
- Verifica che tutte le dipendenze siano in `package.json`
- Controlla i log di build nella console
- Assicurati che `next.config.js` sia configurato correttamente

### Variabili d'Ambiente Non Funzionano
- Le variabili devono iniziare con `NEXT_PUBLIC_` per essere accessibili nel browser
- Riavvia il deploy dopo aver aggiunto variabili

### Errore di Autenticazione
- Verifica che Firebase sia autorizzato ad accedere a GitHub
- Controlla i permessi del repository GitHub

## 📚 Risorse

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/hosting/frameworks/nextjs)
- [Environment Variables](https://firebase.google.com/docs/app-hosting/manage-env-vars)

## ✅ Checklist Pre-Deploy

- [ ] Repository GitHub collegato
- [ ] Variabili d'ambiente configurate
- [ ] Build command corretto (`npm run build`)
- [ ] Output directory corretto (`.next`)
- [ ] Firestore rules deployate
- [ ] Test locale completato (opzionale)

---

**Una volta completato, il tuo progetto sarà live su Firebase! 🎉**
