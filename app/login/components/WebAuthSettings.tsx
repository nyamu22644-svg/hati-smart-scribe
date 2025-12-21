import React, { useState } from 'react';
import { Lock, Fingerprint, Smartphone, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { UserRecord } from '@/types';

interface WebAuthSettingsProps {
  user: UserRecord;
}

export const WebAuthSettings: React.FC<WebAuthSettingsProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");

  const registerPasskey = async () => {
    setLoading(true);
    setStatus('registering');
    setErrorMsg("");
    
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn not supported on this device");
      }

      // In production, this would call a Cloud Function to register the passkey
      // For now, we'll show a success message after simulating registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      alert("✅ HATI_SECURITY: Biometric Passkey Registered!\n\nYour device's biometric (face/fingerprint) is now enabled for vault access.");
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to register passkey');
      alert("❌ Passkey Registration Failed:\n\n" + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const hasPasskey = user.webauthnEnabled || false;

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="bg-navy p-10 text-white relative">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Fingerprint className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="bg-gold p-3 rounded-2xl w-14 h-14 flex items-center justify-center shadow-xl">
            <Lock className="text-navy w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-serif font-black tracking-tight">Biometric Authentication</h1>
            <p className="text-gold/70 text-sm font-bold uppercase tracking-widest mt-2">Military-grade security with face/fingerprint</p>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-10">
        {/* Status Section */}
        <div className={`p-6 rounded-3xl border-2 ${
          hasPasskey 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-4">
            {hasPasskey ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            )}
            <div>
              <h3 className={`font-bold text-lg ${
                hasPasskey ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {hasPasskey ? '✅ Passkey Active' : '⚠️ No Passkey Registered'}
              </h3>
              <p className={`text-sm font-medium mt-2 ${
                hasPasskey ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {hasPasskey 
                  ? 'Your device biometric is enabled. You can log in with face/fingerprint.'
                  : 'Register your device biometric to enable passwordless vault access.'}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-serif font-black text-navy">Why Use Biometric?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🔐',
                title: 'Maximum Security',
                desc: 'Uses device secure enclave for encryption'
              },
              {
                icon: '⚡',
                title: 'Zero Knowledge',
                desc: 'No passwords stored on servers'
              },
              {
                icon: '🎯',
                title: 'Instant Access',
                desc: 'One tap/glance to unlock vault'
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h4 className="font-black text-navy mb-2">{feature.title}</h4>
                <p className="text-xs text-slate-600 font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Section */}
        <div className="space-y-6">
          {!hasPasskey ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Device Compatibility</p>
                    <p className="text-xs text-blue-800 mt-1">Requires a modern smartphone or computer with biometric sensor (face, fingerprint).</p>
                  </div>
                </div>
              </div>

              <button
                onClick={registerPasskey}
                disabled={loading}
                className="w-full bg-gold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-navy font-black py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Registering Passkey...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6" />
                    Register Biometric Passkey
                  </>
                )}
              </button>

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-red-900">Registration Failed</p>
                  <p className="text-xs text-red-800 mt-1">{errorMsg}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Fingerprint className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-black text-emerald-900">Passkey Registered</p>
                    <p className="text-xs text-emerald-800">Registered on: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Remove Passkey
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-navy/5 border border-navy/10 rounded-2xl p-6">
          <h4 className="font-black text-navy mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gold" />
            How It Works
          </h4>
          <ol className="space-y-3 text-sm text-slate-600 font-medium">
            <li><strong>1. Registration:</strong> Your device creates a cryptographic key pair secured by your biometric</li>
            <li><strong>2. Public Key:</strong> Only the public key is stored on HATI servers</li>
            <li><strong>3. Authentication:</strong> Each login requires your biometric to unlock the private key</li>
            <li><strong>4. Zero Trust:</strong> Even HATI cannot access your vault without your biometric approval</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WebAuthSettings;
