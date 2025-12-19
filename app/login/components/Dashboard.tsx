
import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Activity, 
  Pill, 
  Share2, 
  ChevronRight,
  ShieldCheck,
  Search,
  ShieldAlert
} from 'lucide-react';
// Import DecryptedMedicalRecord to fix missing property errors on lines 30-31
import { MedicalRecord, DecryptedMedicalRecord, DocumentType } from '@/types';
import ShareQR from './ShareQR';

interface DashboardProps {
  // Use DecryptedMedicalRecord array to allow access to patient_name and diagnosis
  records: DecryptedMedicalRecord[];
  onUploadClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onUploadClick }) => {
  const [sharingRecord, setSharingRecord] = useState<MedicalRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records
    .filter(r => 
      // Fixed: Property access now valid because records are of type DecryptedMedicalRecord
      r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            My Medical Vault <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </h1>
          <p className="text-slate-500 mt-1">End-to-end encrypted health timeline.</p>
        </div>
        <button
          onClick={onUploadClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add New Record
        </button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search prescriptions, diagnoses, or clinics..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {records.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No records found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Your vault is currently empty. Start by uploading a medical document for AI analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl ${record.warnings.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {record.warnings.length > 0 ? <ShieldAlert className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    {record.diagnosis.join(' & ') || 'Medical Check-up'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span>{record.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5" /> {record.medications.length} Medications
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {record.warnings.length > 0 && (
                  <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> interaction risk
                  </div>
                )}
                <button 
                  onClick={() => setSharingRecord({
                    id: record.id,
                    profileId: record.profileId, // Added missing property to satisfy MedicalRecord interface
                    createdAt: record.createdAt,
                    encryptedPayload: "" // Temporary placeholder as ciphertext requires original record
                  })}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}

      {sharingRecord && (
        <ShareQR 
          record={sharingRecord} 
          onClose={() => setSharingRecord(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
