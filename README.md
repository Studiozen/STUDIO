# STUDIO - Sistema di Studio Avanzato

Sistema completo di studio con funzionalità avanzate di sicurezza, geoblocking e protezione DDoS.

## 🚀 Funzionalità

- **Chat AI** - Sistema di chat intelligente con supporto multi-lingua
- **Generazione Flashcard** - Crea flashcard automaticamente dal contenuto
- **Sommario Automatico** - Genera riassunti da immagini e testi
- **Focus Timer** - Timer Pomodoro per sessioni di studio concentrate
- **Quiz Interattivi** - Sistema di quiz e domande
- **Storia Completa** - Tracciamento di tutte le attività di studio

## 🔒 Sistema di Sicurezza Avanzato

### Geoblocking
- Blocca traffico non europeo (solo paesi UE/EEA)
- Supporto MaxMind GeoIP2 e IP-API
- Risposta HTTP 451 personalizzabile

### Rilevamento VPN/Proxy
- Rilevamento multi-API (IPHub, GetIPIntel, IPQS, IP-API)
- Blocco provider VPN noti (NordVPN, ExpressVPN, etc.)
- Rilevamento Tor e datacenter IP

### Protezione DDoS Multi-Livello
- **Layer 3/4**: Rate limiting, connection throttling
- **Layer 7**: User-Agent validation, request signature analysis
- Risk scoring e challenge CAPTCHA (opzionale)

### Rate Limiting
- Limite configurabile per IP (default: 100 req/min)
- Supporto Redis per distribuzione
- Fallback in-memory

### Logging e Monitoring
- Log completo degli eventi di sicurezza
- Statistiche e export (JSON/CSV)
- Supporto log esterni

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- Firebase account (per autenticazione e database)
- Redis (opzionale, per rate limiting distribuito)

## 🛠️ Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/TUO_USERNAME/STUDIO.git
   cd STUDIO
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   ```bash
   cp env.example.txt .env.local
   ```
   
   Modifica `.env.local` e aggiungi:
   - Chiavi API per servizi esterni (vedi `docs/security-setup.md`)
   - Configurazione Firebase
   - Whitelist IP (opzionale)

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri nel browser**
   ```
   http://localhost:3000
   ```

## ⚙️ Configurazione Sicurezza

Per configurare il sistema di sicurezza, consulta:
- [`docs/security-setup.md`](docs/security-setup.md) - Guida completa
- [`env.example.txt`](env.example.txt) - Esempio variabili d'ambiente

### Variabili d'Ambiente Essenziali

```env
# Geoblocking
GEO_BLOCKING_ENABLED=true
GEO_BLOCK_STATUS_CODE=451

# VPN Detection
VPN_DETECTION_ENABLED=true
VPN_CONFIDENCE_THRESHOLD=50

# DDoS Protection
DDOS_PROTECTION_ENABLED=true
DDOS_BLOCK_THRESHOLD=80

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Redis (opzionale)
REDIS_URL=redis://localhost:6379
```

## 📚 Documentazione

- [`docs/security-setup.md`](docs/security-setup.md) - Configurazione sistema di sicurezza
- [`docs/blueprint.md`](docs/blueprint.md) - Architettura del progetto
- [`GITHUB_SETUP.md`](GITHUB_SETUP.md) - Guida per esportare su GitHub

## 🏗️ Struttura del Progetto

```
STUDIO/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componenti React
│   ├── lib/              # Utilities e logica di sicurezza
│   │   ├── geo-blocking.ts
│   │   ├── vpn-detection.ts
│   │   ├── ddos-protection.ts
│   │   ├── rate-limiter.ts
│   │   └── security-logger.ts
│   ├── middleware.ts    # Middleware di sicurezza
│   └── firebase/         # Configurazione Firebase
├── docs/                 # Documentazione
└── public/               # File statici
```

## 🔐 Sicurezza

### Best Practices Implementate

- ✅ Geoblocking per conformità legale
- ✅ Rilevamento VPN/Proxy avanzato
- ✅ Protezione DDoS multi-livello
- ✅ Rate limiting distribuito
- ✅ Logging completo per audit
- ✅ Whitelist IP amministrativi
- ✅ Security headers HTTP
- ✅ Failover automatici

### Conformità GDPR

- I log IP sono necessari per sicurezza
- Retention policy configurabile
- Meccanismo per rimuovere IP dalla blacklist

## 🚀 Deploy

### Vercel (Consigliato)

```bash
npm install -g vercel
vercel
```

### Firebase App Hosting

```bash
firebase deploy
```

### Docker

```bash
docker build -t studio .
docker run -p 3000:3000 studio
```

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build
```

## 📝 Script Disponibili

- `npm run dev` - Server di sviluppo
- `npm run build` - Build produzione
- `npm run start` - Avvia server produzione
- `npm run lint` - Esegue linter
- `npm run typecheck` - Verifica TypeScript

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi `LICENSE` per dettagli.

## 🙏 Ringraziamenti

- Next.js per il framework
- Firebase per l'infrastruttura
- Radix UI per i componenti
- Tutti i servizi API utilizzati per la sicurezza

## 📞 Supporto

Per problemi o domande:
- Apri una [Issue](https://github.com/TUO_USERNAME/STUDIO/issues)
- Consulta la [documentazione](docs/)
- Controlla i [log di sicurezza](src/lib/security-logger.ts)

---

**Nota**: Assicurati di configurare correttamente le variabili d'ambiente prima di andare in produzione. Vedi [`docs/security-setup.md`](docs/security-setup.md) per dettagli.
