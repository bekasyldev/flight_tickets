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
      
      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }
  
  async createSession(
    searchParams: SearchParams,
    offers: DuffelOffer[],
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<SecureSession> {
    try {
      const collection = await this.getCollection();
      
      const sessionData = sessionManager.createSessionData(
        searchParams, 
        offers, 
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
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned ${result.deletedCount} expired sessions`);
      }
      
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
      return 0;
    }
  }
  
  // Статистика сессий (для мониторинга)
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
