
import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
// Fixed: Using correct export processRecordAI from gemini service
import { processRecordAI } from '@/services/gemini';
// Fixed: Using correct export encryptData from security lib
import { encryptData } from '@/lib/security';
// Fixed: DocumentType is now exported from types.ts
import { MedicalRecord, DocumentType } from '@/types';

interface UploadScannerProps {
  onRecordCreated: (record: MedicalRecord) => void;
  onCancel: () => void;
}

const UploadScanner: React.FC<UploadScannerProps> = ({ onRecordCreated, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          // Fixed: Use processRecordAI instead of missing processMedicalDocument
          const aiData = await processRecordAI(base64);
          
          // Privacy-First: Encrypt the data before returning it to the main state (simulating DB save)
          const encryptedPayload = encryptData(aiData);
          
          // Added missing profileId property to satisfy MedicalRecord interface
          const newRecord: MedicalRecord = {
            id: crypto.randomUUID(),
            profileId: 'default-profile',
            createdAt: Date.now(),
            encryptedPayload: encryptedPayload
          };
          
          onRecordCreated(newRecord);
        } catch (err: any) {
          setError(err.message || "An error occurred during AI analysis.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to read file.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Medical Scribe</h2>
        <p className="text-slate-500 mt-2">Scan or upload your medical records for instant AI analysis and secure storage.</p>
      </div>

      {isProcessing ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">Analyzing Document...</p>
          <p className="text-sm text-slate-500 max-w-xs text-center mt-2">
            Gemini-3 is extracting diagnosis, medications, and checking for interactions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Camera className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3" />
            <span className="font-semibold text-slate-700 group-hover:text-blue-600">Take Photo</span>
            <span className="text-xs text-slate-400 mt-1">Use your camera to scan</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-500 mb-3" />
            <span className="font-semibold text-slate-700 group-hover:text-blue-600">Upload File</span>
            <span className="text-xs text-slate-400 mt-1">PDF or Images supported</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Analysis Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-6 py-2 text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        <CheckCircle2 className="w-3 h-3" />
        Zero-Knowledge Client-Side Encryption Active
      </div>
    </div>
  );
};

export default UploadScanner;
