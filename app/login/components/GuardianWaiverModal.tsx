import React, { useState } from 'react';
import { ShieldAlert, FileWarning, Check, X, ShieldCheck } from 'lucide-react';

interface GuardianWaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  guardianName: string;
}

export const GuardianWaiverModal: React.FC<GuardianWaiverModalProps> = ({ isOpen, onClose, onAccept, guardianName }) => {
  const [checks, setChecks] = useState({
    auth: false,
    login: false,
    liability: false
  });

  if (!isOpen) return null;

  const allAccepted = checks.auth && checks.login && checks.liability;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-navy/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-white rounded-[40px] shadow-2xl border-4 border-crimson overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header: Medical Alert Style */}
        <div className="bg-crimson p-8 text-white flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white p-2 rounded-xl">
              <ShieldAlert className="text-crimson w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-serif font-black tracking-tight uppercase">Medical Authorization</h2>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.3em]">HATI Guardian Protocol Liability Waiver</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-10 space-y-8">
          <div className="prose prose-slate max-w-none">
            <h4 className="text-navy font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-crimson" /> Legal Terms & Conditions
            </h4>
            
            <div className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
              <p>
                <strong className="text-navy">Automated Trigger:</strong> You acknowledge that Hati triggers emergency access based <span className="underline">solely on account inactivity</span>. This system does not clinically verify your health status, hospitalization, or death.
              </p>
              <p>
                <strong className="text-navy">Privacy Release:</strong> By activating this protocol, you provide explicit, irrevocable consent to release and share your entire encrypted medical history with <span className="text-crimson font-bold">{guardianName}</span> upon the trigger event.
              </p>
              <p>
                <strong className="text-navy">No Liability:</strong> Edgait Solutions and Hati Authority are not liable for any data disclosure if this protocol triggers during a non-emergency due to your failure to maintain a "Heartbeat" (login) within your chosen threshold.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-8">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-1 relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={checks.auth}
                  onChange={e => setChecks({...checks, auth: e.target.checked})}
                />
                <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-crimson peer-checked:border-crimson transition-all"></div>
                <Check className="absolute top-1 left-1 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-navy transition-colors">
                I authorize the release of my clinical history to this Guardian.
              </span>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-1 relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={checks.login}
                  onChange={e => setChecks({...checks, login: e.target.checked})}
                />
                <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-crimson peer-checked:border-crimson transition-all"></div>
                <Check className="absolute top-1 left-1 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-navy transition-colors">
                I understand I must log in within my threshold to prevent false triggers.
              </span>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="mt-1 relative">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  checked={checks.liability}
                  onChange={e => setChecks({...checks, liability: e.target.checked})}
                />
                <div className="w-6 h-6 border-2 border-slate-200 rounded-lg peer-checked:bg-crimson peer-checked:border-crimson transition-all"></div>
                <Check className="absolute top-1 left-1 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-xs font-bold text-slate-600 group-hover:text-navy transition-colors">
                I release Hati from all liability regarding this data transfer.
              </span>
            </label>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="border-t border-slate-100 p-8 space-y-4 flex-shrink-0 bg-white">
            <button
              disabled={!allAccepted}
              onClick={onAccept}
              className="w-full bg-crimson hover:bg-red-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-6 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 text-lg"
            >
              <ShieldCheck className="w-6 h-6" /> Authorize Guardian Access
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-navy font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel Authorization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};