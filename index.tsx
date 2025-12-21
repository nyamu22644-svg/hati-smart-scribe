import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Pill, 
  FileText, 
  User as UserIcon, 
  Clock,
  ChevronRight,
  ShieldAlert,
  Users,
  Download,
  Activity,
  ArrowRight,
  UserCircle,
  Lock,
  LogOut,
  Globe,
  Briefcase,
  History,
  CheckCircle,
  Menu,
  X,
  FileSearch,
  Crown,
  Terminal,
  Plus,
  Settings,
  Heart,
  UserCheck
} from 'lucide-react';
import { MedicalRecord, DecryptedMedicalRecord, Profile, UserRecord, PlanConfig } from '@/types';
import { decrypt } from '@/lib/security';
import { seedProductTiers } from '@/lib/seedData';
import MedicalUploader from '@/app/login/components/MedicalUploader';
import VitalsChart from '@/app/login/components/VitalsChart';
import { Auth } from '@/app/login/components/Auth';
import { UpgradeButton } from '@/app/login/components/UpgradeButton';
import { ConciergeButton } from '@/app/login/components/ConciergeButton';
import { GuardianSettings } from '@/app/login/components/GuardianSettings';
import { InheritanceSettings } from '@/app/login/components/InheritanceSettings';
import { WebAuthSettings } from '@/app/login/components/WebAuthSettings';
import { GuardianUpgrade } from '@/app/login/components/GuardianUpgrade';
import PrivacyPolicy from '@/app/privacy/page';
import { auth, db, onAuthStateChanged, signOut } from '@/lib/firebase';
import { BiometricGuard } from '@/app/login/components/BiometricGuard';
import { FeatureLock } from '@/app/login/components/FeatureLock';
import AdminDashboard from '@/app/login/components/AdminDashboard';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { jsPDF } from 'jspdf';

console.log("HATI: Application module loaded");

const DEFAULT_PROFILES: Profile[] = [
  { id: 'p-self', name: 'Self (Me)', relation: 'Self' }
];

