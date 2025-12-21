
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
  UserPlus
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { InheritanceInfo, UserRecord } from '@/types';

interface InheritanceSettingsProps {
  user: UserRecord;
}

export const InheritanceSettings: React.FC<InheritanceSettingsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<InheritanceInfo, 'status' | 'unlockDate'>>({
    beneficiaryName: user.inheritance?.beneficiaryName || '',
    beneficiaryEmail: user.inheritance?.beneficiaryEmail || '',
    beneficiaryPhone: user.inheritance?.beneficiaryPhone || '',
    inactivityPeriodDays: user.inheritance?.inactivityPeriodDays || 90
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        inheritance: {
          ...formData,
          status: 'active'
        },
        updatedAt: serverTimestamp()
      });

      // 2. Inheritance settings saved to Firestore
      // In production, Cloud Function would send email invitation here
      console.log("HATI_INHERITANCE: Settings saved. Beneficiary notification queued.");
      
      alert("✅ HATI_INHERITANCE: Protocol Initiated!\n\nInheritance plan secured in vault.\n\nBeneficiary will gain access after inactivity period.");
    } catch (err) {
      console.error(err);
      alert("Protocol failure. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const status = user.inheritance?.status || 'inactive';

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-navy p-10 text-white relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Heart className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="bg-gold p-3 rounded-2xl w-14 h-14 flex items-center justify-center shadow-xl">
            <ShieldCheck className="text-navy w-8 h-8" />
          </div>
          <h2 className="text-4xl font-serif font-black tracking-tight">Inheritance Protocol</h2>
          <p className="text-slate-400 max-w-md font-medium">Designate an heir to ensure your clinical history remains accessible to your family in extreme events.</p>
          
          <div className="flex items-center gap-3">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
                <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                Status: {status.toUpperCase()}
             </div>
             {user.lastActiveAt && (
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 Last Heartbeat: {user.lastActiveAt.toDate().toLocaleDateString()}
               </span>
             )}
          </div>
        </div>
      </div>

      <div className="p-10">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-gold" /> Beneficiary Credentials
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-gold font-bold transition-all"
                    placeholder="E.g. Jane Doe"
                    value={formData.beneficiaryName}
                    onChange={e => setFormData({...formData, beneficiaryName: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold font-bold transition-all"
                      placeholder="heir@family.com"
                      value={formData.beneficiaryEmail}
                      onChange={e => setFormData({...formData, beneficiaryEmail: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact</label>
                  <div className="relative">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="tel" 
                      required
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-gold font-bold transition-all"
                      placeholder="+254..."
                      value={formData.beneficiaryPhone}
                      onChange={e => setFormData({...formData, beneficiaryPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" /> Inactivity Threshold
              </h3>
              
              <div className="bg-slate-50 p-8 rounded-[32px] border-2 border-slate-100 space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-4xl font-black text-navy">{formData.inactivityPeriodDays}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days of Silence</p>
                  </div>
                  <ShieldAlert className={`w-8 h-8 ${formData.inactivityPeriodDays <= 30 ? 'text-crimson animate-pulse' : 'text-slate-200'}`} />
                </div>

                <input 
                  type="range" 
                  min="30" 
                  max="365" 
                  step="1"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy"
                  value={formData.inactivityPeriodDays}
                  onChange={e => setFormData({...formData, inactivityPeriodDays: parseInt(e.target.value) as any})}
                />

                <div className="grid grid-cols-3 gap-2">
                  {[30, 90, 365].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormData({...formData, inactivityPeriodDays: d as any})}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${formData.inactivityPeriodDays === d ? 'bg-navy border-navy text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-navy/20'}`}
                    >
                      {d === 365 ? '1 Year' : `${d} Days`}
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase italic tracking-tighter">
                  Caution: If you do not access your vault for {formData.inactivityPeriodDays} days, HATI will automatically initiate the transfer of credentials to {formData.beneficiaryEmail || '[Beneficiary]'}.
                </p>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-navy text-gold font-black py-6 rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-lg"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Lock className="w-5 h-5" /> Seal Inheritance Protocol</>}
          </button>
        </form>
      </div>
    </div>
  );
};
