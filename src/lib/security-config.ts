
/**
 * @fileoverview Configurazione centralizzata per le impostazioni di sicurezza.
 */

/**
 * Lista dei codici paese ISO 3166-1 alpha-2 per gli stati membri dell'Unione Europea (UE)
 * e dello Spazio Economico Europeo (SEE).
 * Questa lista viene utilizzata dal middleware di geoblocking.
 * 
 * Fonte: https://en.wikipedia.org/wiki/Member_state_of_the_European_Union
 * Fonte SEE: https://en.wikipedia.org/wiki/European_Economic_Area
 */
export const EUROPE_COUNTRY_CODES = [
  // Stati membri dell'UE (27)
  'AT', // Austria
  'BE', // Belgio
  'BG', // Bulgaria
  'CY', // Cipro
  'CZ', // Repubblica Ceca
  'DE', // Germania
  'DK', // Danimarca
  'EE', // Estonia
  'ES', // Spagna
  'FI', // Finlandia
  'FR', // Francia
  'GR', // Grecia
  'HR', // Croazia
  'HU', // Ungheria
  'IE', // Irlanda
  'IT', // Italia
  'LT', // Lituania
  'LU', // Lussemburgo
  'LV', // Lettonia
  'MT', // Malta
  'NL', // Paesi Bassi
  'PL', // Polonia
  'PT', // Portogallo
  'RO', // Romania
  'SE', // Svezia
  'SI', // Slovenia
  'SK', // Slovacchia

  // Altri membri dello SEE (Islanda, Liechtenstein, Norvegia)
  'IS', // Islanda
  'LI', // Liechtenstein
  'NO', // Norvegia

  // Svizzera (spesso inclusa per accordi bilaterali)
  'CH', // Svizzera
  
  // Regno Unito (può essere aggiunto o rimosso a seconda delle policy)
  'GB', 
];

/**
 * Whitelist di IP amministrativi che bypassano tutti i controlli di sicurezza
 * Aggiungi IP di amministratori, server di monitoraggio, etc.
 */
export const ADMIN_IP_WHITELIST: string[] = (
  process.env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || []
).filter(Boolean);

/**
 * Whitelist di IP che bypassano geoblocking ma non altri controlli
 */
export const GEO_WHITELIST: string[] = (
  process.env.GEO_IP_WHITELIST?.split(',').map(ip => ip.trim()) || []
).filter(Boolean);

/**
 * Verifica se un IP è nella whitelist amministrativa
 */
export function isAdminIP(ip: string): boolean {
  return ADMIN_IP_WHITELIST.includes(ip);
}

/**
 * Verifica se un IP è nella whitelist geografica
 */
export function isGeoWhitelisted(ip: string): boolean {
  return GEO_WHITELIST.includes(ip);
}

/**
 * Configurazione rate limiting
 */
export const RATE_LIMIT_CONFIG = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minuto
  burst: parseInt(process.env.RATE_LIMIT_BURST || '10', 10), // Burst allowance
};

/**
 * Configurazione VPN detection
 */
export const VPN_DETECTION_CONFIG = {
  enabled: process.env.VPN_DETECTION_ENABLED !== 'false',
  confidenceThreshold: parseInt(process.env.VPN_CONFIDENCE_THRESHOLD || '50', 10),
  blockDatacenter: process.env.VPN_BLOCK_DATACENTER === 'true',
  blockTor: process.env.VPN_BLOCK_TOR !== 'false',
};

/**
 * Configurazione DDoS protection
 */
export const DDOS_PROTECTION_CONFIG = {
  enabled: process.env.DDOS_PROTECTION_ENABLED !== 'false',
  challengeThreshold: parseInt(process.env.DDOS_CHALLENGE_THRESHOLD || '60', 10),
  blockThreshold: parseInt(process.env.DDOS_BLOCK_THRESHOLD || '80', 10),
  enableCaptcha: process.env.DDOS_ENABLE_CAPTCHA === 'true',
};

/**
 * Configurazione geoblocking
 */
export const GEO_BLOCKING_CONFIG = {
  enabled: process.env.GEO_BLOCKING_ENABLED !== 'false',
  allowUnknown: process.env.GEO_BLOCK_ALLOW_UNKNOWN === 'true',
  statusCode: parseInt(process.env.GEO_BLOCK_STATUS_CODE || '451', 10) as 451 | 403,
  message: process.env.GEO_BLOCK_MESSAGE || 'This website is not available in your country.',
};

/**
 * Servizi esterni e configurazioni API
 */
export const API_CONFIG = {
  ipApiKey: process.env.IP_API_KEY || '',
  ipHubApiKey: process.env.IPHUB_API_KEY || '',
  getIPIntelApiKey: process.env.GETIPINTEL_API_KEY || '',
  ipqsApiKey: process.env.IPQS_API_KEY || '',
  maxMindLicenseKey: process.env.MAXMIND_LICENSE_KEY || '',
};
