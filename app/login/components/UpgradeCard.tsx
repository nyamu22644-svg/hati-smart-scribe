
import React from 'react';
import { Check, Crown, Zap, ShieldCheck } from 'lucide-react';
import { SubscriptionPlan } from "@/config/subscriptionPlans";
import { APP_CONFIG } from "@/constants/appConfig";

interface UpgradeCardProps {
  plan: SubscriptionPlan;
  onSubscribe: (planId: string) => void;
  isCurrent?: boolean;
}

/**
 * HATI UPGRADE CARD
 * High-security aesthetic with glassmorphism and conditional glowing effects.
 */
export const UpgradeCard: React.FC<UpgradeCardProps> = ({ plan, onSubscribe, isCurrent }) => {
  const isGold = plan.highlightColor === 'gold';
  const isEmerald = plan.highlightColor === 'emerald';
  
  return (
    <div className={`
      relative group flex flex-col p-8 rounded-[40px] transition-all duration-500
      backdrop-blur-xl bg-navy/40 border-2
      ${plan.recommended 
        ? 'border-gold shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-105 z-10' 
        : 'border-white/10 hover:border-white/20'}
    `}>
      {/* Recommended Glow Effect */}
      {plan.recommended && (
        <div className="absolute inset-0 rounded-[40px] bg-gold/5 animate-pulse pointer-events-none" />
      )}
      
      {/* Badge */}
      {plan.recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-navy text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl">
          Authorized Choice
        </div>
      )}

      <div className="mb-8">
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-6
          ${isGold ? 'bg-gold/10 text-gold' : 'bg-white/5 text-slate-400'}
        `}>
          {isGold ? <Crown className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
        </div>
        
        <h3 className="text-2xl font-serif font-black text-white mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white">
            {APP_CONFIG.DEFAULT_CURRENCY_SYMBOL} {plan.price.toLocaleString()}
          </span>
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">/month</span>
        </div>
      </div>

      <div className="space-y-4 mb-10 flex-1">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-1 p-0.5 rounded-full ${isGold ? 'bg-gold/20 text-gold' : 'bg-white/10 text-slate-500'}`}>
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-slate-300 leading-tight">{feature}</span>
          </div>
        ))}
      </div>

      <button
        disabled={isCurrent}
        onClick={() => onSubscribe(plan.id)}
        className={`
          w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-[0.97]
          ${isCurrent 
            ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            : isGold 
              ? 'bg-gold hover:bg-amber-400 text-navy shadow-[0_10px_30px_rgba(212,175,55,0.3)]' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}
        `}
      >
        {isCurrent ? 'Current Tier' : plan.ctaText || 'Select Plan'}
      </button>
    </div>
  );
};
