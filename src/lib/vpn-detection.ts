/**
 * @fileoverview Sistema avanzato di rilevamento VPN/Proxy/Datacenter
 * Supporta multiple API: IPHub, GetIPIntel, IPQS, ip-api.com
 */

export interface VPNDetectionResult {
  isVpn: boolean;
  isProxy: boolean;
  isDatacenter: boolean;
  isTor: boolean;
  provider?: string;
  confidence: number; // 0-100
  source: string;
}

/**
 * Lista di provider VPN noti da bloccare specificamente
 */
const KNOWN_VPN_PROVIDERS = [
  'nordvpn',
  'expressvpn',
  'surfshark',
  'cyberghost',
  'private internet access',
  'protonvpn',
  'windscribe',
  'tunnelbear',
  'hotspot shield',
  'vyprvpn',
  'ipvanish',
  'purevpn',
  'hidemyass',
  'zenmate',
];

/**
 * Rileva VPN usando IPHub API
 */
async function detectVPNWithIPHub(ip: string): Promise<VPNDetectionResult | null> {
  try {
    const apiKey = process.env.IPHUB_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(`http://v2.api.iphub.info/ip/${ip}`, {
      headers: {
        'X-Key': apiKey,
      },
    });

    if (response.ok) {
      const data = await response.json();
      // IPHub: 0 = residential, 1 = hosting/datacenter, 2 = proxy/VPN
      const block = data.block || 0;
      return {
        isVpn: block === 2,
        isProxy: block === 2,
        isDatacenter: block === 1,
        isTor: false,
        confidence: block > 0 ? 90 : 10,
        source: 'iphub',
      };
    }
  } catch (error) {
    console.error('IPHub API error:', error);
  }
  return null;
}

/**
 * Rileva VPN usando GetIPIntel API
 */
async function detectVPNWithGetIPIntel(ip: string): Promise<VPNDetectionResult | null> {
  try {
    const apiKey = process.env.GETIPINTEL_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `http://check.getipintel.net/check.php?ip=${ip}&contact=${apiKey}&format=json&flags=m`
    );

    if (response.ok) {
      const data = await response.json();
      const result = data.result || 0;
      // GetIPIntel: 0 = clean, 1 = proxy/VPN, -1 = error
      if (result >= 0) {
        return {
          isVpn: result > 0.5,
          isProxy: result > 0.5,
          isDatacenter: (data.flags & 1) === 1, // Mobile flag
          isTor: (data.flags & 2) === 2, // Tor flag
          confidence: Math.round(result * 100),
          source: 'getipintel',
        };
      }
    }
  } catch (error) {
    console.error('GetIPIntel API error:', error);
  }
  return null;
}

/**
 * Rileva VPN usando IPQS (IP Quality Score)
 */
async function detectVPNWithIPQS(ip: string): Promise<VPNDetectionResult | null> {
  try {
    const apiKey = process.env.IPQS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://ipqualityscore.com/api/json/ip/${apiKey}/${ip}?strictness=1&fast=true`
    );

    if (response.ok) {
      const data = await response.json();
      return {
        isVpn: data.vpn === true,
        isProxy: data.proxy === true,
        isDatacenter: data.hosting === true,
        isTor: data.tor === true,
        provider: data.isp || undefined,
        confidence: data.fraud_score || 0,
        source: 'ipqs',
      };
    }
  } catch (error) {
    console.error('IPQS API error:', error);
  }
  return null;
}

/**
 * Rileva VPN usando ip-api.com (fallback)
 */
async function detectVPNWithIPAPI(ip: string): Promise<VPNDetectionResult | null> {
  try {
    const apiKey = process.env.IP_API_KEY;
    const url = apiKey
      ? `http://pro.ip-api.com/json/${ip}?key=${apiKey}&fields=status,proxy,hosting,mobile,query`
      : `http://ip-api.com/json/${ip}?fields=status,proxy,hosting,mobile,query`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        isVpn: data.proxy === true,
        isProxy: data.proxy === true,
        isDatacenter: data.hosting === true,
        isTor: false,
        confidence: data.proxy || data.hosting ? 80 : 20,
        source: 'ipapi',
      };
    }
  } catch (error) {
    console.error('IP-API error:', error);
  }
  return null;
}

/**
 * Verifica se un provider è nella lista di VPN note
 */
function checkKnownVPNProvider(provider?: string): boolean {
  if (!provider) return false;
  const lowerProvider = provider.toLowerCase();
  return KNOWN_VPN_PROVIDERS.some(vpn => lowerProvider.includes(vpn));
}

/**
 * Rileva VPN/Proxy/Datacenter usando multiple API
 * Combina risultati da diverse fonti per maggiore accuratezza
 * @param ip Indirizzo IP da verificare
 * @returns Risultato della verifica VPN
 */
export async function detectVPN(ip: string): Promise<VPNDetectionResult> {
  const results: VPNDetectionResult[] = [];

  // Prova tutte le API disponibili in parallelo
  const [iphubResult, getipintelResult, ipqsResult, ipapiResult] = await Promise.all([
    detectVPNWithIPHub(ip),
    detectVPNWithGetIPIntel(ip),
    detectVPNWithIPQS(ip),
    detectVPNWithIPAPI(ip),
  ]);

  // Aggiungi risultati validi
  if (iphubResult) results.push(iphubResult);
  if (getipintelResult) results.push(getipintelResult);
  if (ipqsResult) results.push(ipqsResult);
  if (ipapiResult) results.push(ipapiResult);

  // Se non ci sono risultati, ritorna default (non VPN)
  if (results.length === 0) {
    return {
      isVpn: false,
      isProxy: false,
      isDatacenter: false,
      isTor: false,
      confidence: 0,
      source: 'none',
    };
  }

  // Combina risultati: se almeno una API rileva VPN, consideralo VPN
  // Usa media pesata per confidence
  const combined: VPNDetectionResult = {
    isVpn: results.some(r => r.isVpn),
    isProxy: results.some(r => r.isProxy),
    isDatacenter: results.some(r => r.isDatacenter),
    isTor: results.some(r => r.isTor),
    provider: results.find(r => r.provider)?.provider,
    confidence: Math.round(
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    ),
    source: results.map(r => r.source).join(','),
  };

  // Verifica se il provider è una VPN nota
  if (combined.provider && checkKnownVPNProvider(combined.provider)) {
    combined.isVpn = true;
    combined.confidence = Math.max(combined.confidence, 95);
  }

  return combined;
}

/**
 * Verifica se un IP deve essere bloccato per VPN/Proxy
 * @param ip Indirizzo IP da verificare
 * @param threshold Soglia di confidence minima (default: 50)
 */
export async function shouldBlockVPN(
  ip: string,
  threshold: number = 50
): Promise<{ block: boolean; result: VPNDetectionResult }> {
  const result = await detectVPN(ip);
  const block = 
    (result.isVpn || result.isProxy || result.isTor) &&
    result.confidence >= threshold;

  return { block, result };
}
