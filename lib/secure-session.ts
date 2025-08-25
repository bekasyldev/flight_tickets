import { randomUUID } from 'crypto';
import { createHash } from 'crypto';

export interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  original_amount?: string;
  original_currency?: string;
  commission?: string;
  commission_currency?: string;
  slices: Array<{
    segments: Array<{
      origin: { iata_code: string; name: string };
      destination: { iata_code: string; name: string };
      operating_carrier: { name: string };
      operating_carrier_flight_number: string;
    }>;
  }>;
  [key: string]: unknown;
}

export interface SecureSession {
  _id?: string;
  id: string;
  token: string;
  search_params: SearchParams;
  offers: DuffelOffer[];
  expires_at: Date;
  created_at: Date;
  used: boolean;
  client_ip?: string;
  user_agent?: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType: 'one-way' | 'round-trip';
}

export class SecureSessionManager {
  private readonly TTL_MINUTES = 30;
  
  // Создание безопасного токена
  createSessionData(
    searchParams: SearchParams, 
    offers: DuffelOffer[], 
    clientInfo?: { ip?: string; userAgent?: string }
  ): SecureSession {
    const id = randomUUID();
    const token = this.generateSecureToken(id, searchParams);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (this.TTL_MINUTES * 60 * 1000));
    
    const session: SecureSession = {
      id,
      token,
      search_params: searchParams,
      offers: this.addCommissionToOffers(offers),
      expires_at: expiresAt,
      created_at: now,
      used: false,
      client_ip: clientInfo?.ip,
      user_agent: clientInfo?.userAgent
    };
    
    return session;
  }
  
  // Генерация криптографически стойкого токена
  private generateSecureToken(id: string, searchParams: SearchParams): string {
    const data = JSON.stringify({
      id,
      searchParams,
      timestamp: Date.now(),
      random: Math.random(),
      secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production'
    });
    
    return createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 32);
  }
  
  // Добавление комиссии к предложениям
  private addCommissionToOffers(offers: DuffelOffer[]): DuffelOffer[] {
    const COMMISSION_AMOUNT = 15.00; // €15 комиссия
    
    return offers.map(offer => ({
      ...offer,
      original_amount: offer.total_amount,
      original_currency: offer.total_currency,
      total_amount: (parseFloat(offer.total_amount) + COMMISSION_AMOUNT).toFixed(2),
      commission: COMMISSION_AMOUNT.toFixed(2),
      commission_currency: offer.total_currency
    }));
  }
  
  // Валидация параметров поиска
  validateSearchParams(params: Partial<SearchParams>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.origin || typeof params.origin !== 'string') {
      errors.push('Origin is required and must be a string');
    }
    
    if (!params.destination || typeof params.destination !== 'string') {
      errors.push('Destination is required and must be a string');
    }
    
    if (!params.departureDate || !this.isValidDate(params.departureDate)) {
      errors.push('Valid departure date is required');
    }
    
    if (params.tripType === 'round-trip' && (!params.returnDate || !this.isValidDate(params.returnDate))) {
      errors.push('Return date is required for round-trip');
    }
    
    if (!params.passengers || params.passengers < 1 || params.passengers > 9) {
      errors.push('Passengers must be between 1 and 9');
    }
    
    if (!params.cabinClass || !['economy', 'premium_economy', 'business', 'first'].includes(params.cabinClass)) {
      errors.push('Invalid cabin class');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Проверка валидности даты
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date instanceof Date && 
           !isNaN(date.getTime()) && 
           date >= today;
  }
  
  // Валидация сессии (без обращения к базе)
  isSessionValid(session: SecureSession, offerId?: string): { 
    isValid: boolean; 
    reason?: string 
  } {
    // Проверка истечения времени
    if (new Date() > session.expires_at) {
      return { isValid: false, reason: 'Session expired' };
    }
    
    // Проверка использования
    if (session.used) {
      return { isValid: false, reason: 'Session already used' };
    }
    
    // Проверка соответствия offer_id (если указан)
    if (offerId) {
      const offerExists = session.offers.some(offer => offer.id === offerId);
      if (!offerExists) {
        return { isValid: false, reason: 'Offer not found in session' };
      }
    }
    
    return { isValid: true };
  }
  
  // Логирование событий безопасности
  logSecurityEvent(event: string, details: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      ...details
    };
    
    console.log(`[SECURITY] ${event}:`, logEntry);
    
    // В production можно интегрировать с внешними сервисами логирования
    // например: Sentry, LogRocket, DataDog и т.д.
  }
}

export const sessionManager = new SecureSessionManager();
