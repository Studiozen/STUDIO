/**
 * @fileoverview Sistema di logging per sicurezza e audit
 * Logga eventi di geoblocking, VPN detection, DDoS protection
 */

export interface SecurityLog {
  timestamp: string;
  type: 'geoblock' | 'vpn_block' | 'ddos_block' | 'rate_limit' | 'challenge' | 'whitelist';
  ip: string;
  country?: string;
  userAgent?: string;
  path: string;
  reason?: string;
  riskScore?: number;
  metadata?: Record<string, any>;
}

/**
 * Logger in-memory (in produzione, usa servizio esterno come CloudWatch, Datadog, etc.)
 */
const logs: SecurityLog[] = [];
const MAX_LOGS = 10000; // Limite log in-memory

/**
 * Aggiunge un log di sicurezza
 */
export function logSecurityEvent(log: Omit<SecurityLog, 'timestamp'>): void {
  const fullLog: SecurityLog = {
    ...log,
    timestamp: new Date().toISOString(),
  };

  logs.push(fullLog);

  // Mantieni solo gli ultimi MAX_LOGS
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // In produzione, invia anche a servizio esterno
  if (process.env.NODE_ENV === 'production') {
    sendToExternalLogger(fullLog);
  }

  // Log anche su console in sviluppo
  if (process.env.NODE_ENV === 'development') {
    console.log('[Security]', fullLog);
  }
}

/**
 * Invia log a servizio esterno (CloudWatch, Datadog, etc.)
 */
async function sendToExternalLogger(log: SecurityLog): Promise<void> {
  // Implementazione per servizio esterno
  // Esempio: AWS CloudWatch, Datadog, Sentry, etc.
  
  const logEndpoint = process.env.SECURITY_LOG_ENDPOINT;
  if (logEndpoint) {
    try {
      await fetch(logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to send security log to external service:', error);
    }
  }
}

/**
 * Ottiene log recenti per un IP
 */
export function getLogsForIP(ip: string, limit: number = 100): SecurityLog[] {
  return logs
    .filter(log => log.ip === ip)
    .slice(-limit)
    .reverse();
}

/**
 * Ottiene statistiche di sicurezza
 */
export function getSecurityStats(): {
  totalBlocks: number;
  geoblocks: number;
  vpnBlocks: number;
  ddosBlocks: number;
  rateLimits: number;
  topBlockedIPs: Array<{ ip: string; count: number }>;
} {
  const blocks = logs.filter(log => 
    log.type === 'geoblock' || 
    log.type === 'vpn_block' || 
    log.type === 'ddos_block' ||
    log.type === 'rate_limit'
  );

  const ipCounts = new Map<string, number>();
  blocks.forEach(log => {
    ipCounts.set(log.ip, (ipCounts.get(log.ip) || 0) + 1);
  });

  const topBlockedIPs = Array.from(ipCounts.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalBlocks: blocks.length,
    geoblocks: logs.filter(log => log.type === 'geoblock').length,
    vpnBlocks: logs.filter(log => log.type === 'vpn_block').length,
    ddosBlocks: logs.filter(log => log.type === 'ddos_block').length,
    rateLimits: logs.filter(log => log.type === 'rate_limit').length,
    topBlockedIPs,
  };
}

/**
 * Esporta log per audit (formato JSON)
 */
export function exportLogs(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(logs, null, 2);
  } else {
    // CSV format
    const headers = ['timestamp', 'type', 'ip', 'country', 'path', 'reason', 'riskScore'];
    const rows = logs.map(log => [
      log.timestamp,
      log.type,
      log.ip,
      log.country || '',
      log.path,
      log.reason || '',
      log.riskScore?.toString() || '',
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}
