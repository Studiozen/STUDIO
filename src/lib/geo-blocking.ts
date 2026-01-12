/**
 * @fileoverview Sistema avanzato di geoblocking con supporto MaxMind GeoIP2
 * Blocca traffico non europeo con risposta HTTP 451 o 403
 */

import { EUROPE_COUNTRY_CODES } from './security-config';

export interface GeoIPResult {
  country: string | null;
  countryCode: string | null;
  continent: string | null;
  isEuropean: boolean;
  source: 'vercel' | 'maxmind' | 'ipapi' | 'fallback';
}

/**
 * Ottiene informazioni geografiche da MaxMind GeoIP2
 * Nota: Richiede database MaxMind GeoLite2 scaricato localmente
 */
async function getGeoIPFromMaxMind(ip: string): Promise<GeoIPResult | null> {
  try {
    // MaxMind GeoIP2 richiede il database locale
    // Per Next.js, possiamo usare un servizio API o un database locale
    const maxMindLicenseKey = process.env.MAXMIND_LICENSE_KEY;
    if (!maxMindLicenseKey) {
      return null;
    }

    // Alternativa: usare MaxMind GeoIP2 API (a pagamento)
    // O scaricare GeoLite2 e usare maxmind library
    const response = await fetch(
      `https://geoip.maxmind.com/geoip/v2.1/insights/${ip}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`:${maxMindLicenseKey}`).toString('base64')}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const countryCode = data.country?.iso_code || null;
      return {
        country: data.country?.names?.en || null,
        countryCode,
        continent: data.continent?.code || null,
        isEuropean: countryCode ? EUROPE_COUNTRY_CODES.includes(countryCode) : false,
        source: 'maxmind',
      };
    }
  } catch (error) {
    console.error('MaxMind GeoIP error:', error);
  }
  return null;
}

/**
 * Ottiene informazioni geografiche da ip-api.com (fallback)
 */
async function getGeoIPFromIPAPI(ip: string): Promise<GeoIPResult | null> {
  try {
    const apiKey = process.env.IP_API_KEY;
    const url = apiKey
      ? `http://pro.ip-api.com/json/${ip}?key=${apiKey}&fields=status,country,countryCode,continent`
      : `http://ip-api.com/json/${ip}?fields=status,country,countryCode,continent`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'success') {
      const countryCode = data.countryCode || null;
      return {
        country: data.country || null,
        countryCode,
        continent: data.continent || null,
        isEuropean: countryCode ? EUROPE_COUNTRY_CODES.includes(countryCode) : false,
        source: 'ipapi',
      };
    }
  } catch (error) {
    console.error('IP-API error:', error);
  }
  return null;
}

/**
 * Verifica se un IP proviene da un paese europeo
 * @param ip Indirizzo IP del client
 * @param vercelCountry Codice paese da Vercel (se disponibile)
 * @returns Risultato della verifica geografica
 */
export async function checkGeoBlocking(
  ip: string,
  vercelCountry?: string
): Promise<GeoIPResult> {
  // 1. Prova prima con Vercel geo (più veloce, già disponibile)
  if (vercelCountry) {
    const isEuropean = EUROPE_COUNTRY_CODES.includes(vercelCountry);
    return {
      country: null,
      countryCode: vercelCountry,
      continent: null,
      isEuropean,
      source: 'vercel',
    };
  }

  // 2. Prova con MaxMind GeoIP2 (più accurato)
  const maxMindResult = await getGeoIPFromMaxMind(ip);
  if (maxMindResult) {
    return maxMindResult;
  }

  // 3. Fallback a ip-api.com
  const ipApiResult = await getGeoIPFromIPAPI(ip);
  if (ipApiResult) {
    return ipApiResult;
  }

  // 4. Fallback: se non riusciamo a determinare, permettiamo l'accesso per default
  // (per evitare falsi positivi, specialmente per utenti legittimi)
  // Può essere disabilitato impostando GEO_BLOCK_ALLOW_UNKNOWN=false
  const allowUnknown = process.env.GEO_BLOCK_ALLOW_UNKNOWN !== 'false';
  return {
    country: null,
    countryCode: null,
    continent: null,
    isEuropean: allowUnknown,
    source: 'fallback',
  };
}

/**
 * Genera risposta HTTP per geoblocking
 * @param statusCode Codice HTTP (451 o 403)
 * @param message Messaggio personalizzato
 */
export function createGeoBlockResponse(statusCode: 451 | 403 = 451, message?: string): Response {
  const defaultMessage = 'This website is not available in your country.';
  const customMessage = message || process.env.GEO_BLOCK_MESSAGE || defaultMessage;

  return new Response(
    JSON.stringify({
      error: 'GeoBlocked',
      message: customMessage,
      code: statusCode,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-GeoBlocked': 'true',
      },
    }
  );
}
