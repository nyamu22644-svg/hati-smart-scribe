
import React, { useState } from 'react';
import { X, Smartphone, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from "@/constants/appConfig";

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
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMsg, setErrorMsg] = useState('');

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
          amount,
          phoneNumber: phone
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Payment failed to initiate.');

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
                <p className="text-xl font-black text-navy">Payment Requested</p>
                <p className="text-sm text-slate-500 font-medium mt-2">Once payment is complete, your vault will automatically upgrade to Guardian status.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full bg-slate-100 text-navy font-bold py-4 rounded-2xl"
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
