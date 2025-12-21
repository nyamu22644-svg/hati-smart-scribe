
import React, { useState, useEffect } from 'react';
import { Crown, Zap, RefreshCw } from 'lucide-react';
import { FeatureKey } from '@/types';
import { usePermission } from '@/hooks/usePermission';
import { FeaturePaywall } from './FeaturePaywall';

interface FeatureLockProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * HATI FEATURE GATEKEEPER
 * Wraps premium functionality in a "Frosted Paywall" UI.
 * Now triggers the dynamic FeaturePaywall modal on click.
 */
export const FeatureLock: React.FC<FeatureLockProps> = ({ feature, children, fallback }) => {
  const { allowed, loading } = usePermission(feature);
  const [showModal, setShowModal] = useState(false);
  const [permissionRefresh, setPermissionRefresh] = useState(0);
  
  // Re-check permissions when user returns from payment
  useEffect(() => {
    if (showModal === false && permissionRefresh > 0) {
      // Permissions have been refreshed, component will re-render with new state
    }
  }, [showModal, permissionRefresh]);

  if (loading) return null;

  if (allowed) return <>{children}</>;

  // Show children with unlock option if not allowed
  // This allows viewing the content while prompting to unlock

  if (fallback) return <>{fallback}</>;

  const handleSubscribe = (planId: string) => {
    // This would typically trigger the IntaSend payment flow
    console.log(`HATI_AUTHORITY: Initiating subscription for ${planId}`);
    window.dispatchEvent(new CustomEvent('HATI_NAVIGATE_PREMIUM'));
    // Don't close modal yet, wait for payment callback
  };

  const handlePaymentSuccess = () => {
    // Payment was successful, close modal and trigger permission refresh
    setShowModal(false);
    setPermissionRefresh(prev => prev + 1);
    // Show a loading state while permissions refresh
    setTimeout(() => {
      window.location.reload(); // Refresh to get updated permissions
    }, 500);
  };

  const getLockContext = () => {
    switch (feature) {
      case 'can_use_biometrics':
        return { title: "Hardware Lockout", subtitle: "Protect your clinical history with local biometric sensors (FaceID/Fingerprint)." };
      case 'family_profiles':
        return { title: "Family Registry", subtitle: "Consolidate health histories for your children and parents into a single secure vault." };
      case 'max_vaults':
        return { title: "Unlimited Vaults", subtitle: "Create multiple encrypted medical containers for different needs." };
      case 'secure_camera_mode':
        return { title: "Secure Document Scanner", subtitle: "Scan, batch, and encrypt medical documents into searchable PDFs instantly." };
      default:
        return { title: "Guardian Feature", subtitle: "Unlock this clinical tool with a HATI Guardian subscription." };
    }
  };

  const context = getLockContext();

  return (
    <div className="relative group">
      {/* Blurred Content Placeholder */}
      <div className="filter blur-md grayscale opacity-30 pointer-events-none select-none">
        {children}
      </div>

      {/* Inline Paywall Trigger */}
      <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
        <div className="max-w-sm w-full bg-navy/90 backdrop-blur-xl border-2 border-gold rounded-[40px] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-all group-hover:scale-[1.02]">
          <div className="bg-gold p-4 rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Crown className="text-navy w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-serif font-black text-white mb-3">Guardian Feature</h3>
          <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
            {context.title} is exclusive to HATI Guardians.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full bg-gold hover:bg-amber-400 text-navy font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
            >
              Unlock Now <Zap className="w-4 h-4 fill-navy" />
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Paywall Modal */}
      {showModal && (
        <FeaturePaywall 
          title={context.title}
          subtitle={context.subtitle}
          onClose={() => setShowModal(false)}
          onSubscribe={handleSubscribe}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
