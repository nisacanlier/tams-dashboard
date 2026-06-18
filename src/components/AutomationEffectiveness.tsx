import React, { useState } from 'react';
import { Cpu, Zap, Activity, ShieldCheck, PlayCircle } from 'lucide-react';

interface AutoTrigger {
  id: string;
  ruleName: string;
  triggerCondition: string;
  status: 'Active' | 'Triggered' | 'Coordinated';
  savedMinutes: number;
  mitigatedFlights: number;
}

export const AutomationEffectiveness: React.FC = () => {
  const [triggers, setTriggers] = useState<AutoTrigger[]>([
    {
      id: 'at-1',
      ruleName: 'Bridge Connection Lag',
      triggerCondition: 'Actual Bridge Connection > 3 mins from Chocks-On',
      status: 'Triggered',
      savedMinutes: 5,
      mitigatedFlights: 4
    },
    {
      id: 'at-2',
      ruleName: 'Fuelling Pre-Alert',
      triggerCondition: 'Fuelling not started at 12th mins of Turnaround',
      status: 'Triggered',
      savedMinutes: 12,
      mitigatedFlights: 8
    },
    {
      id: 'at-3',
      ruleName: 'Boarding Gate Sync',
      triggerCondition: 'Boarding not commenced 20 mins before GT Deadline',
      status: 'Coordinated',
      savedMinutes: 18,
      mitigatedFlights: 12
    },
    {
      id: 'at-4',
      ruleName: 'Baggage Loading Spillover',
      triggerCondition: 'Loading rate < 10 bags/min in last 5 mins of target',
      status: 'Active',
      savedMinutes: 8,
      mitigatedFlights: 5
    }
  ]);

  // Aggregate stats
  const totalPreventedMinutes = triggers.reduce((sum, t) => sum + (t.status !== 'Active' ? t.savedMinutes : 0), 0) * 4; // simulated scale
  const totalSavedFlights = triggers.reduce((sum, t) => sum + t.mitigatedFlights, 0);

  return (
    <section id="automation-effectiveness" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
            <Cpu className="w-4 h-4 text-slate-800" />
          </span>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
              Automation Impact & Action Center
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Live monitoring of automated rule triggers, proactive delay prevention, and alert mitigation analytics.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded font-mono font-bold">
          LIVE TELEMETRY
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* KPI indicators side strip */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3.5">
          
          <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Önlenen Gecikme</span>
              <strong className="text-xl font-mono font-black text-slate-800">{totalPreventedMinutes} dakika</strong>
              <p className="text-[9.5px] text-emerald-600 font-semibold mt-0.5">Bugün kurtarılan süre</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Korunan Sefer Sayısı</span>
              <strong className="text-xl font-mono font-black text-slate-800">{totalSavedFlights} uçak</strong>
              <p className="text-[9.5px] text-emerald-605 font-medium mt-0.5 text-emerald-600">SLA rötarı engelledi</p>
            </div>
          </div>

        </div>

        {/* Trigger rules list table */}
        <div className="lg:col-span-8 border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider select-none">
                <td className="py-2.5 px-3 text-white">Rule Config</td>
                <td className="py-2.5 px-2 text-white">Rule Target Rule</td>
                <td className="py-2.5 px-2 text-white text-center">Mitigated Flights</td>
                <td className="py-2.5 px-3 text-white text-right">Rule Status</td>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 bg-white">
              {triggers.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                      {rule.ruleName}
                    </div>
                  </td>
                  <td className="py-2 px-2 font-mono text-[10px] text-slate-500 font-semibold">{rule.triggerCondition}</td>
                  <td className="py-2 px-2 text-center font-mono font-extrabold text-slate-700">{rule.mitigatedFlights}</td>
                  <td className="py-2 px-3 text-right">
                    <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] font-extrabold tracking-tight uppercase ${
                      rule.status === 'Triggered'
                        ? 'bg-red-50 text-red-650 border-red-200'
                        : rule.status === 'Coordinated'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
