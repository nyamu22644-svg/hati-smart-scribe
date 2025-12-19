
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  Chrome, 
  ShieldAlert, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
// Fix: Import auth utilities from local firebase lib to resolve external module export issues
import { auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from '../../lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Fix: Use modular function with auth instance
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message.includes('auth/invalid-credential') ? 'Invalid email or password.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // Fix: Use modular sign-in with popup
      await signInWithPopup(auth, provider);
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
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_var(--brand-gold)_1px,_transparent_0)] [background-size:40px_40px]"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-center">
          <div className="bg-gold p-4 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <ShieldCheck className="text-navy w-12 h-12" />
          </div>
          <h1 className="text-6xl font-serif font-black text-white tracking-tighter mb-4">HATI</h1>
          <p className="text-gold text-sm font-black uppercase tracking-[0.4em] mb-12">Registry Entrance</p>
          
          <div className="space-y-8 text-left">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-[32px] border border-white/10">
              <p className="text-xl text-slate-300 font-medium italic leading-relaxed">
                "The standard for private health records. A legacy built on indisputable security."
              </p>
              <p className="text-gold font-bold mt-4 uppercase text-[10px] tracking-widest">— Institutional Authority</p>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-navy bg-slate-800 flex items-center justify-center text-[10px] font-black">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Joined by 12,000+ Guardians</p>
            </div>
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
            <h2 className="text-4xl font-serif font-black text-navy tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Authenticate to access your certified records.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-gold transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="name@institution.com"
                  className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] outline-none focus:border-gold focus:ring-4 focus:ring-gold/5 transition-all text-lg font-bold placeholder:text-slate-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Password</label>
                <a href="#" className="text-[10px] font-black text-gold uppercase hover:text-navy transition-colors">Forgot Key?</a>
              </div>
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
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Access Vault <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Continue With</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border-2 border-slate-100 text-navy font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 hover:border-gold transition-all active:scale-[0.98] shadow-sm"
          >
            <Chrome className="w-5 h-5 text-gold" /> Institutional Google Account
          </button>

          <p className="text-center text-sm font-medium text-slate-500">
            Don't have a vault yet? <a href="/signup" className="text-gold font-black underline underline-offset-4 hover:text-navy transition-colors">Start Certification</a>
          </p>

          <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-3 opacity-50">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Lock className="w-3 h-3" /> End-to-End Encrypted Authority
            </div>
            <p className="text-[9px] text-slate-400 max-w-[200px] text-center leading-relaxed">
              HATI utilizes Zero-Knowledge AES-256 protocols. Your keys are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}