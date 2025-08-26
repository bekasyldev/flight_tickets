import { NextRequest, NextResponse } from 'next/server';
import { mongoSessionManager } from '@/lib/mongo-session';

export async function POST(request: NextRequest) {
  try {
    const { token, offer_id, action } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const sessionData = await mongoSessionManager.validateSessionWithSecurity(
      token, 
      clientIp, 
      userAgent
    );
    
    if (!sessionData) {
      await mongoSessionManager.logSecurityEvent('INVALID_SESSION_ATTEMPT', {
        token: token.substring(0, 8) + '...', // Only log first 8 chars
        clientIp,
        userAgent: userAgent.substring(0, 100), // Truncate long UA strings
        action,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json(
        { error: 'Invalid or expired session token' },
        { status: 401 }
      );
    }

    // Log successful validation
    await mongoSessionManager.logSecurityEvent('SESSION_VALIDATED', {
      sessionId: sessionData.id,
      offerId: offer_id,
      action,
      clientIp,
      timestamp: new Date().toISOString()
    });

    if (offer_id) {
      const selectedOffer = sessionData.offers.find(offer => offer.id === offer_id);
      
      if (!selectedOffer) {
        return NextResponse.json(
          { error: 'Offer not found in session' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        session: {
          id: sessionData.id,
          expires_at: sessionData.expires_at,
          created_at: sessionData.created_at
        },
        offer: selectedOffer,
        security: {
          validated: true,
          ip_bound: sessionData.client_ip === clientIp,
          user_agent_consistent: sessionData.user_agent === userAgent
        }
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        expires_at: sessionData.expires_at,
        created_at: sessionData.created_at,
        offers_count: sessionData.offers.length
      },
      security: {
        validated: true,
        ip_bound: sessionData.client_ip === clientIp,
        user_agent_consistent: sessionData.user_agent === userAgent
      }
    });

  } catch (error) {
    console.error('❌ Session validation error:', error);
    
    // Log security event for validation errors
    await mongoSessionManager.logSecurityEvent('SESSION_VALIDATION_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
