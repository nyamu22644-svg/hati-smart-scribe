
import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, FileText, Globe, UserCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-[60px] shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-navy p-12 border-b-4 border-gold text-white">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-gold w-8 h-8" />
            <span className="text-xl font-serif font-black tracking-tighter uppercase">HATI Registry</span>
          </div>
          <h1 className="text-5xl font-serif font-black mb-4 tracking-tight">Privacy Declaration</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Compliant with Kenya Data Protection Act 2019</p>
        </div>

        {/* Content */}
        <div className="p-16 prose prose-slate prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-black text-navy mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-gold" /> Zero-Knowledge Pledge
            </h2>
            <p className="text-slate-600 leading-relaxed">
              At HATI, we treat medical data as the "Title Deed" of the human body. Unlike traditional health apps, 
              <strong> we do not store your clinical data in a readable format on our servers.</strong> Every medical record
              is encrypted on your device using AES-256 military-grade encryption before it reaches the cloud.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-black text-navy mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-gold" /> Data Processing & AI
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Our "Smart Scribe" engine processes images strictly to extract metadata. Once extraction is complete and 
              you certify the entry, the original document image and text are sealed within your private vault. 
              <strong> We do not sell, lease, or trade your medical history with pharmaceutical companies or insurers.</strong>
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
              <h3 className="font-serif font-black text-navy text-xl mb-3">Your Rights (DPA 2019)</h3>
              <ul className="text-sm text-slate-500 space-y-2">
                <li>• Right to be informed of data collection</li>
                <li>• Right to access your personal data</li>
                <li>• Right to object to processing</li>
                <li>• Right to correction and deletion</li>
              </ul>
            </div>
            <div className="p-8 bg-navy text-white rounded-[40px] border border-gold/20">
              <h3 className="font-serif font-black text-gold text-xl mb-3">Data Deletion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You hold the master keys. If you choose to delete your HATI vault, the encrypted data is purged 
                permanently from our storage. Due to our encryption protocols, we cannot recover data once deleted.
              </p>
            </div>
          </div>

          <section className="border-t border-slate-100 pt-12 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Registry Contact</p>
            <p className="text-navy font-bold">legal@hati-registry.com</p>
            <p className="text-slate-400 text-[10px] mt-2 italic">Effective as of May 2024. Nairobi, Kenya.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
