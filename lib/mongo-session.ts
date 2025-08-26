import { Collection, Db } from 'mongodb';
import { getDatabase } from './mongodb';
import { 
  SecureSession, 
  SearchParams, 
  DuffelOffer,
  sessionManager 
} from './secure-session';

export class MongoSessionManager {
  private collection: Collection<SecureSession> | null = null;
  
  private async getCollection(): Promise<Collection<SecureSession>> {
    if (!this.collection) {
      const db: Db = await getDatabase();
      this.collection = db.collection<SecureSession>('secure_sessions');
      
      await this.createIndexes();
    }
    return this.collection;
  }
  
  private async createIndexes(): Promise<void> {
    const collection = await this.getCollection();
    
    try {
      await collection.createIndex(
        { expires_at: 1 }, 
        { expireAfterSeconds: 0 }
      );
      
      await collection.createIndex(
        { token: 1 }, 
        { unique: true }
      );
      
      await collection.createIndex({ id: 1 });
      
      await collection.createIndex({ 
        token: 1, 
        used: 1, 
        expires_at: 1 
      });
      
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }
  
  async createSession(
    searchParams: SearchParams,
    offers: DuffelOffer[],
    passengerIds?: string[],
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<SecureSession> {
    try {
      const collection = await this.getCollection();
      
      const sessionData = sessionManager.createSessionData(
        searchParams, 
        offers, 
        passengerIds,
        clientInfo
      );
      
      const result = await collection.insertOne(sessionData);
      
      if (!result.insertedId) {
        throw new Error('Failed to create session in database');
      }
      
      sessionManager.logSecurityEvent('SESSION_CREATED', {
        sessionId: sessionData.id,
        token: sessionData.token.substring(0, 8) + '...',
        expiresAt: sessionData.expires_at,
        offersCount: offers.length,
        clientIp: clientInfo?.ip
      });
      
      return { ...sessionData, _id: result.insertedId.toString() };
      
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create secure session');
    }
  }
  
  // Валидация и получение сессии
  async validateSession(
    token: string, 
    offerId?: string
  ): Promise<SecureSession | null> {
    try {
      const collection = await this.getCollection();
      
      // Поиск сессии по токену
      const session = await collection.findOne({ 
        token,
        expires_at: { $gt: new Date() }, // Не истёкшие
        used: false // Неиспользованные
      });
      
      if (!session) {
        sessionManager.logSecurityEvent('INVALID_SESSION_ATTEMPT', {
          token: token.substring(0, 8) + '...',
          reason: 'Session not found or expired'
        });
        return null;
      }
      
      // Дополнительная валидация через утилиты
      const validation = sessionManager.isSessionValid(session, offerId);
      if (!validation.isValid) {
        sessionManager.logSecurityEvent('SESSION_VALIDATION_FAILED', {
          sessionId: session.id,
          reason: validation.reason,
          offerId
        });
        return null;
      }
      
      return session;
      
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  }
  
  // Использование сессии (пометка как использованной)
  async useSession(token: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      // Атомарное обновление: пометить как использованную
      const result = await collection.updateOne(
        { 
          token,
          expires_at: { $gt: new Date() },
          used: false
        },
        { 
          $set: { 
            used: true,
            used_at: new Date()
          }
        }
      );
      
      if (result.modifiedCount === 1) {
        sessionManager.logSecurityEvent('SESSION_USED', {
          token: token.substring(0, 8) + '...',
          usedAt: new Date()
        });
        return true;
      }
      
      sessionManager.logSecurityEvent('SESSION_USE_FAILED', {
        token: token.substring(0, 8) + '...',
        reason: 'Session not found or already used'
      });
      
      return false;
      
    } catch (error) {
      console.error('Error using session:', error);
      return false;
    }
  }
  
  // Получение сессии по токену (без валидации использования)
  async getSession(token: string): Promise<SecureSession | null> {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ token });
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  // Очистка всех истёкших сессий (вручную, если нужно)
  async cleanExpiredSessions(): Promise<number> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteMany({
        expires_at: { $lt: new Date() }
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      return 0;
    }
  }
  
  // ✅ ENTERPRISE SECURITY: Validate session with IP and User-Agent binding
  async validateSessionWithSecurity(
    token: string, 
    clientIp: string, 
    userAgent: string
  ): Promise<SecureSession | null> {
    try {
      const collection = await this.getCollection();
      
      const session = await collection.findOne({
        token,
        expires_at: { $gt: new Date() },
        used: false
      });
      
      if (!session) {
        await this.logSecurityEvent('INVALID_SESSION_ATTEMPT', {
          token: token.substring(0, 8) + '...',
          clientIp,
          userAgent: userAgent.substring(0, 100),
          reason: 'Session not found or expired'
        });
        return null;
      }

      if (session.client_ip && session.client_ip !== clientIp) {
        await this.logSecurityEvent('IP_MISMATCH', {
          sessionId: session.id,
          originalIp: session.client_ip,
          currentIp: clientIp,
          userAgent: userAgent.substring(0, 100)
        });
      }

      if (session.user_agent && session.user_agent !== userAgent) {
        await this.logSecurityEvent('USER_AGENT_CHANGE', {
          sessionId: session.id,
          originalUA: session.user_agent.substring(0, 100),
          currentUA: userAgent.substring(0, 100),
          clientIp
        });
      }

      return session;
      
    } catch (error) {
      console.error('Error validating session with security:', error);
      await this.logSecurityEvent('SESSION_VALIDATION_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        clientIp,
        userAgent: userAgent.substring(0, 100)
      });
      return null;
    }
  }

  async logSecurityEvent(eventType: string, eventData: Record<string, unknown>): Promise<void> {
    try {
      const db: Db = await getDatabase();
      const securityCollection = db.collection('security_events');
      
      try {
        await securityCollection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 }); // 30 days retention
        await securityCollection.createIndex({ eventType: 1 });
        await securityCollection.createIndex({ clientIp: 1 });
      } catch {
      }

      await securityCollection.insertOne({
        eventType,
        eventData,
        timestamp: new Date(),
        severity: this.getEventSeverity(eventType)
      });

    } catch (error) {
      console.error('❌ Failed to log security event:', error);
    }
  }

  private getEventSeverity(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const highSeverityEvents = ['IP_MISMATCH', 'INVALID_SESSION_ATTEMPT', 'SESSION_VALIDATION_ERROR'];
    const mediumSeverityEvents = ['USER_AGENT_CHANGE', 'SESSION_VALIDATION_FAILED'];
    const lowSeverityEvents = ['SESSION_CREATED', 'SESSION_VALIDATED', 'SESSION_USED'];

    if (highSeverityEvents.includes(eventType)) return 'HIGH';
    if (mediumSeverityEvents.includes(eventType)) return 'MEDIUM';
    if (lowSeverityEvents.includes(eventType)) return 'LOW';
    return 'MEDIUM';
  }

  async getSessionStats(): Promise<{
    total: number;
    active: number;
    used: number;
    expired: number;
  }> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      
      const [total, active, used, expired] = await Promise.all([
        collection.countDocuments({}),
        collection.countDocuments({
          expires_at: { $gt: now },
          used: false
        }),
        collection.countDocuments({ used: true }),
        collection.countDocuments({
          expires_at: { $lt: now }
        })
      ]);
      
      return { total, active, used, expired };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { total: 0, active: 0, used: 0, expired: 0 };
    }
  }
}

// Экспорт единственного экземпляра
export const mongoSessionManager = new MongoSessionManager();
