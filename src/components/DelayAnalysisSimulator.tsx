/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Undo2, 
  Activity, 
  HelpCircle, 
  ArrowUpRight, 
  UserMinus, 
  Utensils, 
  Trash2, 
  Droplet, 
  UserPlus, 
  Luggage, 
  Navigation,
  Sparkles,
  RefreshCcw,
  Plus,
  Minus
} from 'lucide-react';
import { GroundTimeTemplate, ServiceBreakdown } from '../types';
import { getTurnaroundServiceAllocations, IATA_DELAY_CODES } from '../data';

interface DelayAnalysisSimulatorProps {
  template: GroundTimeTemplate | null;
}

export const DelayAnalysisSimulator: React.FC<DelayAnalysisSimulatorProps> = ({
  template,
}) => {
  // Store injected delay values for each service ID
  const [injectedDelays, setInjectedDelays] = useState<Record<string, number>>({});
  const [selectedDelayReason, setSelectedDelayReason] = useState<string>('');
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(false);
  const [liveProgress, setLiveProgress] = useState<number>(0);

  // When template changes, reset injected delays
  useEffect(() => {
    setInjectedDelays({});
    setLiveProgress(0);
    setIsSimulatingLive(false);
  }, [template]);

  // Handle live simulation progress bar animation
  useEffect(() => {
    let interval: any;
    if (isSimulatingLive) {
      interval = setInterval(() => {
        setLiveProgress((prev) => {
          if (prev >= 100) {
            setIsSimulatingLive(false);
            return 100;
          }
          return prev + 25; // 4 turns to complete
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  if (!template) {
    return null; // Don't show if no template is loaded
  }

  // Get initial service allocations
  const baseServices = getTurnaroundServiceAllocations(template.targetMinutes);

  // Map service icons to actual Lucide component
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserMinus':
        return <UserMinus className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Trash2':
        return <Trash2 className="w-4 h-4" />;
      case 'Droplet':
        return <Droplet className="w-4 h-4" />;
      case 'UserPlus':
        return <UserPlus className="w-4 h-4" />;
      case 'Luggage':
        return <Luggage className="w-4 h-4" />;
      default:
        return <Navigation className="w-4 h-4" />;
    }
  };

  // Adjust delay for a specific service ID
  const handleAdjustDelay = (serviceId: string, amount: number) => {
    setInjectedDelays((prev) => {
      const current = prev[serviceId] || 0;
      const newValue = Math.max(0, current + amount);
      return { ...prev, [serviceId]: newValue };
    });
  };

  const handleReset = () => {
    setInjectedDelays({});
    setLiveProgress(0);
    setIsSimulatingLive(false);
  };

  // Calculate actual ground times based on simulated delays
  // If a delayed service is on the CRITICAL PATH, 100% of the delay pushes the target
  // If it is NOT on critical path, it has some buffer/slack. E.g. we add the delay only if it exceeds a certain buffer (e.g. 10 minutes)
  let totalAddedDelay = 0;
  const detailedServices = baseServices.map((service) => {
    const delay = injectedDelays[service.id] || 0;
    
    // Non-critical path services run in parallel and have some slack
    let computedDelayAddition = 0;
    if (service.criticalPath) {
      computedDelayAddition = delay;
    } else {
      // Non-critical paths have a slack of ~8 minutes
      computedDelayAddition = Math.max(0, delay - 8);
    }
    
    totalAddedDelay += computedDelayAddition;

    return {
      ...service,
      delay,
      actualDuration: service.allocatedMinutes + delay,
      isExceeded: delay > 0,
      impactOnMainTimeline: computedDelayAddition
    };
  });

  const estimatedActualGT = template.targetMinutes + totalAddedDelay;
  const difference = estimatedActualGT - template.targetMinutes;

  // Set visual levels based on status:
  // Green: <= Target
  // Orange: > Target and <= Target + 10 (or within 20% limit)
  // Red: > Target + 10 (SLA violation)
  let statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let badgeText = 'ON TARGET / EXCELLENT';
  let progressColor = 'bg-emerald-500';
  let messageText = 'Tüm yer süreçleri planlanan zaman çizelgesi içerisinde yürüyor. SLA uyumu mükemmel!';
  let colorTheme = 'emerald';

  if (estimatedActualGT > template.targetMinutes) {
    if (difference <= 10) {
      statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
      badgeText = 'RISK / MINOR SLIPPAGE';
      progressColor = 'bg-amber-500';
      messageText = 'Kritik akışta sınırlı gecikme tespit edildi. Yolcu boarding süreci hızlandırılarak tolere edilebilir.';
      colorTheme = 'amber';
    } else {
      statusColor = 'text-rose-700 bg-rose-50 border-rose-250';
      badgeText = 'SLA BREAK / CRITICAL DELAY';
      progressColor = 'bg-rose-500';
      messageText = 'Kritik operasyon yolları tıkandı. Havayolu cezai yaptırımı ve zincirleme gecikme riski oluştu!';
      colorTheme = 'rose';
    }
  }

  // Find associated IATA code recommendations based on highest delayed items
  const activeDelaysWithIata = detailedServices
    .filter(s => s.delay > 0)
    .map(s => {
      let code = '99';
      let desc = 'Diğer Sebepler';
      if (s.id.includes('catering')) { code = '18'; desc = 'Catering Hizmetleri Gecikmesi'; }
      if (s.id.includes('cleaning')) { code = '15'; desc = 'Kabin Temizliği ve Hazırlığı'; }
      if (s.id.includes('fueling')) { code = '46'; desc = 'Yakıt İkmali Entegrasyonu'; }
      if (s.id.includes('boarding')) { code = '51'; desc = 'Yolcu Alım Kapısı / Gate Gecikmesi'; }
      if (s.id.includes('baggage')) { code = '31'; desc = 'Bagaj Yükleme / Ramp Koordinasyonu'; }
      if (s.id.includes('deboarding')) { code = '31'; desc = 'Yolcu İniş / Bagaj Bant İletim Hatası'; }
      return { serviceName: s.name, code, desc, amount: s.delay };
    });

  return (
    <div id="delay-simulator-panel" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col gap-6">
      
      {/* Top Simulator Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-md p-1">
              <Activity className="w-4.5 h-4.5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Interactive Ground Time & SLA Gecikme Simülatörü
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geliş-gidiş servis bazlı gecikmeleri elle ekleyerek kritik yol (critical path) sapmalarını ve IATA gecikme tanzim kodlarını gözlemleyin.
          </p>
        </div>

        {/* Diagnostic CTA */}
        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-auto">
          <button
            id="reset-simulation-btn"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Simülasyon Sıfırla
          </button>
          
          <button
            id="live-simulation-btn"
            onClick={() => {
              setLiveProgress(0);
              setIsSimulatingLive(true);
            }}
            disabled={isSimulatingLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
              isSimulatingLive 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 active:scale-95'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            {isSimulatingLive ? 'Operasyon Sürüyor...' : 'Akış Simüle Et'}
          </button>
        </div>
      </div>

      {/* Main Grid: Left side metrics, right side visual workflow bars */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Summary State Dial (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col gap-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Simülatör Durumu</span>
              <span className="text-xs text-slate-500 font-medium block">Live SLA Health Monitoring</span>
            </div>

            {/* Simulated Live Bar */}
            {isSimulatingLive && (
              <div className="bg-blue-50 border border-blue-200/50 p-2.5 rounded-lg flex flex-col gap-1.5 animate-pulse">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-700">
                  <span>Süreç Tamamlanma Yakınlığı</span>
                  <span>%{liveProgress}</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-700" style={{ width: `${liveProgress}%` }} />
                </div>
              </div>
            )}

            {/* Time Outcome block */}
            <div className="flex items-baseline justify-between border-b pb-4 border-slate-200/60">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Hesaplanan Toplam GT</span>
                <span className="text-sm font-semibold text-slate-700">Est. Actual Duration</span>
              </div>
              <div className="text-right">
                <span className={`text-4xl font-extrabold tracking-tight ${difference > 10 ? 'text-rose-600' : difference > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {estimatedActualGT}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1">dakika</span>
              </div>
            </div>

            {/* Comparison Metrics */}
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Hedef (SLA) Limiti:</span>
              <span className="font-bold text-slate-700">{template.targetMinutes} dk</span>
            </div>

            <div className="flex justify-between text-xs py-1 border-b border-slate-200/40">
              <span className="text-slate-500 font-medium">Toplam Eklenen Gecikme:</span>
              <span className={`font-bold ${difference > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                +{difference} dk
              </span>
            </div>

            {/* SLA Status Badge */}
            <div className={`p-3 rounded-lg border text-center ${statusColor} font-bold text-xs flex flex-col gap-1`}>
              <div className="flex items-center justify-center gap-1.5">
                {difference === 0 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{badgeText}</span>
              </div>
              <span className="text-[10px] font-normal leading-normal mt-1 opacity-90 block">
                {messageText}
              </span>
            </div>
          </div>

          {/* Triggered IATA Code List */}
          {activeDelaysWithIata.length > 0 ? (
            <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">Tanzim Edilecek IATA Gecikme Kodları</span>
              <div className="flex flex-col gap-2">
                {activeDelaysWithIata.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-white p-2 border border-slate-100 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-50 border border-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        CODE {item.code}
                      </span>
                      <span className="text-slate-600 font-medium font-sans">
                        {item.serviceName.split(' ')[0]} Gecikmesi
                      </span>
                    </div>
                    <span className="text-rose-600 font-semibold text-right shrink-0 font-mono">
                      +{item.amount} dk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-[11px]">
              Henüz bir gecikme eklenmedi. Süreçleri incelemek için sağ taraftaki operasyon sürelerini artırabilirsiniz.
            </div>
          )}
        </div>

        {/* Right Column: Process Workflow sliders (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2 border-slate-100">
            <span className="text-xs font-bold text-slate-500"> TURNAROUND PROCESS & GANTT SEQUENCE SIMULATION</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span className="inline-block w-2.5 h-1 bg-indigo-500 rounded-full" /> Kritik Yol (Critical)
              <span className="inline-block w-2.5 h-1 bg-slate-300 rounded-full" /> Paralel Akış (Standard)
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            {detailedServices.map((service) => {
              // Calculate percent width representing duration of target GT
              const originalPercent = Math.min(100, Math.round((service.allocatedMinutes / template.targetMinutes) * 100));
              const delayPercent = Math.min(100, Math.round((service.delay / template.targetMinutes) * 100));

              return (
                <div
                  id={`service-row-${service.id}`}
                  key={service.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    service.delay > 0
                      ? 'bg-rose-50/20 border-rose-200/80'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {/* Service Title Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        service.criticalPath 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : 'bg-slate-50 text-slate-500'
                      }`}>
                        {getIcon(service.responsibleIcon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{service.name}</span>
                          {service.criticalPath && (
                            <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1 rounded-sm uppercase tracking-wider scale-95">
                              CRITICAL PATH
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block -mt-0.5 font-light">
                          {service.description}
                        </span>
                      </div>
                    </div>

                    {/* Delay adjustment controls */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        {service.allocatedMinutes} dk
                        {service.delay > 0 && (
                          <span className="text-rose-600 font-bold ml-1">
                            +{service.delay} dk
                          </span>
                        )}
                      </span>
                      
                      <div className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/30">
                        <button
                          id={`btn-dec-${service.id}`}
                          onClick={() => handleAdjustDelay(service.id, -5)}
                          disabled={service.delay <= 0}
                          className="p-1 hover:bg-white rounded-md text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-inc-${service.id}`}
                          onClick={() => handleAdjustDelay(service.id, 5)}
                          className="p-1 hover:bg-white rounded-md text-blue-600 cursor-pointer transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visualization Bar */}
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2.5 text-xs flex rounded bg-slate-100">
                      {/* Original Allocation */}
                      <div
                        style={{ width: `${originalPercent}%` }}
                        className={`shadow-xs rounded-l h-full shrink-0 ${
                          service.delay > 0 
                            ? 'bg-rose-900/10 border-r border-dashed border-rose-300'
                            : service.criticalPath 
                            ? 'bg-indigo-500' 
                            : 'bg-slate-400'
                        }`}
                      />
                      {/* Delay Addition (if any) */}
                      {service.delay > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${delayPercent}%` }}
                          className={`h-full rounded-r shrink-0 shadow-inner ${
                            service.criticalPath ? 'bg-rose-500' : 'bg-amber-400'
                          }`}
                        />
                      )}
                    </div>

                    {/* Timing Marker Help info */}
                    {service.delay > 0 && (
                      <div className="flex items-center justify-between text-[10px] mt-1">
                        <span className="text-slate-400">Normal Alokasyon: {service.allocatedMinutes} dk</span>
                        <span className={service.criticalPath ? 'text-rose-600 font-semibold' : 'text-amber-700 font-medium'}>
                          {service.criticalPath 
                            ? `Darboğaz Etkisi: Toplam SLA'e doğrudan +${service.delay} dk yansıdı`
                            : `Buffer Etkisi: SLA'e sadece +${service.impactOnMainTimeline} dk doğrudan yansıdı`
                          }
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border rounded-xl p-4 text-[11px] text-slate-500 mt-2 flex gap-2.5 items-start">
            <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-700">Geliştirici Mühendis Notu:</span>
              <span>
                Turnaround havacılık zincirinde her servis birbiriyle eşzamanlı (parallel routing) çalışır. Örneğin yolcu deboarding sürerken catering yüklemesi başlayabilir ancak yakıt yüklemesi tamamlanmadan boarding yapılamaz veya kapı kapatılamaz. Yukarıdaki <strong>Kritik Yol (Critical Path)</strong> işaretli servislerin gecikmesi toplam süreye %100 oranında direkt eklenirken diğer süreçler kendi tampon sürelerini (buffer/slack) aşana kadar sisteme gecikme yansıtmaz.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
