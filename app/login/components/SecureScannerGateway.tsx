import React, { useState } from 'react';
import { SecureScanner } from './SecureScanner';
import { FeatureLock } from './FeatureLock';
import { usePermission } from '@/hooks/usePermission';
import { Camera } from 'lucide-react';

// Placeholder component that will be shown when feature is locked
const CameraPlaceholder = () => <div />

interface SecureScannerGatewayProps {
  onPDFGenerated?: (pdfBlob: Blob, fileSize: number) => void;
}

/**
 * Premium-gated component that wraps SecureScanner with FeatureLock
 * Only Guardian/Pro users can access the secure camera feature
 */
export const SecureScannerGateway: React.FC<SecureScannerGatewayProps> = ({ onPDFGenerated }) => {
  const [showCamera, setShowCamera] = useState(false);
  const { allowed } = usePermission('secure_camera_mode');

  // Check if user has access to secure_camera_mode feature
  const canAccessCamera = allowed;

  // If camera is already open, show it directly (no need to re-check)
  if (showCamera) {
    return (
      <SecureScanner
        onClose={() => setShowCamera(false)}
        onPDFGenerated={(pdfBlob, fileSize) => {
          if (onPDFGenerated) {
            onPDFGenerated(pdfBlob, fileSize);
          }
          // Camera will auto-close after success
        }}
      />
    );
  }

  // If user doesn't have access, show the feature lock with upgrade card
  if (!canAccessCamera) {
    return (
      <FeatureLock
        feature="secure_camera_mode"
        children={<CameraPlaceholder />}
      />
    );
  }

  // User has access, show the camera launch button
  return (
    <div className="space-y-6">
      {/* Feature Card */}
      <div className="bg-gradient-to-br from-gold/10 to-transparent border-2 border-gold rounded-[32px] p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-serif font-black text-navy flex items-center gap-3">
              <Camera className="w-8 h-8 text-gold" />
              Secure Document Scanner
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Capture and encrypt medical documents instantly
            </p>
          </div>
        </div>

        {/* Feature Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: '📸',
              title: 'Batch Scanning',
              description: 'Capture multiple pages in one session'
            },
            {
              icon: '🔒',
              title: 'Privacy First',
              description: 'Photos stay in memory until you confirm'
            },
            {
              icon: '📄',
              title: 'Smart PDF',
              description: 'Auto-stitch photos into searchable PDFs'
            }
          ].map((benefit, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 space-y-2 border border-slate-100">
              <div className="text-2xl">{benefit.icon}</div>
              <p className="font-bold text-navy text-sm">{benefit.title}</p>
              <p className="text-xs text-slate-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Launch Button */}
        <button
          onClick={() => setShowCamera(true)}
          className="w-full bg-gradient-to-r from-navy to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold py-4 rounded-[24px] transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
        >
          <Camera className="w-6 h-6" />
          Launch Secure Scanner
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-4">
        <h3 className="text-lg font-serif font-black text-navy">How It Works</h3>
        <ol className="space-y-3">
          {[
            'Position your document in the frame',
            'Tap the gold button to capture each page',
            'Review thumbnails and delete any blurry photos',
            'Tap "Finish & Encrypt" to create a PDF',
            'PDF is ready to upload or save to your vault'
          ].map((step, idx) => (
            <li key={idx} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gold text-navy rounded-full flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-slate-700 font-medium pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SecureScannerGateway;
