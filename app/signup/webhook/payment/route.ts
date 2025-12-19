
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * HATI Payment Verification Webhook
 * Responds to IntaSend notifications to activate Guardian status.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, api_ref, value, challenge } = body;

    // Security check: Verify webhook authenticity via shared secret challenge
    if (challenge !== process.env.INTASEND_CHALLENGE) {
      return NextResponse.json({ error: 'Unauthorized challenge mismatch' }, { status: 403 });
    }

    if (state === 'COMPLETE') {
      const userId = api_ref;
      const amount = parseFloat(value);
      
      // Calculate Expiry Logic
      const now = Date.now();
      let durationMs = 0;
      
      if (amount >= 2999) {
        durationMs = 365 * 24 * 60 * 60 * 1000; // 1 Year
      } else if (amount >= 299) {
        durationMs = 30 * 24 * 60 * 60 * 1000; // 1 Month
      }

      if (durationMs > 0) {
        const expiryDate = new Date(now + durationMs);
        
        // Update user's authority record in Firestore
        await adminDb.collection('users').doc(userId).set({
          isPremium: true,
          plan: 'guardian',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
        }, { merge: true });

        console.log(`HATI Authority: Activated Guardian status for User ${userId}`);
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
