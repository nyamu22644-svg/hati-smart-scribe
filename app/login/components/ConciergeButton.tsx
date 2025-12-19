
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { APP_CONFIG } from "@/constants/appConfig";

export const ConciergeButton: React.FC = () => {
  const WHATSAPP_NUMBER = APP_CONFIG.SUPPORT_WHATSAPP;
  const MESSAGE = encodeURIComponent("I need help with my Hati Vault.");
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`;

  return (
    <div className="fixed bottom-8 right-8 z-[100] group">
      <div className="absolute -top-12 right-0 bg-navy text-gold text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap border border-gold/30">
        Talk to Concierge
      </div>
      <a 
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="w-16 h-16 bg-gold hover:bg-amber-400 text-navy rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(212,175,55,0.4)] transition-all active:scale-90 animate-in fade-in slide-in-from-bottom-4 duration-1000"
      >
        <MessageCircle className="w-8 h-8 fill-navy/10" />
      </a>
    </div>
  );
};
