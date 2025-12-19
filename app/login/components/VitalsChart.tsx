
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Activity, Droplet } from 'lucide-react';
import { DecryptedMedicalRecord } from '@/types';

interface VitalsChartProps {
  records: DecryptedMedicalRecord[];
}

const VitalsChart: React.FC<VitalsChartProps> = ({ records }) => {
  const chartData = records
    .filter(r => r.vitals.systolic || r.vitals.glucose)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(r => ({
      date: r.date,
      BP: r.vitals.systolic,
      Glucose: r.vitals.glucose,
    }));

  if (chartData.length < 2) {
    return (
      <div className="bg-navy/5 p-8 rounded-3xl border border-navy/10 flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-gold mb-3" />
        <h3 className="font-serif font-black text-navy">Analytics Ready</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Two or more certified records required for trend certification.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-serif font-black text-navy tracking-tight">HATI Trend Registry</h2>
          <p className="text-sm text-slate-500 font-medium">Certified clinical history tracking</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-navy"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">BP Pulse</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-gold"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Glucose Level</span>
           </div>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="BP" 
              stroke="#0A192F" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#0A192F', strokeWidth: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              dataKey="Glucose" 
              stroke="#D4AF37" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#D4AF37', strokeWidth: 0 }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VitalsChart;
