
import React, { useEffect, useState } from 'react';
// Fix: Use auth and onAuthStateChanged exported from local lib/firebase
import { auth, onAuthStateChanged } from '../lib/firebase';
import { ShieldAlert, Loader2 } from 'lucide-react';

/**
 * HATI AUTHORITY: Admin Guard
 * Strictly verifies the 'admin' custom claim before rendering sensitive UI.
 */
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtected(props: P) {
    const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log('ADMIN_AUTH: No user logged in');
          setStatus('denied');
          return;
        }

        console.log('ADMIN_AUTH: User logged in:', user.email);

        // Force refresh the token to get the latest custom claims
        const tokenResult = await user.getIdTokenResult(true);
        
        console.log('ADMIN_AUTH: Token claims:', tokenResult.claims);
        console.log('ADMIN_AUTH: User role:', tokenResult.claims.role);
        
        if (tokenResult.claims.role === 'admin' || tokenResult.claims.role === 'super_admin') {
          console.log('ADMIN_AUTH: Authorization GRANTED');
          setStatus('authorized');
        } else {
          console.log('ADMIN_AUTH: Authorization DENIED - missing admin role');
          setStatus('denied');
        }
      });

      return () => unsub();
    }, []);

    if (status === 'loading') {
      return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 text-gold animate-spin" />
          <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">Verifying Authority...</p>
        </div>
      );
    }

    if (status === 'denied') {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10 text-crimson" />
            </div>
            <h1 className="text-4xl font-serif font-black text-navy">404 - Registry Not Found</h1>
            <p className="text-slate-500 font-medium">You do not have the required security clearance to access the central authority terminal.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-block bg-navy text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95"
            >
              Return to Safety
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}