import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { BarChart3, CheckSquare, AlertCircle, Info, Calendar } from 'lucide-react';

interface ServicePerformanceItem {
  name: string;
  plannedDuration: number;
  avgDuration: number;
  startDelayMin: number;
  finishDelayMin: number;
  startOnTargetRatio: number; // percentage of times start was on target
  finishOnTargetRatio: number; // percentage of times finish was on target
}

export const ServicePerformance: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'Today' | '7Days'>('Today');

  const performanceData: Record<'Today' | '7Days', ServicePerformanceItem[]> = {
    Today: [
      { name: 'Bridge Connection', plannedDuration: 2, avgDuration: 2.1, startDelayMin: 0.1, finishDelayMin: 0.2, startOnTargetRatio: 96, finishOnTargetRatio: 94 },
      { name: 'De-Boarding', plannedDuration: 7, avgDuration: 8.5, startDelayMin: 0.2, finishDelayMin: 1.5, startOnTargetRatio: 92, finishOnTargetRatio: 78 },
      { name: 'Fuelling Services', plannedDuration: 10, avgDuration: 12.2, startDelayMin: 1.1, finishDelayMin: 3.3, startOnTargetRatio: 74, finishOnTargetRatio: 65 },
      { name: 'Cabin Cleaning', plannedDuration: 6, avgDuration: 6.8, startDelayMin: 1.5, finishDelayMin: 2.3, startOnTargetRatio: 80, finishOnTargetRatio: 70 },
      { name: 'Baggage Loading', plannedDuration: 16, avgDuration: 18.1, startDelayMin: 0.5, finishDelayMin: 2.6, startOnTargetRatio: 85, finishOnTargetRatio: 72 },
      { name: 'Passenger Boarding', plannedDuration: 14, avgDuration: 15.9, startDelayMin: 2.1, finishDelayMin: 4.0, startOnTargetRatio: 68, finishOnTargetRatio: 52 }
    ],
    '7Days': [
      { name: 'Bridge Connection', plannedDuration: 2, avgDuration: 2.3, startDelayMin: 0.2, finishDelayMin: 0.5, startOnTargetRatio: 94, finishOnTargetRatio: 91 },
      { name: 'De-Boarding', plannedDuration: 7, avgDuration: 7.9, startDelayMin: 0.3, finishDelayMin: 1.2, startOnTargetRatio: 89, finishOnTargetRatio: 82 },
      { name: 'Fuelling Services', plannedDuration: 10, avgDuration: 11.5, startDelayMin: 0.9, finishDelayMin: 2.4, startOnTargetRatio: 79, finishOnTargetRatio: 71 },
      { name: 'Cabin Cleaning', plannedDuration: 6, avgDuration: 6.4, startDelayMin: 1.2, finishDelayMin: 1.6, startOnTargetRatio: 84, finishOnTargetRatio: 77 },
      { name: 'Baggage Loading', plannedDuration: 16, avgDuration: 17.2, startDelayMin: 0.4, finishDelayMin: 1.8, startOnTargetRatio: 88, finishOnTargetRatio: 80 },
      { name: 'Passenger Boarding', plannedDuration: 14, avgDuration: 14.8, startDelayMin: 1.6, finishDelayMin: 2.5, startOnTargetRatio: 75, finishOnTargetRatio: 64 }
    ]
  };

  const activeData = performanceData[selectedRange];

  // Map data specifically for Recharts Bar Chart
  const chartData = activeData.map(item => ({
    name: item.name,
    'Planlanan Süre (dk)': item.plannedDuration,
    'Gerçekleşen Süre (dk)': Math.round(item.avgDuration * 10) / 10,
    'Başlangıç Gecikmesi (dk)': Math.round(item.startDelayMin * 10) / 10
  }));

  return (
    <section id="service-performance" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
            <BarChart3 className="w-4 h-4 text-slate-800" />
          </span>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
              Service Performance Analytics
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Are services starting and finishing within target SLA windows? Planned vs Actual duration gap analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-55 p-1 rounded-xl bg-slate-100 select-none">
          <button
            onClick={() => setSelectedRange('Today')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              selectedRange === 'Today' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sadece Bugün
          </button>
          <button
            onClick={() => setSelectedRange('7Days')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              selectedRange === '7Days' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Son 7 Gün
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recharts Bar Chart area */}
        <div className="lg:col-span-7 h-64 bg-slate-50/50 p-2 rounded-xl border border-slate-150 flex flex-col justify-between">
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider px-2 pt-1 select-none">
            Planned vs Actual Turnaround Duration GAP (dk)
          </span>
          <div className="w-full h-52 text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '10px', border: 'none' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                <Bar dataKey="Planlanan Süre (dk)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gerçekleşen Süre (dk)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Başlangıç Gecikmesi (dk)" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Start vs Finish SLA Ratios Table widget */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider select-none">
                  <td className="py-2.5 px-3 text-white">Servis İsmi</td>
                  <td className="py-2.5 px-2 text-white text-center">Başlama SLA%</td>
                  <td className="py-2.5 px-3 text-white text-right">Bitirme SLA%</td>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white font-mono text-[11px]">
                {activeData.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-700 truncate max-w-[120px]" title={s.name}>
                      {s.name}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-800">
                      <span className={`font-extrabold ${s.startOnTargetRatio >= 85 ? 'text-emerald-700' : s.startOnTargetRatio >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        %{s.startOnTargetRatio}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-800">
                      <span className={`font-extrabold ${s.finishOnTargetRatio >= 80 ? 'text-emerald-700' : s.finishOnTargetRatio >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                        %{s.finishOnTargetRatio}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3 flex gap-2 text-[10px] text-amber-800 font-medium leading-relaxed">
            <Info className="w-4 h-4 text-amber-650 shrink-0 mt-0.5 text-amber-600" />
            <p>
              <strong>Darboğaz Teşhisi:</strong> <em>Passenger Boarding</em> servisi bitirme SLA'si <strong>%{selectedRange === 'Today' ? '52' : '64'}</strong> seviyesine inmiştir; bunun temel sebebi de-boarding esneklik payının tüketilmesidir.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