const LandingPage: React.FC<{ onAuthClick: () => void }> = ({ onAuthClick }) => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-navy px-8 py-6 flex items-center justify-between border-b-4 border-gold sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gold p-2 rounded-xl shadow-lg">
            <ShieldCheck className="text-navy w-6 h-6" />
          </div>
          <span className="text-2xl font-serif font-black tracking-tighter text-white">HATI</span>
        </div>
        <button 
          onClick={onAuthClick}
          className="bg-gold hover:bg-amber-400 text-navy font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl"
        >
          Access My Vault
        </button>
      </nav>

      <section className="bg-navy pt-24 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--brand-gold)_0%,_transparent_70%)]"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-gold/30 px-6 py-2 rounded-full mb-8">
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Official Medical Registry</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-black text-white leading-tight tracking-tight mb-8">
            Your Health History.<br />
            <span className="text-gold italic">As Permanent as Land.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            HATI is the secure, encrypted vault for your family's medical legacy. 
            Powered by privacy-first AI to ensure your data is verified, indisputable, and always in your control.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button 
              onClick={onAuthClick}
              className="w-full md:w-auto bg-gold hover:bg-amber-400 text-navy font-black px-12 py-6 rounded-3xl text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Get Early Access <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Verified by AES-256 Encryption</p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-black text-navy leading-tight">
                Paper Fades. Doctors Forget.<br />
                <span className="text-crimson">Data Disappears.</span>
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 flex items-center justify-center mt-1">
                    <X className="w-4 h-4 text-crimson" />
                  </div>
                  <p className="text-slate-600 font-medium">Scattered prescriptions lost in drawers.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 flex items-center justify-center mt-1">
                    <X className="w-4 h-4 text-crimson" />
                  </div>
                  <p className="text-slate-600 font-medium">Medical histories trapped in hospital archives.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-crimson/10 flex items-center justify-center mt-1">
                    <X className="w-4 h-4 text-crimson" />
                  </div>
                  <p className="text-slate-600 font-medium">Illegible handwriting causing clinical confusion.</p>
                </div>
              </div>
            </div>
            <div className="bg-navy p-12 rounded-[60px] shadow-2xl relative">
              <div className="absolute -top-4 -left-4 bg-gold p-4 rounded-2xl shadow-xl">
                <Lock className="w-8 h-8 text-navy" />
              </div>
              <h3 className="text-2xl font-serif font-black text-white mb-6">The HATI Promise</h3>
              <p className="text-slate-400 text-lg leading-relaxed italic">
                "We treat your health data like a Title Deed. It is consolidated, encrypted, and turned into a single, indisputable source of truth for your entire life's journey."
              </p>
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-gold font-black uppercase text-[10px] tracking-[0.3em]">Institutional Grade Security</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserRecord | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'upload' | 'auth' | 'premium' | 'privacy' | 'guardian' | 'inheritance' | 'settings'>('landing');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState(DEFAULT_PROFILES[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPasswordPrompt, setAdminPasswordPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [adminAccessVerified, setAdminAccessVerified] = useState(false);

  // Check for secret admin path on mount
  useEffect(() => {
    const secretPath = import.meta.env.VITE_ADMIN_SECRET_PATH || '/=superhati';
    if (window.location.pathname === secretPath) {
      setAdminPasswordPrompt(true);
    }
  }, []);


  useEffect(() => {
    console.log("HATI: Auth listener initializing...");
    // Seed product tiers on app load (idempotent operation)
    seedProductTiers().catch(err => console.warn('Seed tiers warning:', err));
    
    // Robust Auth Listener
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      console.log("HATI: Auth state changed", user ? "User logged in" : "No user");
      try {
        if (user) {
          const impersonateUid = sessionStorage.getItem('hati_impersonate_uid');
          const targetUid = impersonateUid || user.uid;
          setCurrentUser(user);
          
          // Check admin status
          const tokenResult = await user.getIdTokenResult(true);
          setIsAdmin(tokenResult.claims.role === 'admin' || tokenResult.claims.role === 'super_admin');
          
          // HATI_SECURITY: Update signal on session load
          await updateDoc(doc(db, "users", targetUid), {
            lastActiveAt: serverTimestamp()
          }).catch(async (e) => {
            console.warn("Signal update failed - creating user doc:", e);
            // Create user doc if it doesn't exist
            return setDoc(doc(db, "users", targetUid), {
              email: user.email,
              name: user.displayName || 'User',
              createdAt: serverTimestamp(),
              lastActiveAt: serverTimestamp(),
              plan: 'free',
              webauthnEnabled: false
            }, { merge: true });
          });
          
          // Listen to relevant metadata
          const unsubMeta = onSnapshot(doc(db, "users", targetUid), (snapshot) => {
            if (snapshot.exists()) {
              setUserMetadata({ uid: snapshot.id, ...snapshot.data() } as UserRecord);
            }
          });

          // Listen to records
          const q = query(
            collection(db, "records"), 
            where("userId", "==", targetUid)
          );
          const recordsUnsub = onSnapshot(q, (snapshot) => {
            const recordsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MedicalRecord[];
            // Sort client-side to avoid composite index requirement
            recordsList.sort((a, b) => (b.createdAt as any)?.seconds - (a.createdAt as any)?.seconds);
            setRecords(recordsList);
          });

          // Check if should show admin dashboard
          if (adminAccessVerified && isAdmin) {
            setView('admin' as any);
          } else {
            setView('dashboard');
          }
        } else {
          setCurrentUser(null);
          setView('landing');
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    const handlePremiumNav = () => setView('premium');
    window.addEventListener('HATI_NAVIGATE_PREMIUM', handlePremiumNav);

    return () => {
      unsubAuth();
      window.removeEventListener('HATI_NAVIGATE_PREMIUM', handlePremiumNav);
    };
  }, [adminAccessVerified]);

  const handleAdminPasswordSubmit = () => {
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    const inputPassword = adminPassword.trim();
    
    console.log("🔐 Password check:");
    console.log("Expected:", correctPassword);
    console.log("Received:", inputPassword);
    console.log("Match:", inputPassword === correctPassword);
    
    if (inputPassword === correctPassword) {
      setAdminPasswordError("");
      setAdminPasswordPrompt(false);
      setAdminPassword("");
      setView('admin' as any);
    } else {
      setAdminPasswordError("Incorrect password. Access denied.");
      setAdminPassword("");
    }
  };


  const saveToVault = async (newRecord: Omit<MedicalRecord, 'id'>) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "records"), {
        ...newRecord,
        userId: currentUser.uid,
        createdAt: Date.now()
      });
      setView('dashboard');
    } catch (err) {
      console.error("Vault save error:", err);
    }
  };

  const decryptedRecords = useMemo(() => {
    return records.map(r => {
      try {
        const data = decrypt(r.encryptedPayload);
        if (!data) return null;
        return { ...data, id: r.id, profileId: r.profileId, createdAt: r.createdAt } as DecryptedMedicalRecord;
      } catch (e) { return null; }
    }).filter((r): r is DecryptedMedicalRecord => r !== null);
  }, [records]);

  const activeRecords = useMemo(() => {
    const profileRecords = decryptedRecords.filter(r => r.profileId === activeProfileId);
    if (!searchTerm) return profileRecords;
    const term = searchTerm.toLowerCase();
    return profileRecords.filter(r => 
      r.patient_name?.toLowerCase().includes(term) ||
      r.diagnosis?.some(d => d.toLowerCase().includes(term)) ||
      r.medications?.some(m => m.name.toLowerCase().includes(term))
    );
  }, [decryptedRecords, activeProfileId, searchTerm]);

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const generateTravelReport = () => {
    const doc = new jsPDF();
    const sorted = [...activeRecords].sort((a,b) => b.createdAt - a.createdAt);
    const latest = sorted[0];
    
    doc.setFillColor(10, 25, 47);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(28);
    doc.text("HATI", 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("OFFICIAL MEDICAL PASSPORT | CERTIFIED RECORD", 20, 32);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Record Holder: ${activeProfile?.name}`, 20, 55);
    doc.text(`Certified On: ${new Date().toLocaleDateString()}`, 140, 55);
    
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(20, 60, 190, 60);

    if (!latest) {
      doc.text("No official records found for this profile.", 20, 80);
    } else {
      doc.setFontSize(12);
      doc.setTextColor(141, 11, 11);
      doc.text("CURRENT HEALTH STATUS", 20, 75);
      doc.setTextColor(0, 0, 0);
      doc.text(`${latest.diagnosis.join(", ")}`, 20, 85);
      
      doc.setTextColor(10, 25, 47);
      doc.text("ACTIVE MEDICATIONS", 20, 105);
      doc.setTextColor(0, 0, 0);
      latest.medications.forEach((m, i) => {
        doc.text(`• ${m.name}: ${m.dosage}`, 25, 115 + (i * 8));
      });

      doc.setTextColor(141, 11, 11);
      doc.text("CERTIFIED WARNINGS", 20, 160);
      latest.warnings.forEach((w, i) => {
        doc.text(`! ${w}`, 25, 170 + (i * 8));
      });
      
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Verified by HATI Smart Scribe Engine. Encrypted under user-held keys.", 20, 280);
    }
    doc.save(`HATI_Certificate_${activeProfile?.name}.pdf`);
  };

  const handleImpersonationExit = () => {
    sessionStorage.removeItem('hati_impersonate_uid');
    window.location.reload();
  };

  // Admin password prompt modal
  if (adminPasswordPrompt && isAdmin) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="bg-navy p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-gold w-8 h-8" />
            </div>
            <h1 className="text-3xl font-serif font-black text-navy">Admin Access</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Enter password to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminPasswordSubmit()}
              className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-gold/50 font-bold transition-all"
              autoFocus
            />
            {adminPasswordError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold">
                {adminPasswordError}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAdminPasswordPrompt(false);
                setAdminPassword("");
                setAdminPasswordError("");
              }}
              className="flex-1 bg-slate-100 text-navy font-black py-4 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAdminPasswordSubmit}
              className="flex-1 bg-navy text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all"
            >
              Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    console.log("HATI: Still loading auth...");
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-gold w-16 h-16 rounded-full animate-ping opacity-25"></div>
          <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Vault Authority...</p>
        </div>
      </div>
    );
  }

  console.log("HATI: Auth loaded. Current user:", currentUser?.uid, "View:", view);

  if (!currentUser && view === 'landing') {
    console.log("HATI: Showing landing page");
    return <LandingPage onAuthClick={() => setView('auth')} />;
  }
  if (view === 'privacy') {
    console.log("HATI: Showing privacy policy");
    return <PrivacyPolicy />;
  }
  if (view === 'admin') {
    console.log("HATI: Showing admin dashboard");
    return <AdminDashboard onExit={() => setView('dashboard')} />;
  }
  if (!currentUser) {
    console.log("HATI: Showing auth component");
    return <Auth />;
  }

  console.log("HATI: Showing dashboard");

  const isPremium = userMetadata?.isPremium === true;
  const isImpersonating = !!sessionStorage.getItem('hati_impersonate_uid');

  return (
    <BiometricGuard>
      <div className="min-h-screen bg-slate-50 pb-24">
        <ConciergeButton />
        
        <nav className="bg-navy px-8 py-6 flex items-center justify-between sticky top-0 z-40 border-b-4 border-gold">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="bg-gold p-2 rounded-xl shadow-lg">
              <ShieldCheck className="text-navy w-6 h-6" />
            </div>
            <span className="text-2xl font-serif font-black tracking-tighter text-white">HATI</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('guardian')}
              className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
            >
               <UserCheck className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Guardian Protocol</span>
            </button>

            <button 
              onClick={() => setView('inheritance')}
              className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
            >
               <Heart className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Inheritance</span>
            </button>

            <button 
              onClick={() => setView('settings')}
              className="text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
            >
               <Settings className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Security</span>
            </button>

            {isImpersonating && (
              <div className="bg-rose-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-lg">
                <ShieldAlert className="w-4 h-4" /> Impersonation Active
                <button 
                  onClick={handleImpersonationExit}
                  className="ml-2 bg-white/20 hover:bg-white/40 px-2 py-1 rounded-md"
                >
                  Exit
                </button>
              </div>
            )}
            
            {isPremium && (
              <div className="flex items-center gap-1.5 bg-gold-premium px-4 py-2 rounded-full shadow-lg">
                <Crown className="w-3.5 h-3.5 text-navy" />
                <span className="text-[10px] font-black uppercase tracking-widest text-navy">Guardian Plan</span>
              </div>
            )}
            
            <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-black uppercase tracking-widest">
              <LogOut className="w-4 h-4 text-gold" /> Logout
            </button>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto pt-16 px-6">
          {view === 'premium' ? (
            <div className="space-y-12">
               <UpgradeButton userId={currentUser.uid} email={currentUser.email || ""} />
               <button onClick={() => setView('dashboard')} className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-navy transition-all">← Back to Records</button>
            </div>
          ) : view === 'upload' ? (
            <MedicalUploader profiles={profiles} onRecordSaved={(rec) => saveToVault(rec as any)} onCancel={() => setView('dashboard')} />
          ) : view === 'guardian' && userMetadata ? (
            <div className="space-y-12">
               <FeatureLock feature="guardian_protocol">
                 <GuardianSettings user={userMetadata} />
               </FeatureLock>
               <button onClick={() => setView('dashboard')} className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-navy transition-all">← Back to Records</button>
            </div>
          ) : view === 'inheritance' && userMetadata ? (
            <div className="space-y-12">
               <FeatureLock feature="inheritance_planning">
                 <InheritanceSettings user={userMetadata} />
               </FeatureLock>
               <button onClick={() => setView('dashboard')} className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-navy transition-all">← Back to Records</button>
            </div>
          ) : view === 'settings' && userMetadata ? (
            <div className="space-y-12">
               <FeatureLock feature="can_use_biometrics">
                 <WebAuthSettings user={userMetadata} />
               </FeatureLock>
               <button onClick={() => setView('dashboard')} className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-navy transition-all">← Back to Records</button>
            </div>
          ) : (
            <div className="space-y-12">
              {!isPremium && !isImpersonating && (
                <div onClick={() => setShowUpgradeModal(true)} className="bg-navy p-6 rounded-[32px] border-2 border-gold flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all shadow-xl">
                   <div className="flex items-center gap-4">
                      <div className="bg-gold p-3 rounded-2xl"><Crown className="text-navy w-6 h-6" /></div>
                      <div>
                        <p className="text-white font-black text-lg">Limited Access Mode</p>
                        <p className="text-gold/70 text-xs font-bold uppercase tracking-widest">Upgrade to Guardian Plan for Family Profiles & Guardian Protocol</p>
                      </div>
                   </div>
                   <ChevronRight className="text-gold w-8 h-8" />
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6">
                  <h1 className="text-5xl font-serif font-black text-navy tracking-tight">Official Record</h1>
                  <div className="flex flex-wrap items-center gap-4">
                    {profiles.map(p => (
                      <button key={p.id} onClick={() => setActiveProfileId(p.id)} className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all ${activeProfileId === p.id ? 'bg-navy border-gold text-gold' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4" /> {p.name}
                        </div>
                      </button>
                    ))}
                    {isPremium && (
                      <button 
                        onClick={() => {
                          const newName = prompt("Enter profile name:");
                          if (newName) {
                            const newProfile: Profile = {
                              id: `p-${Date.now()}`,
                              name: newName,
                              relation: 'Other'
                            };
                            setProfiles([...profiles, newProfile]);
                            setActiveProfileId(newProfile.id);
                          }
                        }}
                        className="w-11 h-11 bg-gold border-2 border-gold rounded-xl flex items-center justify-center text-navy hover:bg-yellow-400 transition-all font-bold shadow-lg"
                        title="Add new family profile"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button onClick={generateTravelReport} className="bg-white border-2 border-slate-100 hover:border-gold text-navy font-bold py-4 px-8 rounded-[24px] flex items-center gap-3 shadow-sm group text-sm transition-all">
                    <Download className="w-5 h-5 text-crimson" /> Generate Certificate
                  </button>
                  <button onClick={() => setView('upload')} className="bg-crimson hover:bg-red-800 text-white font-black py-4 px-10 rounded-[24px] shadow-2xl flex items-center gap-3 text-sm transition-all">
                    <Plus className="w-6 h-6 text-gold" /> Certify New Record
                  </button>
                </div>
              </div>

              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input type="text" placeholder="Search history..." className="w-full bg-white border-2 border-slate-100 rounded-[32px] py-4 pl-16 pr-6 shadow-sm focus:border-navy focus:border-2 outline-none text-base text-slate-900 placeholder-slate-400 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <VitalsChart records={activeRecords} />

              <div className="space-y-6">
                {activeRecords.length > 0 ? (
                  activeRecords.map((record) => (
                    <div key={record.id} className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 group relative overflow-hidden hover:border-navy/10 transition-all">
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-gold"></div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="bg-navy/5 p-4 rounded-3xl text-navy"><Calendar className="w-6 h-6" /></div>
                          <div>
                             <p className="text-sm font-black text-navy">{record.date}</p>
                             <p className="text-[10px] font-bold text-gold uppercase tracking-widest">HATI Certified: {record.document_type}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                          <h3 className="text-3xl font-serif font-black text-navy tracking-tight leading-tight">{record.diagnosis.join(' & ')}</h3>
                          <div className="flex flex-wrap gap-2">
                            {record.medications.map((m, i) => (
                              <div key={i} className="bg-navy/5 border border-navy/10 px-4 py-2 rounded-xl text-sm font-bold text-navy flex items-center gap-2">
                                <Pill className="w-4 h-4 text-gold" /> {m.name} <span className="text-slate-300">|</span> {m.dosage}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-32 bg-white rounded-[64px] border-2 border-dashed border-slate-200">
                    <h3 className="text-3xl font-serif font-black text-navy">No Registry Data</h3>
                    <button onClick={() => setView('upload')} className="mt-8 text-navy font-black border-b-2 border-gold pb-1">Register First Record</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        <footer className="mt-32 border-t border-slate-200 py-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={() => setView('privacy')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-navy transition-all"
            >
              Privacy Policy & DPA 2019
            </button>
            <div className="flex items-center gap-3 opacity-50">
              <ShieldCheck className="text-gold w-6 h-6" />
              <span className="text-xs font-black tracking-[0.4em] uppercase text-navy">HATI Registry Authority</span>
            </div>
          </div>
        </footer>
      </div>
      {showUpgradeModal && (
        <GuardianUpgrade 
          onClose={() => setShowUpgradeModal(false)} 
          onUpgradeClick={() => {
            // Navigate to premium page and close modal
            setView('premium');
            setShowUpgradeModal(false);
          }}
        />
      )}
    </BiometricGuard>
  );
};

const root = createRoot(document.getElementById('root')!);

try {
  root.render(<App />);
  console.log('HATI: React rendering successful');
  setTimeout(() => {
    const mainContent = document.querySelector('main');
    console.log('HATI: Main content element found:', mainContent?.offsetHeight, 'px tall');
    console.log('HATI: Document body style:', document.body.style.display, document.body.style.visibility);
    if (mainContent) {
      console.log('HATI: Main content display:', window.getComputedStyle(mainContent).display);
    }
  }, 1000);
} catch (error) {
  console.error('HATI: React render error:', error);
}