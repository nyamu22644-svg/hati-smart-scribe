
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  FileSearch, 
  UserCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileText,
  Pill,
  Activity,
  ArrowLeft,
  Info
} from 'lucide-react';
import { processRecordAI } from '../services/gemini';
import { encrypt } from '../lib/security';
import { MedicalRecord, Profile, MedicalRecordData } from '../types';

interface MedicalUploaderProps {
  profiles: Profile[];
  onRecordSaved: (record: Omit<MedicalRecord, 'id'>) => void;
  onCancel: () => void;
}

type Step = 'CONSENT' | 'CAPTURE' | 'PROCESSING' | 'VERIFY';

const ScribeDisclaimer = () => (
  <div className="bg-navy border-l-4 border-gold p-4 my-6 rounded-xl animate-in fade-in slide-in-from-top-2 duration-500">
    <div className="flex">
      <div className="flex-shrink-0">
        <Info className="h-5 w-5 text-gold" />
      </div>
      <div className="ml-3">
        <p className="text-xs text-white/80 leading-relaxed">
          <strong className="font-black text-gold">HATI Smart Scribe:</strong> This record was extracted by our automated registry engine. 
          <span className="font-bold"> Please verify the details</span> against your physical Hati document. 
          The HATI authority does not provide medical advice.
        </p>
      </div>
    </div>
  </div>
);

