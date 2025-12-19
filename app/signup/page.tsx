
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Chrome, 
  ShieldAlert, 
  Loader2,
  CheckCircle2,
  User
} from 'lucide-react';
// Fix: Use modular auth functions exported from local lib/firebase
import { auth, db, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fix: Use modular user creation function with auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize User Authority Record
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        isPremium: false,
        plan: 'essential'
      });
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Fix: Use modular sign-in with popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'Registry User',
        email: user.email,
        createdAt: serverTimestamp(),
        isPremium: false,
        plan: 'essential'
      }, { merge: true });
      
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Column: Brand Identity */}
      <div className="hidden lg:flex bg-navy relative items-center justify-center p-12 overflow-hidden border-r-8 border-gold">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_var(--brand-gold)_1px,_transparent_0)] [background-size:40px_40px]"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="bg-gold p-4 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ShieldCheck className="text-navy w-12 h-12" />
          </div>
          <h1 className="text-6xl font-serif font-black text-white tracking-tighter mb-4">HATI</h1>
          <p className="text-gold text-sm font-black uppercase tracking-[0.4em] mb-12">Registry Initiation</p>
          
          <div className="space-y-6 text-left">
            {[
              { title: "Zero-Knowledge", desc: "Your clinical data is encrypted before it leaves your device." },
              { title: "AI-Verified", desc: "Institutional grade scanning for handwriting and interactions." },
              { title: "Indisputable", desc: "A permanent health record that remains in your control." }
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/5 backdrop-blur-sm p-5 rounded-[28px] border border-white/5">
                <div className="bg-gold/20 p-2 rounded-xl mt-1">
                  <CheckCircle2 className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-white font-black uppercase text-[10px] tracking-widest">{feature.title}</h4>
                  <p className="text-slate-400 text-sm font-medium mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Secure Form */}
      <div className="flex items-center justify-center p-8 md:p-16 lg:p-24 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md space-y-10">
          <div className="lg:hidden text-center mb-12">
             <div className="bg-navy p-3 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4 border-2 border-gold shadow-lg">
                <ShieldCheck className="text-gold w-8 h-8" />
             </div>
             <h2 className="text-3xl font-serif font-black text-navy">HATI Vault</h2>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-serif font-black text-navy tracking-tight">Create Identity</h2>
            <p className="text-slate-500 font-medium">Initiate your private medical certification legacy.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-lg font-bold placeholder:text-slate-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-lg font-bold placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-lg font-bold placeholder:text-slate-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-crimson/10 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-5 h-5 text-crimson flex-shrink-0" />
                <p className="text-xs font-bold text-crimson">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-navy text-gold font-black py-6 rounded-[24px] shadow-2xl shadow-navy/20 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Initiate Vault <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Continue With</span></div>
          </div>

          <button 
            onClick={handleGoogleSignup}
            className="w-full bg-white border-2 border-slate-100 text-navy font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 hover:border-gold transition-all active:scale-[0.98] shadow-sm"
          >
            <Chrome className="w-5 h-5 text-gold" /> Institutional Google Account
          </button>

          <p className="text-center text-sm font-medium text-slate-500">
            Already registered? <a href="/login" className="text-gold font-black underline underline-offset-4 hover:text-navy transition-colors">Access Entrance</a>
          </p>

          <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-3 opacity-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Lock className="w-3 h-3" /> Encrypted Registration
            </div>
            <p className="text-[9px] text-slate-400 max-w-[200px] text-center leading-relaxed">
              By initiating, you agree to the HATI Data Governance standards and AES-256 clinical protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}