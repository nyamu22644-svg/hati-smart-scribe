
import React, { useState, useEffect } from 'react';
import { X, Smartphone, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import { APP_CONFIG } from "@/constants/appConfig";
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface MpesaPaymentModalProps {
  userId: string;
  planId: string;
  amount: number;
  onClose: () => void;
}

/**
 * HATI M-PESA GATEWAY MODAL
 * Cyber-Vault aesthetic for financial transactions.
 */
export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({ userId, planId, amount, onClose }) => {
  const [phone, setPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountedAmount, setDiscountedAmount] = useState(amount);
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');
  const [promoCodes, setPromoCodes] = useState<any>({});
  const [promoError, setPromoError] = useState('');

  // Load promo codes on mount
  useEffect(() => {
    const loadPromoCodes = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'promo_codes'));
        if (configDoc.exists()) {
          setPromoCodes(configDoc.data());
        }
      } catch (error) {
        console.error('Error loading promo codes:', error);
      }
    };

    loadPromoCodes();
  }, []);

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Enter a promo code');
      return;
    }

    try {
      const codeData = promoCodes[promoCode.toUpperCase()];
      
      if (!codeData) {
        setPromoError('Invalid promo code');
        return;
      }

      if (!codeData.active) {
        setPromoError('This promo code has expired');
        return;
      }

      if (codeData.usedCount >= codeData.maxUses) {
        setPromoError('This promo code has reached its usage limit');
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (codeData.discountPercent > 0) {
        discountAmount = Math.round(amount * (codeData.discountPercent / 100));
      } else if (codeData.discountAmount > 0) {
        discountAmount = codeData.discountAmount;
      }

      const newAmount = Math.max(0, amount - discountAmount);
      setDiscount(discountAmount);
      setDiscountedAmount(newAmount);
      setPromoError('');
    } catch (error) {
      setPromoError('Error validating promo code');
    }
  };

  const handleSTKPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('PENDING');
    setErrorMsg('');

    try {
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId,
          amount: discountedAmount,
          phoneNumber: phone,
          promoCode: discount > 0 ? promoCode.toUpperCase() : null
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Payment failed to initiate.');

      // If promo code was applied, track its usage
      if (discount > 0 && promoCode) {
        try {
          const { updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, 'config', 'promo_codes'), {
            [promoCode.toUpperCase()]: {
              ...promoCodes[promoCode.toUpperCase()],
              usedCount: (promoCodes[promoCode.toUpperCase()]?.usedCount || 0) + 1
            }
          });
        } catch (error) {
          console.error('Error tracking promo code usage:', error);
        }
      }

      // Wait for user to check phone - in a real app, we'd poll or wait for webhook
      // For this UI, we show a 'Check Phone' state
      setTimeout(() => {
        setStatus('SUCCESS');
      }, 2000);

    } catch (err: any) {
      setStatus('ERROR');
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-navy/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl border border-gold/20 overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-300 hover:text-navy transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10">
          <header className="text-center mb-10">
            <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-serif font-black text-navy mb-2">M-Pesa STK Push</h3>
            <p className="text-slate-500 text-sm font-medium">
              Pay <span className="text-navy font-bold">{APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {amount}</span> to unlock Guardian status.
            </p>
          </header>

          {status === 'IDLE' && (
            <form onSubmit={handleSTKPush} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">M-Pesa Number</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">254</span>
                  <input 
                    type="tel" 
                    required
                    placeholder="712345678"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] outline-none focus:border-gold transition-all text-lg font-black"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1">Example: 0712 345 678</p>
              </div>

              <div className="space-y-3 bg-gold/5 border border-gold/20 rounded-[24px] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gold" />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promo Code (Optional)</label>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. SAVE20)"
                    className="flex-1 px-4 py-3 bg-white border-2 border-gold/30 rounded-[16px] outline-none focus:border-gold transition-all text-sm font-bold uppercase"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-5 py-3 bg-gold/10 hover:bg-gold/20 border-2 border-gold/30 rounded-[16px] font-bold text-gold transition-all"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs font-bold text-crimson">{promoError}</p>
                )}
                {discount > 0 && (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-[16px] px-4 py-3 mt-2">
                    <span className="text-xs font-bold text-emerald-700">Discount Applied</span>
                    <span className="text-sm font-black text-emerald-600">-{APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {discount}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-600">Subtotal</span>
                  <span className="text-sm font-black text-navy">{APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {amount}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="text-sm font-bold">Discount</span>
                    <span className="text-sm font-black">-{APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="text-lg font-black text-navy">Total</span>
                  <span className="text-lg font-black text-gold">{APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {discountedAmount}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-navy text-gold font-black py-6 rounded-[24px] shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
              >
                Request Prompt <ShieldCheck className="w-5 h-5" />
              </button>
            </form>
          )}

          {status === 'PENDING' && (
            <div className="text-center py-10 space-y-6 animate-pulse">
              <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto" />
              <div>
                <p className="text-xl font-black text-navy">Check Your Phone</p>
                <p className="text-sm text-slate-500 font-medium mt-2">Enter your M-Pesa PIN on the prompt sent to your device.</p>
              </div>
            </div>
          )}

          {status === 'SUCCESS' && (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <div>
                <p className="text-xl font-black text-navy">✅ Payment Requested</p>
                <p className="text-sm text-slate-500 font-medium mt-2">Once confirmed, your vault will automatically upgrade to Guardian status.</p>
              </div>
              <button 
                onClick={() => {
                  // Set flag to auto-navigate to settings after reload
                  sessionStorage.setItem('HATI_FEATURE_JUST_ACTIVATED', 'can_use_biometrics');
                  // Trigger page reload to refresh permissions and show the feature setup
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="space-y-6 animate-in shake duration-300">
              <div className="bg-rose-50 border border-crimson/10 p-6 rounded-[32px] flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-crimson flex-shrink-0" />
                <p className="text-xs font-bold text-crimson leading-relaxed">{errorMsg}</p>
              </div>
              <button 
                onClick={() => setStatus('IDLE')}
                className="w-full bg-navy text-white font-bold py-5 rounded-[24px]"
              >
                Try Again
              </button>
            </div>
          )}

          <footer className="mt-10 pt-6 border-t border-slate-50 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Securely Processed via IntaSend Authority
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
