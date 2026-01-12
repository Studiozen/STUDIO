/**
 * @fileoverview Sistema di rate limiting con supporto Redis e fallback in-memory
 * Implementa rate limiting per protezione DDoS Layer 3/4
 */

interface RateLimitConfig {
  windowMs: number; // Finestra temporale in millisecondi
  maxRequests: number; // Numero massimo di richieste
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store in-memory per fallback (usato quando Redis non è disponibile)
const memoryStore: RateLimitStore = {};

// Configurazione di default
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 100, // 100 richieste per minuto
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

/**
 * Classe per gestire rate limiting con supporto Redis e fallback in-memory
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private redisClient: any = null;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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
        // Usa eval per evitare che il bundler includa ioredis se non disponibile
        const redisModule = await this.loadRedisModule();
        if (redisModule) {
          const Redis = redisModule.default || redisModule;
          this.redisClient = new Redis(redisUrl);
          console.log('Redis rate limiter initialized');
        }
      } catch (error) {
        // In caso di errore, usa store in-memory senza bloccare
        console.warn('Redis not available, using in-memory store:', error);
        this.redisClient = null;
      }
    }
  }

  /**
   * Carica il modulo ioredis in modo sicuro
   */
  private async loadRedisModule(): Promise<any> {
    try {
      // Usa dynamic import con catch per evitare errori di build
      return await import('ioredis');
    } catch (error) {
      // Se ioredis non è installato o non disponibile, ritorna null
      return null;
    }
  }

  /**
   * Verifica se una richiesta supera il limite
   * @param identifier Identificatore univoco (es: IP address)
   * @returns true se la richiesta è permessa, false se supera il limite
   */
  async checkLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    if (this.redisClient) {
      return this.checkLimitRedis(key, now, windowStart);
    } else {
      return this.checkLimitMemory(key, now, windowStart);
    }
  }

  /**
   * Verifica limite usando Redis
   */
  private async checkLimitRedis(
    key: string,
    now: number,
    windowStart: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const resetTime = now + this.config.windowMs;
      
      // Usa sliding window log con Redis
      const pipeline = this.redisClient.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[1][1] as number;
      const remaining = Math.max(0, this.config.maxRequests - count - 1);
      const allowed = count < this.config.maxRequests;

      return { allowed, remaining, resetTime };
    } catch (error) {
      console.error('Redis rate limit error, falling back to memory:', error);
      return this.checkLimitMemory(key, now, windowStart);
    }
  }

  /**
   * Verifica limite usando store in-memory
   */
  private checkLimitMemory(
    key: string,
    now: number,
    windowStart: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const entry = memoryStore[key];
    const resetTime = now + this.config.windowMs;

    // Pulisci entry scadute
    if (entry && entry.resetTime < now) {
      delete memoryStore[key];
    }

    if (!entry) {
      memoryStore[key] = {
        count: 1,
        resetTime,
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      };
    }

    // Incrementa contatore
    entry.count++;
    const allowed = entry.count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return { allowed, remaining, resetTime };
  }

  /**
   * Resetta il contatore per un identificatore
   */
  async reset(identifier: string): Promise<void> {
    const key = `ratelimit:${identifier}`;
    if (this.redisClient) {
      await this.redisClient.del(key);
    } else {
      delete memoryStore[key];
    }
  }

  /**
   * Ottiene statistiche per un identificatore
   */
  async getStats(identifier: string): Promise<{ count: number; resetTime: number } | null> {
    const key = `ratelimit:${identifier}`;
    if (this.redisClient) {
      try {
        const count = await this.redisClient.zcard(key);
        const ttl = await this.redisClient.ttl(key);
        return {
          count,
          resetTime: Date.now() + (ttl * 1000),
        };
      } catch (error) {
        return null;
      }
    } else {
      const entry = memoryStore[key];
      if (!entry) return null;
      return {
        count: entry.count,
        resetTime: entry.resetTime,
      };
    }
  }
}

// Istanza singleton per uso globale
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Ottiene l'istanza singleton del rate limiter
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
    
    rateLimiterInstance = new RateLimiter({
      maxRequests,
      windowMs,
    });
  }
  return rateLimiterInstance;
}
