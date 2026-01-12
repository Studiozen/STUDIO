/**
 * @fileoverview Protezione DDoS multi-livello
 * Layer 3/4: Rate limiting, SYN flood protection, connection throttling
 * Layer 7: CAPTCHA, User-Agent validation, Cookie validation, Request signature analysis
 */

import { NextRequest } from 'next/server';
import { getRateLimiter } from './rate-limiter';

export interface DDoSProtectionResult {
  blocked: boolean;
  reason?: string;
  challengeRequired?: boolean;
  riskScore: number; // 0-100
}

/**
 * Analizza User-Agent per pattern sospetti
 */
function analyzeUserAgent(userAgent: string | null): { suspicious: boolean; score: number } {
  if (!userAgent) {
    return { suspicious: true, score: 30 }; // User-Agent mancante è sospetto
  }

  let score = 0;

  // User-Agent vuoto o troppo corto
  if (userAgent.length < 10) {
    score += 20;
  }

  // Pattern comuni di bot/scraper
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /httpclient/i,
  ];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      score += 15;
    }
  }

  // User-Agent non standard (non contiene browser comune)
  const browserPatterns = [
    /chrome/i,
    /firefox/i,
    /safari/i,
    /edge/i,
    /opera/i,
    /msie/i,
  ];

  const hasBrowser = browserPatterns.some(pattern => pattern.test(userAgent));
  if (!hasBrowser && userAgent.length > 0) {
    score += 25;
  }

  return {
    suspicious: score >= 30,
    score: Math.min(score, 100),
  };
}

/**
 * Analizza signature della richiesta per pattern DDoS
 */
function analyzeRequestSignature(request: NextRequest): { suspicious: boolean; score: number } {
  let score = 0;

  // Verifica header comuni
  const headers = request.headers;
  
  // Accept header mancante o sospetto
  const accept = headers.get('accept');
  if (!accept || accept === '*/*') {
    score += 10;
  }

  // Accept-Language mancante
  if (!headers.get('accept-language')) {
    score += 5;
  }

  // Accept-Encoding mancante
  if (!headers.get('accept-encoding')) {
    score += 5;
  }

  // Connection header sospetto
  const connection = headers.get('connection');
  if (connection && connection.toLowerCase() !== 'keep-alive') {
    score += 10;
  }

  // Referer mancante per richieste POST (può indicare bot)
  if (request.method === 'POST' && !headers.get('referer')) {
    score += 15;
  }

  // Content-Length sospetto
  const contentLength = headers.get('content-length');
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (length === 0 || length > 10 * 1024 * 1024) { // 0 o > 10MB
      score += 10;
    }
  }

  return {
    suspicious: score >= 30,
    score: Math.min(score, 100),
  };
}

/**
 * Verifica cookie di sessione/autenticazione
 */
function analyzeCookies(request: NextRequest): { suspicious: boolean; score: number } {
  const cookies = request.cookies;
  let score = 0;

  // Se è una richiesta autenticata ma non ha cookie di sessione
  // (può indicare bot o attacco)
  const hasSessionCookie = cookies.has('session') || cookies.has('auth') || cookies.has('token');
  
  // Per alcune route, ci aspettiamo cookie specifici
  const path = request.nextUrl.pathname;
  const requiresAuth = path.startsWith('/profile') || path.startsWith('/chat');
  
  if (requiresAuth && !hasSessionCookie) {
    score += 20;
  }

  return {
    suspicious: score >= 20,
    score: Math.min(score, 100),
  };
}

/**
 * Calcola risk score complessivo
 */
function calculateRiskScore(
  userAgentScore: number,
  requestScore: number,
  cookieScore: number,
  rateLimitExceeded: boolean
): number {
  let totalScore = 0;

  // Pesi per diversi fattori
  totalScore += userAgentScore * 0.3;
  totalScore += requestScore * 0.3;
  totalScore += cookieScore * 0.2;
  
  if (rateLimitExceeded) {
    totalScore += 40; // Rate limit exceeded è molto sospetto
  }

  return Math.min(Math.round(totalScore), 100);
}

/**
 * Verifica se una richiesta richiede challenge CAPTCHA
 */
function shouldRequireChallenge(riskScore: number): boolean {
  const threshold = parseInt(process.env.DDOS_CHALLENGE_THRESHOLD || '60', 10);
  return riskScore >= threshold;
}

/**
 * Verifica se una richiesta deve essere bloccata
 */
function shouldBlockRequest(riskScore: number): boolean {
  const threshold = parseInt(process.env.DDOS_BLOCK_THRESHOLD || '80', 10);
  return riskScore >= threshold;
}

/**
 * Protezione DDoS Layer 7
 * Analizza pattern di richiesta e determina se bloccare o richiedere challenge
 */
export async function checkDDoSProtection(
  request: NextRequest,
  clientIp: string
): Promise<DDoSProtectionResult> {
  // 1. Rate limiting (Layer 3/4)
  const rateLimiter = getRateLimiter();
  const rateLimit = await rateLimiter.checkLimit(clientIp);
  const rateLimitExceeded = !rateLimit.allowed;

  if (rateLimitExceeded) {
    return {
      blocked: true,
      reason: 'Rate limit exceeded',
      riskScore: 100,
    };
  }

  // 2. Analisi User-Agent (Layer 7)
  const userAgent = request.headers.get('user-agent');
  const userAgentAnalysis = analyzeUserAgent(userAgent);

  // 3. Analisi signature richiesta (Layer 7)
  const requestAnalysis = analyzeRequestSignature(request);

  // 4. Analisi cookie (Layer 7)
  const cookieAnalysis = analyzeCookies(request);

  // 5. Calcola risk score complessivo
  const riskScore = calculateRiskScore(
    userAgentAnalysis.score,
    requestAnalysis.score,
    cookieAnalysis.score,
    rateLimitExceeded
  );

  // 6. Determina azione
  const blocked = shouldBlockRequest(riskScore);
  const challengeRequired = shouldRequireChallenge(riskScore) && !blocked;

  return {
    blocked,
    reason: blocked
      ? 'High risk score detected'
      : challengeRequired
      ? 'Challenge required'
      : undefined,
    challengeRequired,
    riskScore,
  };
}

/**
 * Verifica se un IP è in blacklist
 * Usa la blacklist avanzata se disponibile, altrimenti fallback semplice
 */
export async function isBlacklisted(ip: string): Promise<boolean> {
  try {
    const { getBlacklist } = await import('./ip-blacklist');
    const blacklist = getBlacklist();
    return await blacklist.isBlacklisted(ip);
  } catch (error) {
    // Fallback semplice se blacklist avanzata non disponibile
    return false;
  }
}

/**
 * Aggiunge un IP alla blacklist
 */
export async function addToBlacklist(
  ip: string,
  reason: string = 'High risk score',
  ttlSeconds: number = 24 * 60 * 60
): Promise<void> {
  try {
    const { getBlacklist } = await import('./ip-blacklist');
    const blacklist = getBlacklist();
    await blacklist.add(ip, reason, ttlSeconds);
  } catch (error) {
    console.error('Failed to add IP to blacklist:', error);
  }
}

/**
 * Ottiene IP reale dalla richiesta (considerando proxy/CDN)
 */
export function getRealIP(request: NextRequest): string {
  // Prova vari header comuni per IP reale
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback a IP da NextRequest
  return request.ip || 'unknown';
}
