import React, { useState } from 'react';
import { 
  Crown, 
  Shield, 
  Users, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  X,
  Zap,
  Heart,
  FileText,
  Share2
} from 'lucide-react';

interface GuardianUpgradeProps {
  onClose: () => void;
  onUpgradeClick: () => void;
}

export const GuardianUpgrade: React.FC<GuardianUpgradeProps> = ({ onClose, onUpgradeClick }) => {
  const [selectedPlan, setSelectedPlan] = useState<'guardian' | 'elder'>('guardian');

  const features = {
    guardian: [
      { icon: <Users className="w-5 h-5" />, label: 'Family Profiles', desc: 'Create profiles for spouse, children, parents' },
      { icon: <Shield className="w-5 h-5" />, label: 'Guardian Protocol', desc: 'Designate trusted guardians for medical decisions' },
      { icon: <Lock className="w-5 h-5" />, label: 'WebAuthn Passkeys', desc: 'Military-grade biometric authentication' },
      { icon: <Zap className="w-5 h-5" />, label: 'Priority Support', desc: '24/7 concierge assistance' },
      { icon: <Heart className="w-5 h-5" />, label: 'Health Insights', desc: 'AI-powered health recommendations' },
      { icon: <Share2 className="w-5 h-5" />, label: 'Unlimited Sharing', desc: 'Share records with hospitals & practitioners' }
    ],
    elder: [
      { icon: <FileText className="w-5 h-5" />, label: 'Advanced Waivers', desc: 'Medical waivers & advance directives' },
      { icon: <Users className="w-5 h-5" />, label: 'Multi-Generation', desc: 'Legacy profiles for estate planning' },
      { icon: <Shield className="w-5 h-5" />, label: 'Enhanced Guardian', desc: 'Multi-guardian approval system' },
      { icon: <Lock className="w-5 h-5" />, label: 'Inheritance Planning', desc: 'Secure data succession protocol' }
    ]
  };

  return (
    <div className="fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-[48px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-navy to-slate-900 p-8 flex items-center justify-between border-b border-gold/20">
          <div className="flex items-center gap-3">
            <div className="bg-gold p-3 rounded-2xl shadow-lg">
              <Crown className="text-navy w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-black text-white tracking-tight">Guardian Plan</h1>
              <p className="text-gold text-xs font-black uppercase tracking-widest">Unlock Premium Features</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-10">
          {/* Value Prop */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-serif font-black text-navy tracking-tight">Protect Your Family's Health Legacy</h2>
              <p className="text-slate-600 leading-relaxed">
                The Guardian Plan transforms HATI from a personal vault into a family health command center. Invite family members, designate guardians for emergency decisions, and ensure medical continuity across generations.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Guardian Plan */}
              <div 
                onClick={() => setSelectedPlan('guardian')}
                className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all ${
                  selectedPlan === 'guardian' 
                    ? 'bg-navy text-white border-gold shadow-2xl shadow-gold/20' 
                    : 'bg-slate-50 text-navy border-slate-200 hover:border-gold'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-black mb-2">Guardian Plan</h3>
                    <p className={`text-sm font-bold uppercase tracking-widest ${selectedPlan === 'guardian' ? 'text-gold/80' : 'text-slate-500'}`}>
                      For families
                    </p>
                  </div>
                  <Shield className={`w-8 h-8 ${selectedPlan === 'guardian' ? 'text-gold' : 'text-gold'}`} />
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">$9.99</span>
                    <span className={`text-sm font-bold ${selectedPlan === 'guardian' ? 'text-white/70' : 'text-slate-500'}`}>/month</span>
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${selectedPlan === 'guardian' ? 'text-gold' : 'text-slate-400'}`}>
                    Billed Monthly
                  </p>
                </div>
                <button 
                  onClick={onUpgradeClick}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${
                    selectedPlan === 'guardian'
                      ? 'bg-gold text-navy hover:bg-amber-300'
                      : 'bg-navy text-white hover:bg-slate-800'
                  }`}
                >
                  Upgrade Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Elder Plan */}
              <div 
                onClick={() => setSelectedPlan('elder')}
                className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all relative ${
                  selectedPlan === 'elder' 
                    ? 'bg-navy text-white border-gold shadow-2xl shadow-gold/20' 
                    : 'bg-slate-50 text-navy border-slate-200 hover:border-gold'
                }`}
              >
                <div className="absolute -top-3 left-6 bg-crimson text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Coming Soon
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-serif font-black mb-2">Elder Plan</h3>
                    <p className={`text-sm font-bold uppercase tracking-widest ${selectedPlan === 'elder' ? 'text-gold/80' : 'text-slate-500'}`}>
                      For estates
                    </p>
                  </div>
                  <Crown className={`w-8 h-8 ${selectedPlan === 'elder' ? 'text-gold' : 'text-slate-400'}`} />
                </div>
                <div className="mb-6 opacity-50">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">$19.99</span>
                    <span className={`text-sm font-bold ${selectedPlan === 'elder' ? 'text-white/70' : 'text-slate-500'}`}>/month</span>
                  </div>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-2 ${selectedPlan === 'elder' ? 'text-gold' : 'text-slate-400'}`}>
                    Available 2025
                  </p>
                </div>
                <button 
                  disabled
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm opacity-50 cursor-not-allowed bg-slate-300 text-slate-600"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-xl font-serif font-black text-navy tracking-tight">
              {selectedPlan === 'guardian' ? 'Guardian Plan Features' : 'Elder Plan Features'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {features[selectedPlan].map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center text-navy">
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-sm">{feature.label}</p>
                    <p className="text-xs text-slate-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Free vs Premium Comparison */}
          <div className="bg-gradient-to-r from-gold/10 to-transparent p-6 rounded-[24px] border border-gold/20 space-y-4">
            <h3 className="font-black text-navy text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-4 h-4 text-gold" /> What You Get
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-slate-700"><strong>Unlimited Family Profiles</strong> - No seat limits</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-slate-700"><strong>Guardian Decision Authority</strong> - Pre-authorize healthcare choices</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-slate-700"><strong>Medical Waivers</strong> - Legal advance directives & DNR orders</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-slate-700"><strong>24/7 Concierge</strong> - WhatsApp support for emergencies</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
              Secure checkout powered by M-Pesa & Stripe
            </p>
            <button
              onClick={onUpgradeClick}
              className="w-full bg-gold hover:bg-amber-400 text-navy font-black py-5 rounded-[32px] uppercase tracking-widest text-sm shadow-2xl transition-all active:scale-95"
            >
              Continue to Payment
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-navy font-bold py-4 rounded-[32px] uppercase tracking-widest text-xs transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
