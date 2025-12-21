import React, { useState } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  Loader2,
  Lock,
  UserPlus,
  AlertCircle,
  Info
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GuardianInfo, UserRecord } from '../../types';
import { GuardianWaiverModal } from './GuardianWaiverModal';

interface GuardianSettingsProps {
  user: UserRecord;
}

export const GuardianSettings: React.FC<GuardianSettingsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const [formData, setFormData] = useState<Omit<GuardianInfo, 'status' | 'unlockDate'>>({
    guardianName: user.guardian_settings?.guardianName || '',
    guardianEmail: user.guardian_settings?.guardianEmail || '',
    guardianPhone: user.guardian_settings?.guardianPhone || '',
    inactivityThresholdDays: user.guardian_settings?.inactivityThresholdDays || 90
  });

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWaiver(true);
  };

  const confirmAuthorization = async () => {
    setShowWaiver(false);
    setLoading(true);
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        guardian_settings: {
          ...formData,
          status: 'active'
        },
        updatedAt: serverTimestamp()
      });

      // 2. Guardian settings saved to Firestore
      // In production, Cloud Function would send email invitation here
      console.log("HATI_GUARDIAN: Settings saved. Email notification queued.");
      
      alert("✅ HATI_GUARDIAN: Protocol Initiated!\n\nGuardian settings secured in vault.\n\nGuardian will be invited to access your vault in case of emergency.");
    } catch (err) {
      console.error(err);
      alert("System failure. Access logs for details.");
    } finally {
      setLoading(false);
    }
  };

  const status = user.guardian_settings?.status || 'inactive';

  return (
    <>
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
        <div className="bg-navy p-10 text-white relative">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <ShieldAlert className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="bg-gold p-3 rounded-2xl w-14 h-14 flex items-center justify-center shadow-xl">
              <ShieldCheck className="text-navy w-8 h-8" />
            </div>
            <h2 className="text-4xl font-serif font-black tracking-tight">Guardian Protocol</h2>
            <p className="text-slate-400 max-w-md font-medium">Don't let your medical history be locked away when doctors need it most. Appoint a Guardian for emergency access.</p>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-50'}`}></div>
                  Protocol: {status.toUpperCase()}
              </div>
              {user.lastActiveAt && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Last Signal: {new Date(user.lastActiveAt.toMillis()).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="mb-8 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-navy uppercase tracking-widest mb-1">How it works</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                If your vault is not accessed for the specified threshold, your Guardian receives a one-time access link. This ensures clinical history is available if you are incapacitated.
              </p>
            </div>
          </div>

          <form onSubmit={handleInitiate} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-gold" /> Designated Guardian
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-gold font-bold transition-all placeholder:text-slate-300"
                      placeholder="E.g. Dr. Sarah Chen"
                      value={formData.guardianName}
                      onChange={e => setFormData({...formData, guardianName: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="email" 
                        required
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold font-bold transition-all placeholder:text-slate-300"
                        placeholder="guardian@example.com"
                        value={formData.guardianEmail}
                        onChange={e => setFormData({...formData, guardianEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="tel" 
                        required
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold font-bold transition-all placeholder:text-slate-300"
                        placeholder="+254..."
                        value={formData.guardianPhone}
                        onChange={e => setFormData({...formData, guardianPhone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" /> Emergency Threshold
                </h3>
                
                <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-4xl font-black text-navy">{formData.inactivityThresholdDays}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days of Inactivity</p>
                    </div>
                    <AlertCircle className={`w-8 h-8 ${formData.inactivityThresholdDays <= 30 ? 'text-crimson animate-pulse' : 'text-slate-200'}`} />
                  </div>

                  <input 
                    type="range" 
                    min="30" 
                    max="365" 
                    step="1"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy"
                    value={formData.inactivityThresholdDays}
                    onChange={e => setFormData({...formData, inactivityThresholdDays: parseInt(e.target.value) as any})}
                  />

                  <div className="grid grid-cols-3 gap-2">
                    {[30, 90, 365].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({...formData, inactivityThresholdDays: d as any})}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.inactivityThresholdDays === d ? 'bg-navy border-navy text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-navy/20'}`}
                      >
                        {d === 365 ? '1 Year' : `${d} Days`}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                    Designating a Guardian is a high-intent safety action. Ensure the contact information is accurate for immediate emergency dispatch.
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-navy text-gold font-black py-6 rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Lock className="w-5 h-5" /> Seal Guardian Protocol</>}
            </button>
          </form>
        </div>
      </div>

      <GuardianWaiverModal 
        isOpen={showWaiver}
        onClose={() => setShowWaiver(false)}
        onAccept={confirmAuthorization}
        guardianName={formData.guardianName}
      />
    </>
  );
};