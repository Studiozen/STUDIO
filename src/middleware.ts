
import { NextRequest, NextResponse } from 'next/server';
import { EUROPE_COUNTRY_CODES } from '@/lib/security-config';

// --- Variabili di Configurazione (da spostare in .env.local in produzione) ---
// Per ottenere una chiave API, visita: https://ip-api.com/docs/api:json
const IP_API_KEY = process.env.IP_API_KEY || ''; // Lascia vuoto per disabilitare il controllo VPN

/**
 * Funzione per verificare se un IP appartiene a una VPN, un proxy o un datacenter.
 * Utilizza il servizio ip-api.com.
 * @param ip L'indirizzo IP del client.
 * @returns true se l'IP è sospetto, altrimenti false.
 */
async function isVpnOrProxy(ip: string): Promise<boolean> {
  if (!IP_API_KEY) {
    // Se la chiave API non è configurata, salta il controllo per evitare errori.
    console.warn('Controllo VPN/Proxy disabilitato: la chiave API per ip-api.com non è impostata.');
    return false;
  }

  try {
    const response = await fetch(
      `http://pro.ip-api.com/json/${ip}?key=${IP_API_KEY}&fields=status,message,proxy,hosting`
    );
    const data = await response.json();

    if (data.status === 'success') {
      // Blocca se è un proxy (VPN, Tor, proxy pubblici) o se proviene da un datacenter (hosting).
      return data.proxy === true || data.hosting === true;
    } else {
      // In caso di errore nella chiamata API, non bloccare per evitare falsi positivi.
      console.error(`Errore API ip-api.com: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.error('Errore durante la chiamata al servizio di rilevamento IP:', error);
    return false; // Non bloccare in caso di fallimento della richiesta.
  }
}

/**
 * Middleware di sicurezza che viene eseguito su ogni richiesta.
 * Esegue i seguenti controlli in ordine:
 * 1. Geoblocking: Consente l'accesso solo agli IP provenienti dall'Europa.
 * 2. Blocco VPN/Proxy: Rileva e blocca l'uso di VPN, proxy e IP di datacenter.
 */
export async function middleware(request: NextRequest) {
  const { geo, ip } = request;

  // Header per ottenere l'IP reale (considerando Vercel/Firebase Hosting)
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || ip;
  const country = geo?.country || request.headers.get('x-vercel-ip-country');
  
  // --- 1. Geoblocking ---
  // Permetti l'accesso se il paese è nella lista o se l'informazione non è disponibile
  if (country && !EUROPE_COUNTRY_CODES.includes(country)) {
    // Restituisce un 404 per nascondere il fatto che il sito esiste ma è bloccato.
    return new NextResponse('Il sito non è disponibile nel tuo Paese.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // --- 2. Blocco VPN e Proxy (se configurato) ---
  if (clientIp && IP_API_KEY) {
    const isSuspicious = await isVpnOrProxy(clientIp);
    if (isSuspicious) {
      return new NextResponse('Access via VPN/Proxy is not permitted.', {
        status: 403,
      });
    }
  }
  
  // Se tutti i controlli passano, procedi con la richiesta
  const response = NextResponse.next();

  // --- 3. Aggiunta Security Headers ---
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com https://picsum.photos; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://firebase.googleapis.com wss://*.firebaseio.com;");
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// --- Configurazione del Middleware ---
export const config = {
  // Esegui il middleware su tutte le rotte, tranne quelle interne di Next.js
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sounds/.*).*)',
  ],
};
