
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Crown, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { MpesaPaymentModal } from './MpesaPaymentModal';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UpgradeButtonProps {
  userId: string;
  email: string;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({ userId, email }) => {
  const [selectedPlan, setSelectedPlan] = useState<{id: string, amount: number} | null>(null);
  const [pricing, setPricing] = useState({
    monthlyPrice: 299,
    yearlyPrice: 2999,
    yearlyDiscount: 20,
    currency: 'KES',
    currencySymbol: 'Ksh'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'config', 'business_settings'));
        if (configDoc.exists()) {
          const config = configDoc.data();
          setPricing({
            monthlyPrice: config.guardianMonthlyPrice || 299,
            yearlyPrice: config.guardianYearlyPrice || 2999,
            yearlyDiscount: config.yearlyDiscountPercent || 20,
            currency: config.currency || 'KES',
            currencySymbol: config.currencySymbol || 'Ksh'
          });
        }
      } catch (error) {
        console.error('Error fetching pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);


  return (
    <div className="bg-navy rounded-[40px] p-10 border-4 border-gold shadow-2xl overflow-hidden relative group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4 text-center md:text-left">
          <div className="bg-gold-premium px-4 py-1.5 rounded-full inline-flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4 text-navy" />
            <span className="text-[10px] font-black uppercase tracking-widest text-navy">Premium Authority</span>
          </div>
          <h3 className="text-4xl font-serif font-black text-white tracking-tight">Upgrade to Guardian</h3>
          <p className="text-slate-400 max-w-sm">Unlock the full HATI registry. Family management, global medical passports, and high-priority AI analysis.</p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              "Unlimited Scribe",
              "Multi-Profile Registry",
              "Certified PDF Reports",
              "24/7 Priority Support"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-gold" /> {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          <button 
            onClick={() => setSelectedPlan({ id: 'guardian_monthly', amount: pricing.monthlyPrice })}
            disabled={loading}
            className="bg-white hover:bg-slate-100 text-navy font-black py-5 px-10 rounded-3xl shadow-xl flex items-center justify-between gap-10 transition-all active:scale-95 disabled:opacity-50"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 text-left">Monthly Plan</p>
              <p className="text-xl">{pricing.currencySymbol} {pricing.monthlyPrice.toLocaleString('en-KE')}<span className="text-sm font-medium">/mo</span></p>
            </div>
            <Smartphone className="w-6 h-6 text-gold" />
          </button>

          <button 
            onClick={() => setSelectedPlan({ id: 'guardian_yearly', amount: pricing.yearlyPrice })}
            disabled={loading}
            className="bg-gold-premium hover:brightness-110 text-navy font-black py-5 px-10 rounded-3xl shadow-xl flex items-center justify-between gap-10 transition-all active:scale-95 disabled:opacity-50"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-navy/50 text-left">Yearly Plan (Save {pricing.yearlyDiscount}%)</p>
              <p className="text-xl">{pricing.currencySymbol} {pricing.yearlyPrice.toLocaleString('en-KE')}<span className="text-sm font-medium">/yr</span></p>
            </div>
            <Crown className="w-6 h-6" />
          </button>
        </div>
      </div>

      {selectedPlan && (
        <MpesaPaymentModal 
          userId={userId}
          planId={selectedPlan.id}
          amount={selectedPlan.amount}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};
