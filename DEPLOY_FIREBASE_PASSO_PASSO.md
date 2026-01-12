# 🚀 Deploy Firebase - Guida Passo-Passo IMMEDIATA

## ✅ Tutto è Pronto!

- ✅ Codice pushato su GitHub: https://github.com/Studiozen/STUDIO
- ✅ Errori Firebase risolti
- ✅ Configurazione completa
- ✅ Console Firebase aperta

## 📝 PASSO 1: Collega Repository GitHub (2 minuti)

Nella console Firebase che si è appena aperta:

### 1.1 Trova il Pulsante
Cerca uno di questi pulsanti:
- **"Connect repository"** 
- **"Get started"**
- **"Deploy"**
- **"New app"**

### 1.2 Seleziona GitHub
1. Clicca sul pulsante trovato
2. Seleziona **"GitHub"** come provider
3. Se richiesto, **autorizza** Firebase ad accedere a GitHub
   - Clicca "Authorize Firebase"
   - Seleziona il tuo account GitHub
   - Clicca "Authorize"

### 1.3 Seleziona Repository
1. Repository: **Studiozen/STUDIO**
2. Branch: **main**
3. Clicca **"Continue"** o **"Next"**

### 1.4 Configura Build
Compila questi campi:
- **Framework preset**: Seleziona **"Next.js"**
- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Node version**: `18` o superiore
- **Region**: Scegli la più vicina (es: `europe-west1`)

### 1.5 Salva e Deploy
1. Clicca **"Save"** o **"Deploy"**
2. Firebase inizierà automaticamente:
   - ✅ Clone del repository
   - ✅ Installazione dipendenze
   - ✅ Build dell'app
   - ✅ Deploy

**Tempo stimato**: 5-10 minuti

## ⚙️ PASSO 2: Configura Variabili d'Ambiente (Durante il Build)

Mentre il build è in corso, configura le variabili:

### 2.1 Vai su Settings
1. Nella pagina App Hosting, clicca **"Settings"** (in alto a destra)
2. Seleziona **"Environment Variables"**

### 2.2 Aggiungi Variabili
Clicca **"Add variable"** e aggiungi queste (una alla volta):

**Variabili Essenziali:**
```
GEO_BLOCKING_ENABLED=true
VPN_DETECTION_ENABLED=true
DDOS_PROTECTION_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

**Variabili Firebase (già configurate, ma verifica):**
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-30473466-5d76c
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAP_hAHVvjvSUlEYvHuuj2CvYg2iC6YjZ0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-30473466-5d76c.firebaseapp.com
```

**Variabili API (opzionali, aggiungi se le hai):**
```
IP_API_KEY=la_tua_chiave
IPHUB_API_KEY=la_tua_chiave
GETIPINTEL_API_KEY=la_tua_chiave
IPQS_API_KEY=la_tua_chiave
MAXMIND_LICENSE_KEY=la_tua_chiave
```

**Redis (se usi):**
```
REDIS_URL=redis://tuo-redis-url
```

### 2.3 Salva
Dopo aver aggiunto tutte le variabili, clicca **"Save"**

## 🔥 PASSO 3: Deploy Firestore Rules

### 3.1 Vai su Firestore
1. Vai su: **https://console.firebase.google.com/project/studio-30473466-5d76c/firestore/rules**
2. Oppure: Dashboard → **Firestore Database** → **Rules**

### 3.2 Copia le Regole
1. Apri il file `firestore.rules` dal repository GitHub:
   - https://github.com/Studiozen/STUDIO/blob/main/firestore.rules
2. Copia **tutto il contenuto**

### 3.3 Incolla e Pubblica
1. Incolla il contenuto nell'editor delle regole su Firebase
2. Clicca **"Publish"**

## ✅ PASSO 4: Verifica Deploy

### 4.1 Controlla Status
Torna su App Hosting e verifica:
- ✅ Build completato
- ✅ Deploy completato
- ✅ Status: **"Live"** o **"Active"**

### 4.2 URL dell'App
L'app sarà disponibile su:
- **https://studio-30473466-5d76c.web.app**
- **https://studio-30473466-5d76c.firebaseapp.com**

Clicca sull'URL per verificare che funzioni!

## 🔄 Deploy Automatico Futuro

Dopo questa configurazione iniziale:
- ✅ Ogni `git push origin main` → Deploy automatico
- ✅ Zero intervento manuale necessario
- ✅ Build e deploy automatici

## 🆘 Problemi Comuni

### Non vedo "Connect repository"
- Verifica di essere su: **App Hosting** (non Hosting classico)
- Controlla che il progetto sia attivo
- Prova a ricaricare la pagina

### Build fallisce
- Controlla i **log di build** nella console
- Verifica che `package.json` sia corretto
- Assicurati che tutte le dipendenze siano installate

### Variabili d'ambiente non funzionano
- Le variabili devono iniziare con `NEXT_PUBLIC_` per essere accessibili nel browser
- Riavvia il deploy dopo aver aggiunto variabili
- Verifica che siano salvate correttamente

### Errore di autorizzazione GitHub
- Vai su: https://github.com/settings/applications
- Verifica che Firebase sia autorizzato
- Rimuovi e riautorizza se necessario

## 📊 Monitoraggio

Dopo il deploy, puoi monitorare:
- **Logs**: Console App Hosting → Logs
- **Metrics**: Console App Hosting → Metrics
- **Deploy History**: Console App Hosting → Deploys

---

## 🎯 Riepilogo Rapido

1. ✅ Console Firebase aperta
2. ⏳ Collega repository GitHub (2 min)
3. ⏳ Configura variabili d'ambiente (3 min)
4. ⏳ Deploy Firestore Rules (1 min)
5. ✅ App live!

**Tempo totale**: ~6 minuti + tempo di build (5-10 min)

---

**Una volta completato, il tuo progetto sarà live su Firebase! 🚀**
