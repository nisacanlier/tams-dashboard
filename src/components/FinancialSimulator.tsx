import React, { useState } from 'react';
import { Landmark, TrendingUp, HelpCircle, AlertTriangle, Coins } from 'lucide-react';

export const FinancialSimulator: React.FC = () => {
  const [delayMinutes, setDelayMinutes] = useState<number>(15);

  // realistic airline delay calculations of cost
  const fuelCostPerMinute = 120; // in USD
  const crewOvertimePerMinute = 85; 
  const passengerCompensationThresholdFraction = 0.4; // chance of compensation
  
  const calculateCosts = (minutes: number) => {
    // base handling penalties
    const handlingPenaltyBase = minutes * 50;
    
    // fuel costs (APU runtime, recovery speedups)
    const extraFuel = minutes * fuelCostPerMinute;
    
    // crew overtime wages
    const crewOvertime = minutes * crewOvertimePerMinute;
    
    // compensation: peaks heavily after 30 minutes due to slots / passenger misconnect
    const passengerCompensation = minutes > 30 
      ? (minutes - 30) * 450 + 2000
      : minutes > 15 
        ? minutes * 80 
        : 0;

    const totalCost = handlingPenaltyBase + extraFuel + crewOvertime + passengerCompensation;

    return {
      handlingPenaltyBase,
      extraFuel,
      crewOvertime,
      passengerCompensation,
      totalCost
    };
  };

  const costs = calculateCosts(delayMinutes);

  return (
    <section id="financial-simulator" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
            <Landmark className="w-4 h-4 text-slate-800" />
          </span>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
              Financial & Operational Impact Tracker
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Simulate secondary operational or slot-bound delays to estimate cumulative network impact.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Slider & Metrics Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">⏱ Critical Path Delay</span>
              <span className="font-mono text-amber-600 font-extrabold text-sm">{delayMinutes} dakika</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="60"
              step="1"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FFCC00]"
            />

            <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
              <span>0 dk (Nominal)</span>
              <span>15 dk (Buffer Limit)</span>
              <span>30 dk (Slot Loss)</span>
              <span>60 dk (Heavy Penalty)</span>
            </div>
          </div>

          <div className="border border-red-100 bg-red-50/40 p-3 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-red-800 leading-snug">
              <strong>Kritik Eşik Uyarısı:</strong> {delayMinutes > 30 ? (
                <span>Gecikme 30 dakikayı geçtiği için <strong>Slot Kaybı ve Yolcu Tazminatı</strong> tetiklenmiş, ek maliyet katlanarak artmıştır.</span>
              ) : delayMinutes > 15 ? (
                <span>Gecikme rampa buffer limitini aşmıştır. Bağlantılı uçuşlar için zincirleme rötar riski bulunmaktadır.</span>
              ) : (
                <span>Mevcut gecikme süresi operasyonel tolerans penceresinin içindedir.</span>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Cost Cards */}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider">Ekstra Yakıt / APU</span>
            <strong className="text-sm text-slate-800 font-mono font-black mt-1 block">
              ${costs.extraFuel.toLocaleString()}
            </strong>
            <span className="text-[8px] text-slate-400 font-mono font-semibold">@ ${fuelCostPerMinute}/dk</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider">Ekip Overtime Gideri</span>
            <strong className="text-sm text-slate-800 font-mono font-black mt-1 block">
              ${costs.crewOvertime.toLocaleString()}
            </strong>
            <span className="text-[8px] text-slate-400 font-mono font-semibold">@ ${crewOvertimePerMinute}/dk</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-center">
            <span className="text-[8px] font-extrabold text-slate-400 uppercase block tracking-wider">Tazminat / Rebook</span>
            <strong className={`text-sm font-mono font-black mt-1 block ${costs.passengerCompensation > 0 ? 'text-red-650 text-red-600' : 'text-slate-550'}`}>
              ${costs.passengerCompensation.toLocaleString()}
            </strong>
            <span className="text-[8px] text-slate-400 font-mono font-semibold">{delayMinutes > 30 ? 'Slot Kaybı Dahil' : 'Tolerans Sınırında'}</span>
          </div>

          {/* Sum Total Card with gold highlight */}
          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-center col-span-2 md:col-span-1 shadow-sm ring-1 ring-yellow-300">
            <span className="text-[8px] font-extrabold text-yellow-800 uppercase block tracking-wider">Toplam Mali Etki</span>
            <strong className="text-base text-yellow-950 font-mono font-extrabold mt-0.5 block">
              ${costs.totalCost.toLocaleString()}
            </strong>
            <span className="text-[8px] text-yellow-600 font-bold block mt-0.5">Estimated Loss</span>
          </div>

        </div>
      </div>

      {/* Required business note */}
      <div className="text-[10px] text-slate-400 italic text-right font-medium pr-1 border-t border-slate-100 pt-2.5 flex justify-between">
        <span>* Simülasyon modeli Eurocontrol rampa gecikme katsayılarına göre geliştirilmiştir.</span>
        <span>Finansal etki hesaplamaları ilgili iş birimi verileriyle kalibre edilecektir.</span>
      </div>
    </section>
  );
};
