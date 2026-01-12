import { NextRequest, NextResponse } from 'next/server';
import { 
  EUROPE_COUNTRY_CODES, 
  isAdminIP, 
  isGeoWhitelisted,
  GEO_BLOCKING_CONFIG,
  VPN_DETECTION_CONFIG,
  DDOS_PROTECTION_CONFIG,
} from '@/lib/security-config';
import { checkGeoBlocking, createGeoBlockResponse } from '@/lib/geo-blocking';
import { shouldBlockVPN } from '@/lib/vpn-detection';
import { 
  checkDDoSProtection, 
  getRealIP, 
  addToBlacklist 
} from '@/lib/ddos-protection';
import { getBlacklist } from '@/lib/ip-blacklist';
import { logSecurityEvent } from '@/lib/security-logger';
import { getRateLimiter } from '@/lib/rate-limiter';

/**
 * Middleware di sicurezza avanzato che implementa:
 * 1. Geoblocking (solo traffico europeo)
 * 2. Rilevamento e blocco VPN/Proxy/Datacenter
 * 3. Protezione DDoS multi-livello (Layer 3/4 e Layer 7)
 * 4. Rate limiting
 * 5. Logging completo per audit
 */
export async function middleware(request: NextRequest) {
  const { geo, ip } = request;
  const path = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Ottieni IP reale (considerando proxy/CDN)
  const clientIp = getRealIP(request);

  // --- WHITELIST CHECK (bypassa tutti i controlli) ---
  if (isAdminIP(clientIp)) {
    return NextResponse.next();
  }

  // --- BLACKLIST CHECK ---
  const blacklist = getBlacklist();
  if (await blacklist.isBlacklisted(clientIp)) {
    logSecurityEvent({
      type: 'ddos_block',
      ip: clientIp,
      path,
      userAgent,
      reason: 'IP in blacklist',
      riskScore: 100,
    });

    return new NextResponse(
      JSON.stringify({ error: 'Access denied', message: 'Your IP has been blocked.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // --- 1. GEOBLOCKING (Solo traffico europeo) ---
  if (GEO_BLOCKING_CONFIG.enabled) {
    // Skip geoblocking per IP whitelisted
    if (!isGeoWhitelisted(clientIp)) {
      // Prova vari header per ottenere il paese (Vercel può usare diversi header)
      const vercelCountry = 
        geo?.country || 
        request.headers.get('x-vercel-ip-country') ||
        request.headers.get('cf-ipcountry') || // Cloudflare
        request.headers.get('x-country-code');
      
      const geoResult = await checkGeoBlocking(clientIp, vercelCountry || undefined);

      // Solo blocca se abbiamo una certezza che il paese NON è europeo
      // Se il paese è sconosciuto (null), permettiamo l'accesso per evitare falsi positivi
      if (!geoResult.isEuropean && geoResult.countryCode !== null) {
        logSecurityEvent({
          type: 'geoblock',
          ip: clientIp,
          country: geoResult.countryCode || undefined,
          path,
          userAgent,
          reason: `Non-European country: ${geoResult.countryCode || 'unknown'}`,
          metadata: {
            source: geoResult.source,
            country: geoResult.country,
            vercelCountry: vercelCountry || 'not-provided',
          },
        });

        return createGeoBlockResponse(
          GEO_BLOCKING_CONFIG.statusCode,
          GEO_BLOCKING_CONFIG.message
        );
      }
    }
  }

  // --- 2. VPN/PROXY/DATACENTER DETECTION ---
  if (VPN_DETECTION_CONFIG.enabled && clientIp && clientIp !== 'unknown') {
    try {
      const vpnCheck = await shouldBlockVPN(
        clientIp,
        VPN_DETECTION_CONFIG.confidenceThreshold
      );

      const shouldBlock = 
        vpnCheck.block &&
        (vpnCheck.result.isVpn || 
         vpnCheck.result.isProxy ||
         (VPN_DETECTION_CONFIG.blockDatacenter && vpnCheck.result.isDatacenter) ||
         (VPN_DETECTION_CONFIG.blockTor && vpnCheck.result.isTor));

      if (shouldBlock) {
        logSecurityEvent({
          type: 'vpn_block',
          ip: clientIp,
          path,
          userAgent,
          reason: `VPN/Proxy detected: ${vpnCheck.result.source}`,
          riskScore: vpnCheck.result.confidence,
          metadata: {
            isVpn: vpnCheck.result.isVpn,
            isProxy: vpnCheck.result.isProxy,
            isDatacenter: vpnCheck.result.isDatacenter,
            isTor: vpnCheck.result.isTor,
            provider: vpnCheck.result.provider,
          },
        });

        // Aggiungi a blacklist dopo multiple violazioni
        // (in produzione, usa Redis per tracking)

        return new NextResponse(
          JSON.stringify({
            error: 'Access denied',
            message: 'Access via VPN/Proxy is not permitted.',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (error) {
      // In caso di errore, non bloccare per evitare falsi positivi
      console.error('VPN detection error:', error);
    }
  }

  // --- 3. RATE LIMITING (Layer 3/4 DDoS Protection) ---
  const rateLimiter = getRateLimiter();
  const rateLimit = await rateLimiter.checkLimit(clientIp);

  if (!rateLimit.allowed) {
    logSecurityEvent({
      type: 'rate_limit',
      ip: clientIp,
      path,
      userAgent,
      reason: 'Rate limit exceeded',
      metadata: {
        remaining: rateLimit.remaining,
        resetTime: new Date(rateLimit.resetTime).toISOString(),
      },
    });

    // Aggiungi a blacklist dopo multiple violazioni di rate limit
    // (in produzione, implementa logica più sofisticata)

    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  // --- 4. DDoS PROTECTION LAYER 7 ---
  if (DDOS_PROTECTION_CONFIG.enabled) {
    try {
      const ddosCheck = await checkDDoSProtection(request, clientIp);

      if (ddosCheck.blocked) {
        logSecurityEvent({
          type: 'ddos_block',
          ip: clientIp,
          path,
          userAgent,
          reason: ddosCheck.reason || 'High risk score',
          riskScore: ddosCheck.riskScore,
        });

        // Aggiungi a blacklist per IP ad alto rischio
        if (ddosCheck.riskScore >= 90) {
          addToBlacklist(clientIp);
        }

        return new NextResponse(
          JSON.stringify({
            error: 'Access denied',
            message: 'Request blocked due to suspicious activity.',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Se richiede challenge CAPTCHA (per implementazione futura)
      if (ddosCheck.challengeRequired && DDOS_PROTECTION_CONFIG.enableCaptcha) {
        // TODO: Implementare challenge CAPTCHA
        // Per ora, logga l'evento
        logSecurityEvent({
          type: 'challenge',
          ip: clientIp,
          path,
          userAgent,
          reason: 'Challenge required',
          riskScore: ddosCheck.riskScore,
        });
      }
    } catch (error) {
      console.error('DDoS protection error:', error);
    }
  }

  // --- TUTTI I CONTROLLI PASSATI ---
  const response = NextResponse.next();

  // Aggiungi header di rate limiting
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());

  // --- SECURITY HEADERS ---
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://images.unsplash.com https://picsum.photos; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.googleapis.com https://firebase.googleapis.com wss://*.firebaseio.com;"
  );
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

// --- Configurazione del Middleware ---
export const config = {
  // Esegui il middleware su tutte le rotte, tranne quelle interne di Next.js e Firebase
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sounds/.*|__.*|api/.*).*)',
  ],
};
