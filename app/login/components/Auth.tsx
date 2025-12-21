// Import auth functions
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock as LockIcon, ArrowRight, UserPlus, User, Fingerprint, Loader2, ArrowLeft } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '@/lib/webauthn';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usePasskey, setUsePasskey] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn not supported on this device");
      }

      // Request biometric authentication using WebAuthn API
      // This will trigger the device's native biometric UI
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: 'preferred' // Request biometric/PIN verification
        },
        mediation: 'optional'
      }).catch((err) => {
        if (err.name === 'NotAllowedError') {
          throw new Error("Biometric authentication was cancelled or failed");
        }
        if (err.name === 'NotSupportedError') {
          throw new Error("WebAuthn not supported on this device or no passkeys registered");
        }
        throw err;
      });

      if (!assertion) {
        throw new Error("Biometric authentication was cancelled");
      }

      // After biometric succeeds, get the stored email from Firestore
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('webauthnEnabled', '==', true));
      const querySnapshot = await getDocs(q);
      
      let userEmail = '';
      let userId = '';
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.webauthnEmail) {
          userEmail = userData.webauthnEmail;
          userId = doc.id;
        }
      });

      if (!userEmail || !userId) {
        throw new Error("No biometric email found. Please register a biometric first.");
      }

      // Retrieve stored password from localStorage
      const storedCreds = localStorage.getItem(`HATI_BIOMETRIC_CREDS_${userId}`);
      if (!storedCreds) {
        throw new Error("Biometric credentials not found. Please register again.");
      }

      const { password } = JSON.parse(storedCreds);
      
      // Sign in with email and stored password
      await signInWithEmailAndPassword(auth, userEmail, password);
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Biometric authentication failed');
      console.error('WebAuthn login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordStatus('error');
      setForgotPasswordMessage('Please enter your email address');
      return;
    }

    setForgotPasswordStatus('loading');
    setForgotPasswordMessage('');

    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setForgotPasswordStatus('success');
      setForgotPasswordMessage('Password reset link sent to your email. Check your inbox!');
      setForgotPasswordEmail('');
      
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordStatus('idle');
        setForgotPasswordMessage('');
      }, 3000);
    } catch (error: any) {
      setForgotPasswordStatus('error');
      setForgotPasswordMessage(error.message || 'Failed to send reset email');
    }
  };

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
            {usePasskey ? (
              <div className="space-y-6">
                <div className="text-center">
                  <Fingerprint className="w-12 h-12 text-gold mx-auto mb-4" />
                  <h2 className="text-2xl font-black text-navy mb-2">Biometric Login</h2>
                  <p className="text-sm text-slate-600">Use your face or fingerprint to access your vault</p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePasskeyLogin}
                  disabled={loading}
                  className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy font-black py-5 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning Biometric...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5" />
                      Authenticate with Biometric
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setUsePasskey(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full text-xs font-black text-slate-400 hover:text-navy uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  ← Back to Email Login
                </button>
              </div>
            ) : (
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

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="w-full text-xs font-black text-slate-400 hover:text-gold uppercase tracking-widest transition-colors"
                >
                  Forgot Password?
                </button>
              )}

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setUsePasskey(true)}
                  className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-navy font-bold py-4 rounded-3xl transition-all flex items-center justify-center gap-2"
                >
                  <Fingerprint className="w-5 h-5" />
                  Login with Biometric
                </button>
              )}
              </form>
            )}

            {!usePasskey && (
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
            )}

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[5000] p-4">
                <div className="bg-white rounded-[40px] max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="bg-navy p-8 text-center">
                    <div className="bg-gold p-3 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Mail className="text-navy w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-serif font-black text-white">Reset Password</h2>
                    <p className="text-gold/70 text-xs font-bold uppercase tracking-widest mt-2">
                      Enter your email to receive reset link
                    </p>
                  </div>

                  <div className="p-8 space-y-6">
                    {forgotPasswordStatus !== 'idle' && (
                      <div
                        className={`p-4 rounded-xl text-sm font-bold flex items-start gap-3 ${
                          forgotPasswordStatus === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {forgotPasswordStatus === 'success' ? (
                          <span>✓</span>
                        ) : (
                          <span>!</span>
                        )}
                        {forgotPasswordMessage}
                      </div>
                    )}

                    {forgotPasswordStatus !== 'success' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="email"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              disabled={forgotPasswordStatus === 'loading'}
                              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-gold/50 font-bold disabled:opacity-50"
                              placeholder="name@example.com"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleForgotPassword}
                          disabled={forgotPasswordStatus === 'loading' || !forgotPasswordEmail.trim()}
                          className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy font-black py-4 rounded-3xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          {forgotPasswordStatus === 'loading' ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-5 h-5" />
                              Send Reset Link
                            </>
                          )}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordStatus('idle');
                        setForgotPasswordMessage('');
                        setForgotPasswordEmail('');
                      }}
                      disabled={forgotPasswordStatus === 'loading'}
                      className="w-full text-slate-400 hover:text-navy font-bold py-3 uppercase tracking-widest text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};