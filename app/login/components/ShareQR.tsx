
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check, X } from 'lucide-react';
import { encryptData, generateSharedKey } from '@/lib/security';
import { MedicalRecord } from '@/types';

interface ShareQRProps {
  record: MedicalRecord;
  onClose: () => void;
}

const ShareQR: React.FC<ShareQRProps> = ({ record, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [sharedKey] = useState(generateSharedKey());
  
  // Create a payload that includes the record ID and the temporary key
  // In a real app, this link would point to /share/[id]#[key]
  const encryptedPayload = encryptData(record, sharedKey);
  const shareUrl = `${window.location.origin}/#/share/${record.id}?key=${sharedKey}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Secure Share</h3>
          <p className="text-sm text-slate-500 mt-1">
            This QR code contains a temporary decryption key for this specific record.
          </p>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-center mb-6">
          <QRCodeSVG value={shareUrl} size={200} level="H" includeMargin={true} />
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 break-all border border-slate-200 relative">
            {shareUrl}
          </div>
          
          <button
            onClick={copyToClipboard}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" /> Copied Link
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copy Secure Link
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            Access expires when you delete the vault entry or rotate keys.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareQR;
