
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  Clock, 
  ShieldAlert, 
  Loader2,
  Lock,
  UserPlus,
  Info,
  AlertCircle,
  Trash2,
  Send
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { InheritanceInfo, Beneficiary, UserRecord } from '@/types';

interface InheritanceSettingsProps {
  user: UserRecord;
  onUpdate?: () => void;
}

export const InheritanceSettings: React.FC<InheritanceSettingsProps> = ({ user, onUpdate }) => {
  const [savingBeneficiary, setSavingBeneficiary] = useState(false);
  const [inactivityDays, setInactivityDays] = useState(user.inheritance?.inactivityPeriodDays || 90);
  const [existingBeneficiaries, setExistingBeneficiaries] = useState<Beneficiary[]>([]);
  
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    sendNotification: true
  });

  // Load existing beneficiaries on mount
  useEffect(() => {
    if (user.inheritance?.primary) {
      setExistingBeneficiaries([
        {
          ...user.inheritance.primary,
          role: 'primary',
          addedAt: new Date().toISOString(),
          verified: false
        } as unknown as Beneficiary
      ]);
    }
    if (user.inheritance?.alternate) {
      setExistingBeneficiaries(prev => [
        ...prev,
        {
          ...user.inheritance.alternate,
          role: 'alternate',
          addedAt: new Date().toISOString(),
          verified: false
        } as unknown as Beneficiary
      ]);
    }
  }, [user.inheritance]);

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBeneficiary.name || !newBeneficiary.email) {
      alert("Name and email are required.");
      return;
    }

    if (existingBeneficiaries.length >= 2) {
      alert("You can only designate up to 2 heirs (primary and alternate).");
      return;
    }

    setSavingBeneficiary(true);
    try {
      const isFirstBeneficiary = existingBeneficiaries.length === 0;
      const role = isFirstBeneficiary ? 'primary' : 'alternate';
      
      const newInheritance: InheritanceInfo = {
        ...user.inheritance,
        inactivityPeriodDays: inactivityDays,
        status: 'active'
      };

      if (isFirstBeneficiary) {
        newInheritance.primary = {
          name: newBeneficiary.name,
          email: newBeneficiary.email,
          phone: newBeneficiary.phone,
          relationship: newBeneficiary.relationship,
          type: 'primary',
          status: 'pending',
          addedAt: new Date()
        };
      } else {
        newInheritance.alternate = {
          name: newBeneficiary.name,
          email: newBeneficiary.email,
          phone: newBeneficiary.phone,
          relationship: newBeneficiary.relationship,
          type: 'alternate',
          status: 'pending',
          addedAt: new Date()
        };
      }

      await updateDoc(doc(db, 'users', user.uid), {
        inheritance: newInheritance,
        updatedAt: serverTimestamp()
      });

      // Add to local state
      const beneficiary: Beneficiary = {
        name: newBeneficiary.name,
        email: newBeneficiary.email,
        phone: newBeneficiary.phone,
        relationship: newBeneficiary.relationship,
        type: role as any,
        role: role as any,
        status: 'pending',
        verified: false,
        addedAt: new Date().toISOString()
      };

      setExistingBeneficiaries([...existingBeneficiaries, beneficiary]);
      setNewBeneficiary({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        sendNotification: true
      });

      if (newBeneficiary.sendNotification) {
        // TODO: Send invitation email via API
        console.log(`Send invitation to ${newBeneficiary.email}`);
      }

      alert(`✅ ${role === 'primary' ? 'Primary' : 'Alternate'} heir added successfully!`);
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Failed to add heir. Please try again.");
    } finally {
      setSavingBeneficiary(false);
    }
  };

  const removeBeneficiary = async (index: number) => {
    if (!window.confirm("Are you sure you want to remove this heir?")) {
      return;
    }

    setSavingBeneficiary(true);
    try {
      const beneficiary = existingBeneficiaries[index];
      const newInheritance: InheritanceInfo = {
        ...user.inheritance,
        inactivityPeriodDays: inactivityDays
      };

      if (beneficiary.role === 'primary') {
        newInheritance.primary = undefined;
      } else {
        newInheritance.alternate = undefined;
      }

      // If no beneficiaries left, set status to inactive
      if (!newInheritance.primary && !newInheritance.alternate) {
        newInheritance.status = 'inactive';
      }

      await updateDoc(doc(db, 'users', user.uid), {
        inheritance: newInheritance,
        updatedAt: serverTimestamp()
      });

      setExistingBeneficiaries(prev => prev.filter((_, i) => i !== index));
      alert("✅ Heir removed successfully.");
      onUpdate?.();
    } catch (err) {
      console.error(err);
      alert("Failed to remove heir. Please try again.");
    } finally {
      setSavingBeneficiary(false);
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
          <p className="text-slate-400 max-w-md font-medium">Designate primary and alternate heirs to ensure your clinical history remains accessible to your family in extreme events.</p>
          
          <div className="flex items-center gap-3">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
              Status: {status.toUpperCase()}
            </div>
            {user.lastActiveAt && (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Last Heartbeat: {new Date((user.lastActiveAt.seconds || 0) * 1000).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-10 space-y-8">
        {/* Existing Beneficiaries Display */}
        {existingBeneficiaries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-wide flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gold" /> Designated Heirs
            </h3>
            <div className="space-y-3">
              {existingBeneficiaries.map((beneficiary, idx) => (
                <div 
                  key={idx}
                  className="flex items-start justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl hover:border-gold/50 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        beneficiary.role === 'primary' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        {beneficiary.role === 'primary' ? '⭐ Primary Heir' : '🔄 Alternate Heir'}
                      </span>
                      {beneficiary.status === 'verified' && (
                        <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-navy font-bold text-lg">{beneficiary.name}</p>
                    <p className="text-slate-500">{beneficiary.email}</p>
                    {beneficiary.phone && <p className="text-slate-500">{beneficiary.phone}</p>}
                    {beneficiary.relationship && <p className="text-slate-400 text-sm">Relationship: {beneficiary.relationship}</p>}
                  </div>
                  <button
                    onClick={() => removeBeneficiary(idx)}
                    disabled={savingBeneficiary}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-50 font-bold px-3 py-2"
                    title="Remove heir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Beneficiary Form */}
        {existingBeneficiaries.length < 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-wide flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gold" /> 
              {existingBeneficiaries.length === 0 ? 'Add Primary Heir' : 'Add Alternate Heir'}
            </h3>
            <form onSubmit={handleAddBeneficiary} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={newBeneficiary.name}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                    placeholder="e.g., Jane Doe"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-gold font-bold transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="email"
                      value={newBeneficiary.email}
                      onChange={(e) => setNewBeneficiary({...newBeneficiary, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pl-12 outline-none focus:border-gold font-bold transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="tel"
                        value={newBeneficiary.phone}
                        onChange={(e) => setNewBeneficiary({...newBeneficiary, phone: e.target.value})}
                        placeholder="+254 7XX XXX XXX"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 pl-12 outline-none focus:border-gold font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relationship</label>
                    <input
                      type="text"
                      value={newBeneficiary.relationship}
                      onChange={(e) => setNewBeneficiary({...newBeneficiary, relationship: e.target.value})}
                      placeholder="e.g., Spouse, Parent, Child"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-gold font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBeneficiary.sendNotification}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, sendNotification: e.target.checked})}
                    className="w-4 h-4 rounded cursor-pointer accent-gold"
                  />
                  <span className="text-sm text-slate-600 font-bold">Send invitation email to designated heir</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingBeneficiary || !newBeneficiary.name || !newBeneficiary.email}
                className="w-full px-6 py-4 bg-gold text-navy font-bold rounded-2xl hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {savingBeneficiary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Add {existingBeneficiaries.length === 0 ? 'Primary' : 'Alternate'} Heir
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-navy uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-gold" /> How It Works
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <div className="bg-gold text-navy rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                <p><span className="font-bold">Designate Heirs:</span> Add primary and (optionally) alternate beneficiaries</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-gold text-navy rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                <p><span className="font-bold">Inactivity Detection:</span> System monitors your heartbeat via login activity</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-gold text-navy rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div>
                <p><span className="font-bold">Automatic Trigger:</span> After {inactivityDays} days of no activity, heirs receive access request</p>
              </div>
              <div className="flex gap-3">
                <div className="bg-gold text-navy rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-xs">4</div>
                <p><span className="font-bold">Verification:</span> Heir confirms identity before accessing clinical data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inactivity Setting */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Inactivity Period (Days)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="30" 
                max="365" 
                value={inactivityDays}
                onChange={(e) => setInactivityDays(parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold"
              />
              <span className="text-2xl font-black text-navy w-16 text-right">{inactivityDays}</span>
            </div>
            <p className="text-xs text-slate-500 ml-1">Trigger inheritance protocol after {inactivityDays} days of no login</p>
          </div>
        </div>
      </div>
    </div>
  );
};
