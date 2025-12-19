
import { useState, useEffect } from 'react';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { registerPasskey, loginWithPasskey } from '../lib/webauthn';
import { auth } from '../lib/firebase';
import { APP_CONFIG } from '../constants/appConfig';

/**
 * HATI BIOMETRIC AUTHORITY HOOK
 * Manages Passkey lifecycle and 'Instant Lock' background security protocols.
 */
export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isVerified, setIsVerified] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('hati_vault_verified') === 'true';
  });

  const setVerified = (val: boolean) => {
    setIsVerified(val);
    if (val) {
      sessionStorage.setItem('hati_vault_verified', 'true');
    } else {
      sessionStorage.removeItem('hati_vault_verified');
    }
  };

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());

    let lockTimer: any = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const currentlyVerified = sessionStorage.getItem('hati_vault_verified') === 'true';
        if (currentlyVerified) {
          // Use dynamic config for grace period
          lockTimer = setTimeout(() => {
            setVerified(false);
            console.debug("HATI_SECURITY: Vault auto-locked. Unauthorized background session detected.");
          }, APP_CONFIG.AUTO_LOCK_TIMEOUT_MS);
        }
      } else {
        if (lockTimer) {
          clearTimeout(lockTimer);
          lockTimer = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, []);

  const registerBiometrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await registerPasskey();
      return success;
    } catch (err: any) {
      const msg = err.message || "Passkey registration failed.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const authenticateUser = async (email?: string) => {
    const targetEmail = email || auth.currentUser?.email;
    if (!targetEmail) {
      throw new Error("Registry identity required.");
    }

    setLoading(true);
    setError(null);
    try {
      const success = await loginWithPasskey(targetEmail);
      if (success) {
        setVerified(true);
      }
      return success;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError("Vault entry cancelled by owner.");
      } else {
        setError(err.message || "Hardware authentication failed.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    loading,
    error,
    isVerified,
    setVerified,
    registerBiometrics,
    authenticateUser,
  };
};
