import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Sparkles, Heart, Pill, Activity, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MedicalRecord, MedicalRecordData } from '@/types';
import { decrypt } from '@/lib/security';

interface HealthInsightsProps {
  records: MedicalRecord[];
  userName?: string;
}

interface Insight {
  category: 'risk' | 'positive' | 'action';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const HealthInsights: React.FC<HealthInsightsProps> = ({ records, userName = 'User' }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (records.length > 0) {
      generateInsights();
    }
  }, [records]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      // Decrypt and aggregate medical data
      const decryptedRecords = records
        .map(r => {
          try {
            const data = decrypt(r.encryptedPayload);
            return data as MedicalRecordData;
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean) as MedicalRecordData[];

      if (decryptedRecords.length === 0) {
        setInsights([
          {
            category: 'action',
            title: 'Start Your Health Journey',
            description: 'Upload your first medical record to receive personalized health insights',
            icon: <Activity className="w-5 h-5" />
          }
        ]);
        return;
      }

      // Use Gemini AI to generate insights
      const ai = new GoogleGenerativeAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
      const model = ai.getGenerativeModel({ model: 'gemini-pro' });

      const medicalSummary = decryptedRecords.map(r => `
        Date: ${r.date}
        Diagnoses: ${r.diagnosis?.join(', ') || 'None'}
        Medications: ${r.medications?.map(m => `${m.name} ${m.dosage}`).join(', ') || 'None'}
        Vitals: BP=${r.vitals?.systolic}/${r.vitals?.diastolic}, HR=${r.vitals?.heartRate}
        Allergies: ${r.allergies?.join(', ') || 'None'}
      `).join('\n---\n');

      const prompt = `
        Analyze this patient's medical history and provide 3-4 actionable health insights in JSON format.
        Focus on: risk factors, positive trends, and recommended actions.
        
        Medical History:
        ${medicalSummary}
        
        Respond ONLY with valid JSON array (no markdown, no code blocks):
        [
          {
            "category": "risk" | "positive" | "action",
            "title": "Insight title",
            "description": "2-sentence explanation"
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse JSON response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedInsights = JSON.parse(jsonMatch[0]);
        const insightsWithIcons = parsedInsights.map((insight: any) => ({
          ...insight,
          icon: getIconForCategory(insight.category)
        }));
        setInsights(insightsWithIcons);
      }
    } catch (err: any) {
      console.error('Health Insights error:', err);
      setError('Unable to generate insights. Please try again later.');
      setInsights([
        {
          category: 'positive',
          title: 'Regular Check-ups',
          description: 'You have maintained consistent medical documentation. Continue regular check-ups.',
          icon: <CheckCircle className="w-5 h-5" />
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'risk':
        return <AlertCircle className="w-5 h-5" />;
      case 'positive':
        return <CheckCircle className="w-5 h-5" />;
      case 'action':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] border border-slate-100 p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy mx-auto mb-4" />
        <p className="text-slate-600 font-bold">Analyzing your health profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[32px] border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-navy p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-gold" />
          <h2 className="text-2xl font-serif font-black">Health Insights</h2>
        </div>
        <p className="text-slate-300 text-sm">AI-powered analysis based on your medical records</p>
      </div>

      {/* Insights Grid */}
      <div className="p-8 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-bold flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl border-2 transition-all ${
              insight.category === 'risk'
                ? 'bg-red-50 border-red-200'
                : insight.category === 'positive'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex gap-4">
              <div className={`p-3 rounded-xl ${
                insight.category === 'risk'
                  ? 'bg-red-100 text-red-600'
                  : insight.category === 'positive'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-lg mb-1 ${
                  insight.category === 'risk'
                    ? 'text-red-700'
                    : insight.category === 'positive'
                    ? 'text-emerald-700'
                    : 'text-blue-700'
                }`}>
                  {insight.title}
                </h3>
                <p className={`text-sm font-medium ${
                  insight.category === 'risk'
                    ? 'text-red-600'
                    : insight.category === 'positive'
                    ? 'text-emerald-600'
                    : 'text-blue-600'
                }`}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">No insights available yet</p>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="p-6 border-t border-slate-200 flex gap-3">
        <button
          onClick={generateInsights}
          disabled={loading}
          className="flex-1 bg-navy hover:bg-slate-800 disabled:bg-slate-200 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>
    </div>
  );
};
