# Guida alla Configurazione del Sistema di Sicurezza

Questo documento descrive come configurare e utilizzare il sistema completo di geoblocking e protezione DDoS.

## Panoramica

Il sistema implementa:

1. **Geoblocking IP** - Solo traffico europeo
2. **Rilevamento VPN/Proxy** - Blocca VPN, proxy e datacenter IP
3. **Protezione DDoS multi-livello** - Layer 3/4 e Layer 7
4. **Rate Limiting** - Limita richieste per IP
5. **Logging e Monitoring** - Audit completo degli eventi

## Configurazione

### 1. Variabili d'Ambiente

Copia `.env.example` in `.env.local` e configura le variabili necessarie:

```bash
cp .env.example .env.local
```

#### Variabili Essenziali

- `GEO_BLOCKING_ENABLED=true` - Abilita geoblocking
- `VPN_DETECTION_ENABLED=true` - Abilita rilevamento VPN
- `DDOS_PROTECTION_ENABLED=true` - Abilita protezione DDoS

#### API Keys (Opzionali ma Consigliate)

Per un rilevamento accurato, configura almeno una delle seguenti API:

1. **IP-API.com** (gratuito, limitato)
   - Ottieni chiave: https://ip-api.com/docs/api:json
   - Variabile: `IP_API_KEY`

2. **IPHub** (a pagamento, più accurato)
   - Ottieni chiave: https://iphub.info/
   - Variabile: `IPHUB_API_KEY`

3. **GetIPIntel** (gratuito con limiti)
   - Ottieni chiave: http://getipintel.net/
   - Variabile: `GETIPINTEL_API_KEY`

4. **IP Quality Score** (a pagamento, molto accurato)
   - Ottieni chiave: https://www.ipqualityscore.com/
   - Variabile: `IPQS_API_KEY`

5. **MaxMind GeoIP2** (per geolocalizzazione avanzata)
   - Ottieni chiave: https://www.maxmind.com/
   - Variabile: `MAXMIND_LICENSE_KEY`

### 2. Redis (Opzionale ma Consigliato)

Per rate limiting distribuito in produzione, configura Redis:

```bash
# Installa Redis localmente o usa servizio cloud (Redis Cloud, AWS ElastiCache, etc.)
REDIS_URL=redis://localhost:6379
```

Se Redis non è disponibile, il sistema usa automaticamente uno store in-memory.

### 3. Whitelist IP

Aggiungi IP amministrativi che devono bypassare tutti i controlli:

```env
ADMIN_IP_WHITELIST=192.168.1.1,10.0.0.1
```

Aggiungi IP che devono bypassare solo geoblocking:

```env
GEO_IP_WHITELIST=203.0.113.1
```

## Funzionalità Dettagliate

### Geoblocking

Il sistema blocca automaticamente tutto il traffico non europeo con risposta HTTP 451 (o 403).

**Paesi Permessi:**
- 27 stati membri dell'UE
- Paesi EEA (Islanda, Liechtenstein, Norvegia)
- Svizzera
- Regno Unito (configurabile)

**Configurazione:**
```env
GEO_BLOCKING_ENABLED=true
GEO_BLOCK_STATUS_CODE=451  # o 403
GEO_BLOCK_MESSAGE=This website is not available in your country.
```

### Rilevamento VPN

Il sistema rileva e blocca:
- VPN commerciali (NordVPN, ExpressVPN, etc.)
- Proxy pubblici
- Tor network (opzionale)
- IP datacenter (opzionale)

**Configurazione:**
```env
VPN_DETECTION_ENABLED=true
VPN_CONFIDENCE_THRESHOLD=50  # 0-100
VPN_BLOCK_DATACENTER=false
VPN_BLOCK_TOR=true
```

### Protezione DDoS

#### Layer 3/4 (Network)
- Rate limiting per IP (default: 100 req/min)
- Connection throttling
- SYN flood protection (gestito da infrastruttura)

#### Layer 7 (Application)
- User-Agent validation
- Request signature analysis
- Cookie validation
- Challenge CAPTCHA (opzionale)

**Configurazione:**
```env
DDOS_PROTECTION_ENABLED=true
DDOS_CHALLENGE_THRESHOLD=60  # Richiede challenge
DDOS_BLOCK_THRESHOLD=80      # Blocca richiesta
DDOS_ENABLE_CAPTCHA=false    # Abilita CAPTCHA
```

### Rate Limiting

Limita il numero di richieste per IP in una finestra temporale.

**Configurazione:**
```env
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_BURST=10
```

## Logging e Monitoring

Tutti gli eventi di sicurezza sono loggati automaticamente:

- Geoblocking
- Blocchi VPN
- Blocchi DDoS
- Rate limit exceeded
- Challenge richiesti

### Accesso ai Log

```typescript
import { getSecurityStats, getLogsForIP, exportLogs } from '@/lib/security-logger';

// Statistiche
const stats = getSecurityStats();

// Log per IP specifico
const logs = getLogsForIP('192.168.1.1', 100);

// Esporta log (JSON o CSV)
const jsonLogs = exportLogs('json');
const csvLogs = exportLogs('csv');
```

### Log Esterni

Configura un endpoint per inviare log a servizio esterno:

```env
SECURITY_LOG_ENDPOINT=https://logs.example.com/api/security
```

## Testing

### Test Geoblocking

1. Usa VPN per connetterti da paese non europeo
2. Verifica che la richiesta venga bloccata con HTTP 451

### Test VPN Detection

1. Connettiti tramite VPN commerciale
2. Verifica che la richiesta venga bloccata con HTTP 403

### Test Rate Limiting

1. Esegui più di 100 richieste in 1 minuto
2. Verifica che venga restituito HTTP 429

## Produzione

### Best Practices

1. **Usa Redis** per rate limiting distribuito
2. **Configura multiple API** per VPN detection (maggiore accuratezza)
3. **Monitora i log** regolarmente per falsi positivi
4. **Aggiungi IP whitelist** per servizi legittimi
5. **Usa Cloudflare o AWS WAF** come primo livello di protezione
6. **Configura alerting** per eventi sospetti

### Conformità GDPR

- I log IP sono necessari per sicurezza
- Implementa retention policy (es: 30 giorni)
- Fornisci meccanismo per rimuovere IP dalla blacklist
- Documenta nel privacy policy

### Failover e Alta Disponibilità

- Il sistema ha fallback automatici se API esterne falliscono
- Rate limiting funziona anche senza Redis (in-memory)
- Geoblocking usa multiple fonti (Vercel, MaxMind, IP-API)

## Troubleshooting

### Falsi Positivi

Se utenti legittimi vengono bloccati:

1. Verifica log: `getLogsForIP(ip)`
2. Aggiungi IP a whitelist appropriata
3. Riduci threshold se necessario
4. Verifica configurazione API

### Performance

Se il middleware è lento:

1. Usa Redis per rate limiting
2. Cache risultati geolocalizzazione
3. Disabilita API non essenziali
4. Usa CDN (Cloudflare) per primo livello

### Errori API

Se API esterne falliscono:

- Il sistema ha fallback automatici
- Non blocca richieste in caso di errore (fail-open)
- Verifica chiavi API e limiti di rate

## Supporto

Per problemi o domande, consulta:
- Documentazione API: Vedi file sorgente in `src/lib/`
- Log: Usa `getSecurityStats()` per statistiche
- Configurazione: Vedi `.env.example`
