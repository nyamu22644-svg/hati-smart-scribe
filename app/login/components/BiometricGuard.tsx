
import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Fingerprint, 
  Loader2, 
  ShieldAlert, 
  Cpu,
  Terminal,
  Wifi,
  Battery
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface BiometricGuardProps {
  children: React.ReactNode;
}

/**
 * HATI VAULT GATEWAY - SECURITY ENFORCED
 * High-end "Cyber-Security Fortress" aesthetic.
 * Protects clinical data behind a mandatory biometric re-authentication layer.
 */
export const BiometricGuard: React.FC<BiometricGuardProps> = ({ children }) => {
  const { 
    isSupported, 
    loading, 
    error, 
    isVerified, 
    authenticateUser 
  } = useBiometricAuth();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [isBiometricRequired, setIsBiometricRequired] = useState(false);

  console.log("BiometricGuard: Rendering. Auth:", auth.currentUser?.uid, "BiometricRequired:", isBiometricRequired);

  const handleUnlock = async () => {
    try {
      await authenticateUser();
      // isVerified state is updated internally by useBiometricAuth
    } catch (err) {
      console.error("Vault access denied by hardware authority.");
    }
  };

  // Check if biometric is required for this user (premium only)
  useEffect(() => {
    const checkBiometricRequirement = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // For free users, skip biometric requirement
          // Biometric is only for premium users with passkey enabled
          setIsBiometricRequired(false);
          console.log("BiometricGuard: Biometric NOT required for free user");
        } catch (err) {
          console.error('Error checking biometric requirement:', err);
          setIsBiometricRequired(false);
        }
      }
    };
    checkBiometricRequirement();
  }, [auth.currentUser]);

  useEffect(() => {
    const user = auth.currentUser;
    // Auto-trigger biometric prompt only if required AND supported
    if (user && !isVerified && isSupported && isBiometricRequired && !hasStarted) {
      setHasStarted(true);
      const timer = setTimeout(() => {
        handleUnlock();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSupported, isVerified, isBiometricRequired]);

  // Public views (landing/auth) bypass the biometric guard
  if (!auth.currentUser) {
    console.log("BiometricGuard: No current user, bypassing");
    return <>{children}</>;
  }

  // Free users or users without biometric requirement bypass the guard
  if (!isBiometricRequired) {
    console.log("BiometricGuard: Biometric not required, rendering children");
    return <>{children}</>;
  }

  // Vault content is unlocked
  if (isVerified) {
    console.log("BiometricGuard: Verified, rendering children");
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617] text-emerald-500 font-mono flex flex-col items-center justify-between p-8 overflow-hidden">
      {/* Dynamic Security Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
      </div>

      {/* Top Status Bar */}
      <div className="w-full max-w-lg flex justify-between items-center text-[10px] tracking-[0.2em] font-bold opacity-60 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" />
            <span>SECURE_LINK_ACTIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3" />
            <span>AES_256_ENGINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>99%_STABLE</span>
          <Battery className="w-4 h-4" />
        </div>
      </div>

      {/* Main Lock Interface */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-12 text-center">
        <div className="space-y-6">
          <div className="relative group">
            {/* Animated Pulsing Rings */}
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-[3s]"></div>
            <div className="absolute inset-[-20px] bg-emerald-500/5 rounded-full animate-pulse duration-[4s]"></div>
            
            <div className="relative bg-slate-900 border-2 border-emerald-500/30 w-32 h-32 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)] group-hover:border-emerald-500 transition-colors duration-500">
              <Lock className="w-14 h-14 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Registry Vault</h1>
            <div className="flex items-center justify-center gap-3 text-emerald-400/60">
              <Terminal className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">Status: Enforced_Lockdown</span>
            </div>
          </div>
        </div>

        {/* Biometric Trigger Area */}
        <div className="w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-10 rounded-[40px] border border-emerald-500/10 shadow-2xl relative">
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br"></div>

          <div className="space-y-4">
            <div className="text-[10px] text-emerald-400/40 font-black uppercase tracking-[0.4em] mb-6">Owner_Authentication</div>
            
            <button
              disabled={loading}
              onClick={handleUnlock}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-7 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-[0.97] flex flex-col items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-10 h-10 mb-1" />
                  <span className="text-sm tracking-[0.2em] uppercase">Authenticate Session</span>
                </>
              )}
            </button>
            
            <div className="pt-4 flex items-center justify-center gap-2 text-emerald-500/30 text-[9px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" />
              Verified_Access_Point: {auth.currentUser.email?.split('@')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 text-rose-500 bg-rose-500/5 px-6 py-4 rounded-xl border border-rose-500/20 animate-in slide-in-from-top-2 duration-300">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
          </div>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="w-full max-w-lg space-y-6 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => auth.signOut()} 
            className="text-emerald-500/40 hover:text-emerald-400 transition-colors text-[9px] font-black uppercase tracking-[0.5em] border-b border-emerald-500/20 pb-1"
          >
            Terminal_Sign_Out
          </button>
          
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="w-6 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500/40 animate-pulse`} style={{ animationDelay: `${i * 200}ms` }}></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-[8px] text-emerald-500/20 font-bold tracking-[0.3em] uppercase leading-relaxed">
            HATI_OFFICIAL_REGISTRY // DEVICE_ENCRYPTED_VAULT<br />
            AUTHORIZED_EYES_ONLY // SYSTEM_LOG_ID_{auth.currentUser.uid.slice(0,8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};
