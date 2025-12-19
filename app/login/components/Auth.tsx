// Import auth functions
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock as LockIcon, ArrowRight, UserPlus, User } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '@/lib/webauthn';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-navy p-10 text-center relative">
          <div className="bg-gold p-3 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
            <ShieldCheck className="text-navy w-10 h-10" />
          </div>
          <h1 className="text-4xl font-serif font-black text-white tracking-tighter">HATI</h1>
          <p className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-2">Your Life. Certified.</p>
        </div>

        <div className="p-10">
          <div className="w-full max-w-md mx-auto backdrop-blur-md rounded-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold/50 font-bold transition-all"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold/50 font-bold transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold/50 font-bold transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-navy text-white font-black py-5 rounded-3xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? "Authenticating..." : isLogin ? "Access My Records" : "Create Official Vault"}
              {!loading && <ArrowRight className="w-5 h-5 text-gold" />}
            </button>
            </form>

            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-6 text-xs font-black text-slate-400 hover:text-navy uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {isLogin ? (
                <><UserPlus className="w-4 h-4" /> Create new identity</>
              ) : (
                "Already have an official record? Login"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};