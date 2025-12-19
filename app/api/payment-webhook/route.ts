
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * HATI PAYMENT VERIFICATION WEBHOOK
 * Handled via IntaSend callback system.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, api_ref, challenge, value } = body;

    // 1. Security check: Challenge validation (optional but recommended)
    if (challenge && process.env.INTASEND_CHALLENGE && challenge !== process.env.INTASEND_CHALLENGE) {
      return NextResponse.json({ error: 'Unauthorized challenge' }, { status: 403 });
    }

    // 2. Process Completion
    if (state === 'COMPLETE') {
      const userId = api_ref;
      const amount = parseFloat(value);
      
      console.log(`HATI_AUTHORITY: Verified payment of ${amount} for User ${userId}`);

      // Calculate Duration (Guardian Tier Logic)
      const now = Date.now();
      const durationMs = amount >= 2999 ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(now + durationMs);

      // 3. Update Registry Document
      await adminDb.collection('users').doc(userId).set({
        isPremium: true,
        plan: 'guardian',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
      }, { merge: true });

      return NextResponse.json({ status: 'PROVISIONED' });
    }

    return NextResponse.json({ status: 'RECEIVED' });
  } catch (error: any) {
    console.error('WEBHOOK_CRITICAL_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
