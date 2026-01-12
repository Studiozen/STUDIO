/**
 * @fileoverview Gestione avanzata della blacklist IP
 * Supporta blacklist persistente con Redis o in-memory
 */

interface BlacklistEntry {
  ip: string;
  reason: string;
  timestamp: number;
  expiresAt?: number; // Timestamp di scadenza (opzionale)
  violationCount: number;
}

// Store in-memory per fallback
const memoryBlacklist = new Map<string, BlacklistEntry>();

/**
 * Classe per gestire blacklist IP con supporto Redis
 */
export class IPBlacklist {
  private redisClient: any = null;

  constructor() {
    this.initRedis();
  }

  /**
   * Inizializza connessione Redis se disponibile
   * Nota: ioredis è opzionale e non bloccante
   */
  private async initRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        // Prova a caricare ioredis solo se disponibile
        const redisModule = await this.loadRedisModule();
        if (redisModule) {
          const Redis = redisModule.default || redisModule;
          this.redisClient = new Redis(redisUrl);
          console.log('Redis blacklist initialized');
        }
      } catch (error) {
        // In caso di errore, usa store in-memory senza bloccare
        console.warn('Redis not available for blacklist, using in-memory store:', error);
        this.redisClient = null;
      }
    }
  }

  /**
   * Carica il modulo ioredis in modo sicuro
   * DISABILITATO: ioredis rimosso per evitare problemi di build
   */
  private async loadRedisModule(): Promise<any> {
    // ioredis completamente disabilitato per evitare problemi di build
    // Usa solo store in-memory
    return null;
  }

  /**
   * Aggiunge un IP alla blacklist
   * @param ip Indirizzo IP da bloccare
   * @param reason Motivo del blocco
   * @param ttlSeconds Time to live in secondi (default: 24 ore)
   */
  async add(
    ip: string,
    reason: string,
    ttlSeconds: number = 24 * 60 * 60
  ): Promise<void> {
    const entry: BlacklistEntry = {
      ip,
      reason,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlSeconds * 1000),
      violationCount: 1,
    };

    if (this.redisClient) {
      try {
        const key = `blacklist:${ip}`;
        await this.redisClient.setex(
          key,
          ttlSeconds,
          JSON.stringify(entry)
        );
      } catch (error) {
        console.error('Redis blacklist add error:', error);
        // Fallback a memory
        memoryBlacklist.set(ip, entry);
      }
    } else {
      memoryBlacklist.set(ip, entry);
      
      // Auto-rimuovi dopo TTL
      setTimeout(() => {
        memoryBlacklist.delete(ip);
      }, ttlSeconds * 1000);
    }
  }

  /**
   * Incrementa il contatore di violazioni per un IP
   * Se supera la soglia, aggiunge alla blacklist
   */
  async incrementViolation(
    ip: string,
    reason: string,
    threshold: number = 3
  ): Promise<boolean> {
    const entry = await this.get(ip);
    
    if (entry) {
      entry.violationCount++;
      
      if (entry.violationCount >= threshold) {
        await this.add(ip, reason, 24 * 60 * 60); // 24 ore
        return true;
      } else {
        await this.update(ip, entry);
      }
    } else {
      // Prima violazione, crea entry temporanea
      const tempEntry: BlacklistEntry = {
        ip,
        reason,
        timestamp: Date.now(),
        expiresAt: Date.now() + (60 * 60 * 1000), // 1 ora
        violationCount: 1,
      };
      
      if (this.redisClient) {
        try {
          const key = `blacklist:${ip}`;
          await this.redisClient.setex(
            key,
            3600,
            JSON.stringify(tempEntry)
          );
        } catch (error) {
          memoryBlacklist.set(ip, tempEntry);
        }
      } else {
        memoryBlacklist.set(ip, tempEntry);
      }
    }
    
    return false;
  }

  /**
   * Verifica se un IP è in blacklist
   */
  async isBlacklisted(ip: string): Promise<boolean> {
    const entry = await this.get(ip);
    if (!entry) return false;

    // Verifica scadenza
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      await this.remove(ip);
      return false;
    }

    return true;
  }

  /**
   * Ottiene entry blacklist per un IP
   */
  async get(ip: string): Promise<BlacklistEntry | null> {
    if (this.redisClient) {
      try {
        const key = `blacklist:${ip}`;
        const data = await this.redisClient.get(key);
        if (data) {
          return JSON.parse(data);
        }
      } catch (error) {
        console.error('Redis blacklist get error:', error);
      }
    }

    return memoryBlacklist.get(ip) || null;
  }

  /**
   * Aggiorna entry blacklist
   */
  private async update(ip: string, entry: BlacklistEntry): Promise<void> {
    if (this.redisClient) {
      try {
        const key = `blacklist:${ip}`;
        const ttl = entry.expiresAt 
          ? Math.ceil((entry.expiresAt - Date.now()) / 1000)
          : 86400; // 24 ore default
        
        if (ttl > 0) {
          await this.redisClient.setex(
            key,
            ttl,
            JSON.stringify(entry)
          );
        }
      } catch (error) {
        memoryBlacklist.set(ip, entry);
      }
    } else {
      memoryBlacklist.set(ip, entry);
    }
  }

  /**
   * Rimuove un IP dalla blacklist
   */
  async remove(ip: string): Promise<void> {
    if (this.redisClient) {
      try {
        const key = `blacklist:${ip}`;
        await this.redisClient.del(key);
      } catch (error) {
        memoryBlacklist.delete(ip);
      }
    } else {
      memoryBlacklist.delete(ip);
    }
  }

  /**
   * Ottiene tutti gli IP in blacklist
   */
  async getAll(): Promise<BlacklistEntry[]> {
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys('blacklist:*');
        const entries: BlacklistEntry[] = [];
        
        for (const key of keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            entries.push(JSON.parse(data));
          }
        }
        
        return entries;
      } catch (error) {
        console.error('Redis blacklist getAll error:', error);
        return Array.from(memoryBlacklist.values());
      }
    }

    return Array.from(memoryBlacklist.values());
  }

  /**
   * Pulisce entry scadute
   */
  async cleanup(): Promise<number> {
    let cleaned = 0;
    const now = Date.now();

    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys('blacklist:*');
        
        for (const key of keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const entry: BlacklistEntry = JSON.parse(data);
            if (entry.expiresAt && entry.expiresAt < now) {
              await this.redisClient.del(key);
              cleaned++;
            }
          }
        }
      } catch (error) {
        console.error('Redis blacklist cleanup error:', error);
      }
    } else {
      for (const [ip, entry] of memoryBlacklist.entries()) {
        if (entry.expiresAt && entry.expiresAt < now) {
          memoryBlacklist.delete(ip);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}

// Istanza singleton
let blacklistInstance: IPBlacklist | null = null;

/**
 * Ottiene l'istanza singleton della blacklist
 */
export function getBlacklist(): IPBlacklist {
  if (!blacklistInstance) {
    blacklistInstance = new IPBlacklist();
  }
  return blacklistInstance;
}
