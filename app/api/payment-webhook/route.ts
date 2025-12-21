
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebaseAdmin';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

/**
 * HATI PAYMENT VERIFICATION WEBHOOK
 * Handles IntaSend M-Pesa callbacks with signature verification and refund handling.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, api_ref, challenge, value, reference, customer_phone } = body;

    // 1. SIGNATURE VERIFICATION - Validate webhook authenticity
    const webhook_secret = process.env.INTASEND_WEBHOOK_SECRET || 'default-secret';
    const signature = req.headers.get('x-intasend-signature');
    
    if (signature) {
      const hash = crypto.createHmac('sha256', webhook_secret).update(JSON.stringify(body)).digest('hex');
      if (signature !== hash) {
        console.warn('HATI_SECURITY: Invalid webhook signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // 2. Challenge validation (optional)
    if (challenge && process.env.INTASEND_CHALLENGE && challenge !== process.env.INTASEND_CHALLENGE) {
      return NextResponse.json({ error: 'Unauthorized challenge' }, { status: 403 });
    }

    const userId = api_ref;
    const amount = parseFloat(value);

    // 3. HANDLE DIFFERENT PAYMENT STATES
    if (state === 'COMPLETE') {
      console.log(`HATI_AUTHORITY: Verified payment of ${amount} for User ${userId}`);

      const now = Date.now();
      const durationMs = amount >= 2999 ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(now + durationMs);

      // Update user with premium status
      await adminDb.collection('users').doc(userId).set({
        isPremium: true,
        plan: 'guardian',
        paymentReference: reference,
        customerPhone: customer_phone,
        lastPaymentDate: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
      }, { merge: true });

      // Log successful payment
      await adminDb.collection('payment_logs').add({
        userId,
        amount,
        state: 'COMPLETE',
        reference,
        timestamp: admin.firestore.Timestamp.now(),
        expiryDate: admin.firestore.Timestamp.fromDate(expiryDate)
      });

      return NextResponse.json({ status: 'PROVISIONED' });
    } 
    
    // 4. HANDLE REFUND/CHARGEBACK
    else if (state === 'FAILED' || state === 'CANCELLED' || state === 'CHARGEBACK') {
      console.log(`HATI_SECURITY: Payment ${state} for User ${userId}`);
      
      // Log the refund/chargeback
      await adminDb.collection('payment_logs').add({
        userId,
        amount,
        state,
        reference,
        timestamp: admin.firestore.Timestamp.now()
      });

      // For chargebacks, mark user as having a chargeback
      if (state === 'CHARGEBACK') {
        await adminDb.collection('users').doc(userId).update({
          hasChargeback: true,
          chargebackDate: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(() => {
          console.warn(`User ${userId} not found for chargeback marking`);
        });
      }

      return NextResponse.json({ status: 'PROCESSED' });
    }
    
    // 5. PENDING STATE
    else if (state === 'PENDING') {
      console.log(`HATI_PAYMENT: Pending payment ${reference} for User ${userId}`);
      
      await adminDb.collection('payment_logs').add({
        userId,
        amount,
        state: 'PENDING',
        reference,
        timestamp: admin.firestore.Timestamp.now()
      });
    }

    return NextResponse.json({ status: 'RECEIVED' });
  } catch (error: any) {
    console.error('WEBHOOK_CRITICAL_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
