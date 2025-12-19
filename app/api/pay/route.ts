
import { NextRequest, NextResponse } from 'next/server';

/**
 * HATI PAYMENT AUTHORITY - STK PUSH INITIATOR
 * Securely triggers an M-Pesa prompt via IntaSend.
 */
export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, planId, userId, amount } = await req.json();

    if (!phoneNumber || !userId || !amount) {
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // Ensure phone number is in 254... format
    let formattedPhone = phoneNumber.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
      formattedPhone = '254' + formattedPhone;
    }

    const response = await fetch('https://payment.intasend.com/api/v1/payment/mpesa-stk-push/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.INTASEND_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: formattedPhone,
        amount: amount,
        api_ref: userId, // Link payment to user UID
        comment: `HATI Plan Upgrade: ${planId}`
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'IntaSend STK initiation failed');
    }

    return NextResponse.json({ 
      status: 'success', 
      invoice_id: data.invoice?.invoice_id,
      tracking_id: data.tracking_id 
    });
    
  } catch (error: any) {
    console.error('PAYMENT_INIT_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
