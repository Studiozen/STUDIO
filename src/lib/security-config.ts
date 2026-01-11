
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
 * Servizi esterni e configurazioni.
 * Qui andrebbero inserite le chiavi API per servizi di rilevamento VPN,
 * come IP-API, IPHub, ecc.
 * 
 * Esempio:
 * export const IP_API_CONFIG = {
 *   apiKey: process.env.IP_API_KEY,
 * };
 */
