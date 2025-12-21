import React, { useState, useRef } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Lock, 
  UserCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Info,
  Zap,
  Download,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import { processRecordAI } from '@/services/gemini';
import { encrypt } from '@/lib/security';
import { SecureScannerGateway } from './SecureScannerGateway';
import { MedicalRecord, Profile, MedicalRecordData } from '../../types';

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
  const [showSecureScanner, setShowSecureScanner] = useState(false);
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
      setError(err.message || "Failed to analyze document.");
      setStep('CAPTURE');
    }
  };

  // Handle PDF from SecureScanner
  const handlePDFGenerated = async (pdfBlob: Blob, fileSize: number) => {
    // Convert PDF blob to base64 for processing
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64); // Store PDF as preview
      startAIScribe(base64);
      setShowSecureScanner(false);
    };
    reader.readAsDataURL(pdfBlob);
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

  const generatePDF = async () => {
    if (!extractedData) return;
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('HATI Medical Record Report', margin, yPosition);
      yPosition += 8;

      // Subtitle
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('Encrypted Medical Registry System', margin, yPosition);
      yPosition += 10;

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Helper function to check if new page is needed
      const checkNewPage = (lines: number = 1) => {
        if (yPosition + lines * 7 > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // Patient Information
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Information', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${extractedData.patient_name}`, margin + 3, yPosition);
      yPosition += 6;
      doc.text(`Record Date: ${extractedData.date}`, margin + 3, yPosition);
      yPosition += 10;

      // Clinical Assessment
      checkNewPage(3);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Clinical Assessment', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const diagnosisLines = doc.splitTextToSize(extractedData.diagnosis.join(', '), maxWidth - 3);
      doc.text(diagnosisLines, margin + 3, yPosition);
      yPosition += diagnosisLines.length * 6 + 4;

      // Vital Signs
      checkNewPage(5);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Vital Signs', margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Blood Pressure: ${extractedData.vitals.systolic}/${extractedData.vitals.diastolic} mmHg`, margin + 3, yPosition);
      yPosition += 6;
      doc.text(`Heart Rate: ${extractedData.vitals.heartRate} bpm`, margin + 3, yPosition);
      yPosition += 6;
      doc.text(`Temperature: ${extractedData.vitals.temperature}°C`, margin + 3, yPosition);
      yPosition += 6;
      doc.text(`Glucose Level: ${extractedData.vitals.glucose} mg/dL`, margin + 3, yPosition);
      yPosition += 10;

      // Medications
      if (extractedData.medications.length > 0) {
        checkNewPage(3);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Medications', margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        extractedData.medications.forEach(med => {
          doc.text(`• ${med.name} - ${med.dosage}`, margin + 3, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      }

      // Allergies
      if (extractedData.allergies.length > 0) {
        checkNewPage(3);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 0, 0);
        doc.text('⚠️  ALLERGIES (CRITICAL)', margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 0, 0);
        extractedData.allergies.forEach(allergy => {
          doc.text(`• ${allergy}`, margin + 3, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      }

      // Clinical Alerts
      if (extractedData.warnings.length > 0) {
        checkNewPage(3);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(200, 120, 0);
        doc.text('Clinical Alerts', margin, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        extractedData.warnings.forEach(warning => {
          const warningLines = doc.splitTextToSize(`⚠️  ${warning}`, maxWidth - 3);
          doc.text(warningLines, margin + 3, yPosition);
          yPosition += warningLines.length * 6 + 2;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text('This document is encrypted and intended for medical purposes only.', margin, pageHeight - 15);
      doc.text(`Generated: ${new Date().toLocaleString()} | HATI Medical Registry System`, margin, pageHeight - 10);

      // Download
      doc.save(`medical-record-${extractedData.date}.pdf`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
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

        {step === 'CAPTURE' && !showSecureScanner && (
          <div className="text-center py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-6">
              {/* Secure Scanner Option */}
              <button
                onClick={() => setShowSecureScanner(true)}
                className="w-full group border-4 border-dashed border-gold/30 rounded-[40px] p-10 hover:border-gold hover:bg-gold/5 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-gold to-yellow-400 w-20 h-20 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-gold/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-10 h-10 text-navy" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-serif font-black text-navy">Secure Scanner (Guardian)</h3>
                    <p className="text-slate-600 mt-2 text-sm font-medium">Batch scan multiple pages and auto-stitch into encrypted PDF</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-gold/10 text-navy px-2 py-1 rounded text-[10px] font-bold uppercase">Premium</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Privacy First</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gold mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* File Upload Option */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer border-4 border-dashed border-slate-100 rounded-[40px] p-10 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-navy w-20 h-20 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-navy/20 group-hover:scale-110 transition-transform">
                    <Camera className="w-10 h-10 text-gold" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-serif font-black text-navy">Simple Upload</h3>
                    <p className="text-slate-600 mt-2 text-sm font-medium">Upload a single photo or PDF from your gallery</p>
                    <p className="text-slate-500 mt-2 text-[10px] font-medium">Works on all plans</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 mt-1 group-hover:translate-x-1 transition-transform" />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-3 p-6 bg-rose-50 text-crimson rounded-3xl text-sm font-bold border border-crimson/10">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}
          </div>
        )}

        {/* Secure Scanner Full Screen */}
        {showSecureScanner && (
          <SecureScannerGateway onPDFGenerated={handlePDFGenerated} />
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
                <button
                  onClick={generatePDF}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black py-6 rounded-[32px] shadow-lg shadow-emerald-100/50 flex items-center justify-center gap-4 transition-all active:scale-95 text-lg border-2 border-emerald-200"
                >
                  <Download className="w-6 h-6" /> Download as PDF Report
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