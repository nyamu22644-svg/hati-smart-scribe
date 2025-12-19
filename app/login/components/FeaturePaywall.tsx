
import React from 'react';
import { X, ShieldAlert, Lock } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from "@/config/subscriptionPlans";
import { UpgradeCard } from './UpgradeCard';

interface FeaturePaywallProps {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubscribe: (planId: string) => void;
  currentPlanId?: string;
}

/**
 * HATI FEATURE PAYWALL
 * The gateway to premium authority. Maps through config-defined plans.
 */
export const FeaturePaywall: React.FC<FeaturePaywallProps> = ({ 
  title, 
  subtitle, 
  onClose, 
  onSubscribe,
  currentPlanId = 'essential'
}) => {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-navy/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="max-w-6xl w-full bg-[#050B18] rounded-[60px] border border-white/5 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Trigger */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/50 hover:text-white transition-all z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-12 md:p-20 overflow-y-auto scrollbar-hide">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <div className="bg-gold/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-4 tracking-tight">
              {title}
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              {subtitle}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <UpgradeCard 
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlanId}
                onSubscribe={onSubscribe}
              />
            ))}
          </div>

          <footer className="mt-16 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              <ShieldAlert className="w-3 h-3" /> Secure Transaction Authority
            </div>
            <p className="text-white/10 text-[9px] max-w-md mx-auto leading-relaxed">
              HATI utilizes institutional grade billing gateways. All clinical data remains encrypted during the transaction phase.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};