const MedicalUploader: React.FC<MedicalUploaderProps> = ({ profiles, onRecordSaved, onCancel }) => {
  const [step, setStep] = useState<Step>('CONSENT');
  const [consentGiven, setConsentGiven] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0]?.id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<MedicalRecordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      startAIScribe(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startAIScribe = async (base64: string) => {
    setStep('PROCESSING');
    setError(null);
    try {
      const data = await processRecordAI(base64);
      setExtractedData(data);
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
      setStep('CAPTURE');
    }
  };

  const handleFinalSave = () => {
    if (!extractedData) return;
    const encryptedPayload = encrypt(extractedData);
    const newRecord: Omit<MedicalRecord, 'id'> = {
      profileId: selectedProfileId,
      createdAt: Date.now(),
      encryptedPayload: encryptedPayload
    };
    onRecordSaved(newRecord);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-navy p-8 text-white flex items-center justify-between border-b-4 border-gold">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-gold w-8 h-8" />
          <div>
            <h2 className="text-2xl font-serif font-black">HATI Scribe</h2>
            <p className="text-gold/60 text-[10px] font-black uppercase tracking-widest">Official Registration Engine</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="p-10">
        {step === 'CONSENT' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <h3 className="text-3xl font-serif font-black text-navy mb-2">Record Authorization</h3>
              <p className="text-slate-500 font-medium">Verify official profile ownership before digitization.</p>
            </div>
            
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Registry Profile</label>
              <div className="flex flex-wrap gap-3">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border-2 transition-all ${selectedProfileId === p.id ? 'bg-navy border-gold text-gold shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-navy/20'}`}
                  >
                    <UserCircle className="w-5 h-5" /> {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1 relative">
                  <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={consentGiven} 
                    onChange={e => setConsentGiven(e.target.checked)} 
                  />
                  <div className="w-7 h-7 border-2 border-slate-200 rounded-lg peer-checked:bg-navy peer-checked:border-gold transition-all"></div>
                  <CheckCircle2 className="absolute top-1 left-1 w-5 h-5 text-gold scale-0 peer-checked:scale-100 transition-transform" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black text-navy group-hover:text-crimson transition-colors">I verify this Hati for official registry</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    I authorize HATI's Smart Scribe to extract my clinical data. I acknowledge that I am responsible for final <span className="text-navy font-bold underline">Certification of Accuracy</span>.
                  </p>
                </div>
              </label>
            </div>

            <button
              disabled={!consentGiven}
              onClick={() => setStep('CAPTURE')}
              className="w-full bg-navy hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-gold font-black py-6 rounded-3xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-lg"
            >
              Start Official Scan <ChevronRight className="w-5 h-5 text-gold" />
            </button>
          </div>
        )}

        {step === 'CAPTURE' && (
          <div className="text-center py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-4 border-dashed border-slate-100 rounded-[60px] p-24 hover:border-gold hover:bg-navy/5 transition-all"
            >
              <div className="bg-navy w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 shadow-2xl shadow-navy/20 transition-transform">
                <Camera className="w-14 h-14 text-gold" />
              </div>
              <h3 className="text-4xl font-serif font-black text-navy">Digitize Hati</h3>
              <p className="text-slate-500 mt-2 text-lg font-medium">Capture physical clinical document</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            {error && (
              <div className="flex items-center justify-center gap-3 p-6 bg-rose-50 text-crimson rounded-3xl text-sm font-bold border border-crimson/10">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 rounded-full animate-ping opacity-25"></div>
              <div className="bg-navy w-32 h-32 rounded-full flex items-center justify-center relative shadow-inner">
                <Sparkles className="w-16 h-16 text-gold animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-serif font-black text-navy tracking-tight">HATI Register Scanning...</h3>
              <p className="text-slate-500 mt-3 max-w-sm mx-auto font-medium text-lg leading-relaxed">
                Our secure scribe is extracting metadata and certifying clinical identifiers.
              </p>
            </div>
          </div>
        )}

        {step === 'VERIFY' && extractedData && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-3xl font-serif font-black text-navy tracking-tight">Certification Step</h3>
              <div className="bg-gold text-navy px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">HATI Authority Review</div>
            </div>
            
            <ScribeDisclaimer />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source Hati Document</span>
                </div>
                <div className="bg-slate-100 rounded-[40px] overflow-hidden border border-slate-200 h-[500px] shadow-inner group">
                  <img src={imagePreview!} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt="Scan preview" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Entry Draft</span>
                   <span className="bg-gold/10 text-navy px-3 py-1 rounded-xl text-[10px] font-bold">Edit to match source</span>
                </div>
                
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-gold transition-all">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Patient Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-transparent font-bold text-navy outline-none text-lg" 
                        value={extractedData.patient_name} 
                        onChange={e => setExtractedData({...extractedData, patient_name: e.target.value})}
                      />
                    </div>
                    <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-gold transition-all">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entry Date</label>
                      <input 
                        type="date" 
                        className="w-full bg-transparent font-bold text-navy outline-none text-lg" 
                        value={extractedData.date} 
                        onChange={e => setExtractedData({...extractedData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-gold transition-all">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Clinical Assessment</label>
                    <textarea 
                      className="w-full bg-transparent font-bold text-navy outline-none h-24 resize-none text-lg leading-snug" 
                      value={extractedData.diagnosis.join(', ')} 
                      onChange={e => setExtractedData({...extractedData, diagnosis: e.target.value.split(', ')})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-5 bg-navy/5 rounded-[24px] border border-navy/10 focus-within:ring-2 focus-within:ring-gold transition-all">
                       <label className="text-[10px] font-black text-gold uppercase tracking-widest block mb-1">BP (Systolic)</label>
                       <input 
                         type="number" 
                         className="w-full bg-transparent font-black text-navy outline-none text-2xl" 
                         placeholder="--"
                         value={extractedData.vitals.systolic || ''} 
                         onChange={e => setExtractedData({...extractedData, vitals: {...extractedData.vitals, systolic: parseInt(e.target.value)}})}
                       />
                     </div>
                     <div className="p-5 bg-navy/5 rounded-[24px] border border-navy/10 focus-within:ring-2 focus-within:ring-gold transition-all">
                       <label className="text-[10px] font-black text-gold uppercase tracking-widest block mb-1">Glucose</label>
                       <input 
                         type="number" 
                         className="w-full bg-transparent font-black text-navy outline-none text-2xl" 
                         placeholder="--"
                         value={extractedData.vitals.glucose || ''} 
                         onChange={e => setExtractedData({...extractedData, vitals: {...extractedData.vitals, glucose: parseInt(e.target.value)}})}
                       />
                     </div>
                  </div>

                  {extractedData.warnings.length > 0 && (
                    <div className="p-6 bg-rose-50 rounded-[32px] border border-crimson/10 space-y-3">
                      <label className="text-[10px] font-black text-crimson uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Interaction Alerts
                      </label>
                      {extractedData.warnings.map((w, i) => (
                        <p key={i} className="text-sm font-bold text-crimson leading-tight">• {w}</p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleFinalSave}
                  className="w-full bg-navy hover:bg-slate-800 text-gold font-black py-6 rounded-[32px] shadow-2xl shadow-navy/20 flex items-center justify-center gap-4 transition-all active:scale-95 text-lg"
                >
                  <Lock className="w-6 h-6" /> Certify & Seal to HATI Registry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalUploader;
