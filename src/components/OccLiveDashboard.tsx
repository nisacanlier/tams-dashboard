import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Clock, 
  Plane, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  Gauge, 
  Search,
  Filter,
  BarChart4,
  MapPin,
  TrendingUp,
  Workflow,
  X,
  Sliders,
  ChevronDown,
  Info,
  ChevronRight,
  Timer,
  MousePointerClick
} from 'lucide-react';
import { HubCode } from '../types';
import { GROUND_TIME_TEMPLATES, HUBS } from '../data';
import { 
  ActiveFlight, 
  INITIAL_ACTIVE_FLIGHTS, 
  DELAY_CAUSES_DB, 
  DelayCause, 
  LocalGanttService 
} from '../mockData';

// Import our cohesive modular components
import { FinancialSimulator } from './FinancialSimulator';
import { AutomationEffectiveness } from './AutomationEffectiveness';
import { ServicePerformance } from './ServicePerformance';

export const OccLiveDashboard: React.FC<{ activeHub: HubCode }> = ({ activeHub }) => {
  // App States
  const [flights, setFlights] = useState<ActiveFlight[]>(INITIAL_ACTIVE_FLIGHTS);
  const [selectedFlight, setSelectedFlight] = useState<ActiveFlight | null>(null);
  
  // Drill Down and Filter States
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stationFilter, setStationFilter] = useState<'All' | HubCode>('All');
  const [aircraftFilter, setAircraftFilter] = useState('All');
  const [gtTypeFilter, setGtTypeFilter] = useState('All');
  const [flightTypeFilter, setFlightTypeFilter] = useState('All');

  // Interactive Cause settings
  const [rootCauseTimeRange, setRootCauseTimeRange] = useState<'Today' | '7Days' | '30Days'>('Today');
  const [rootCauseMetric, setRootCauseMetric] = useState<'ratio' | 'minutes' | 'flights'>('ratio');

  // Service Detail Panel
  const [clickedService, setClickedService] = useState<LocalGanttService | null>(null);

  // Auto select flight for active hub and reset template drill down
  useEffect(() => {
    const hubFlights = flights.filter(f => f.station === activeHub);
    if (hubFlights.length > 0) {
      setSelectedFlight(hubFlights[0]);
    } else {
      setSelectedFlight(null);
    }
    setSelectedTemplateId(null);
    setClickedService(null);
  }, [activeHub]);

  // Dynamic template list with SLA metrics
  const activeHubTemplates = useMemo(() => {
    const templates = GROUND_TIME_TEMPLATES.filter(t => t.hub === activeHub);
    
    return templates.map((tpl) => {
      const charSum = tpl.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) + (activeHub === 'SAW' ? 100 : 20);
      
      const todayTotal = 12 + (charSum % 74);
      let compliance = 75 + (charSum % 21);
      
      if (activeHub === 'SAW' && tpl.name.includes('Dom-Dom')) compliance = 90;
      if (activeHub === 'SAW' && tpl.name.includes('Dom-Int')) compliance = 92;
      if (activeHub === 'SAW' && tpl.name.includes('Int-X')) compliance = 74;

      const successful = Math.round(todayTotal * (compliance / 100));
      const failed = todayTotal - successful;
      
      const offset = compliance > 90 ? -2 : compliance > 80 ? 1 : 3;
      const averageGT = Math.round(tpl.targetMinutes + offset);
      const avgDeviation = averageGT - tpl.targetMinutes;

      const bottlenecks = ['Cabin Cleaning (Kabin Temizliği)', 'Passenger Boarding (Biniş Kapısı)', 'Baggage Loading (Ramp Bagaj Yükleme)', 'Fuelling Services (Yakıt İkmali)'];
      const delayingServices = ['Temizlik Dağıtımı', 'Geç Yolcu Kabulü', 'Şut Bagaj Taşması', 'Tanker Sürücü Gecikmesi'];
      
      const bottleneck = bottlenecks[charSum % bottlenecks.length];
      const delayingService = delayingServices[(charSum + 2) % delayingServices.length];

      return {
        ...tpl,
        todayTotal,
        successful,
        failed,
        compliance,
        averageGT,
        avgDeviation,
        bottleneck,
        delayingService
      };
    });
  }, [activeHub]);

  // Find unique targets for headers
  const uniqueTargets = useMemo(() => {
    const targets = activeHubTemplates.map(t => Number(t.targetMinutes));
    return Array.from(new Set(targets)).sort((a: number, b: number) => a - b);
  }, [activeHubTemplates]);

  // Selected Template Object For Drill Down
  const activeTemplateDetails = useMemo(() => {
    if (!selectedTemplateId) return null;
    return activeHubTemplates.find(t => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, activeHubTemplates]);

  // Processed Active Flights List
  const processedFlights = useMemo(() => {
    return flights.filter(f => {
      const matchesHub = f.station === activeHub;
      const matchesSearch = f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.tailNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDest = stationFilter === 'All' ? true : f.destination === stationFilter;
      const matchesAC = aircraftFilter === 'All' ? true : f.aircraftType === aircraftFilter;
      const matchesGtTp = gtTypeFilter === 'All' ? true : f.gtType === gtTypeFilter;
      const matchesFlTp = flightTypeFilter === 'All' ? true : f.flightType === flightTypeFilter;
      
      let matchesTemplate = true;
      if (selectedTemplateId && activeTemplateDetails) {
        const tplName = activeTemplateDetails.name.toLowerCase();
        matchesTemplate = f.gtTemplate.toLowerCase().includes(tplName) || 
                          (activeTemplateDetails.name.includes('Dom-Dom') && f.flightType === 'Domestic' && f.gtType === 'Turnaround') ||
                          (activeTemplateDetails.name.includes('Dom-Int') && f.flightType === 'International' && f.gtType === 'Turnaround') ||
                          (activeTemplateDetails.name.includes('Mixed') && f.flightType === 'International' && f.gtType === 'Turnaround') ||
                          (activeTemplateDetails.name.includes('Int-X') && f.flightType === 'International' && f.gtType === 'Turnaround') ||
                          (activeTemplateDetails.name.includes('Departure') && f.gtType === 'Departure');
      }

      return matchesHub && matchesSearch && matchesDest && matchesAC && matchesGtTp && matchesFlTp && matchesTemplate;
    }).sort((a, b) => {
      const priority = { 'Delayed': 4, 'Critical': 3, 'At Risk': 2, 'On Target': 1 };
      return priority[b.status] - priority[a.status];
    });
  }, [flights, activeHub, searchQuery, stationFilter, aircraftFilter, gtTypeFilter, flightTypeFilter, selectedTemplateId, activeTemplateDetails]);

  // Select automatically first flight if selected flight disappears
  useEffect(() => {
    if (processedFlights.length > 0) {
      const containsCurrentlySelected = processedFlights.some(f => f.id === selectedFlight?.id);
      if (!containsCurrentlySelected) {
        setSelectedFlight(processedFlights[0]);
      }
    } else {
      setSelectedFlight(null);
    }
  }, [processedFlights, selectedFlight]);

  // Executive summary counts
  const stats = useMemo(() => {
    const hubFlights = flights.filter(f => f.station === activeHub);
    const totalActive = hubFlights.length;
    const onTargetCount = hubFlights.filter(f => f.status === 'On Target').length;
    const atRiskCount = hubFlights.filter(f => f.status === 'At Risk').length;
    const criticalCount = hubFlights.filter(f => f.status === 'Critical').length;
    const delayedCount = hubFlights.filter(f => f.status === 'Delayed').length;
    
    const slaSuccessRate = totalActive > 0 ? Math.round(((onTargetCount + atRiskCount) / totalActive) * 100) : 92;
    const avgGt = totalActive > 0 ? Math.round(hubFlights.reduce((acc, f) => acc + f.elapsedGt, 0) / totalActive) : 38;
    const totalSapma = hubFlights.reduce((acc, f) => acc + (f.elapsedGt - f.gtTarget), 0);
    const avgSapma = totalActive > 0 ? parseFloat((totalSapma / totalActive).toFixed(1)) : 1.2;

    return {
      totalActive,
      onTargetCount,
      atRiskCount,
      criticalCount,
      delayedCount,
      slaSuccessRate,
      avgGt,
      avgSapma
    };
  }, [flights, activeHub]);

  // Gantt service allocations
  const dynamicGanttServices = useMemo(() => {
    if (!selectedFlight) return [];

    const target = selectedFlight.gtTarget;
    const scale = target / 40; 
    const round = (val: number) => Math.max(1, Math.round(val));

    // Bridges
    const d1 = round(2 * scale);
    const s1 = 0;
    const f1 = s1 + d1;

    // De-boarding
    const d2 = round(7 * scale);
    const s2 = f1;
    const f2 = s2 + d2;

    // Fuel
    const d3 = round(10 * scale);
    const s3 = f2;
    const f3 = s3 + d3;

    // Cabin Cleaning
    const d4 = round(6 * scale);
    const s4 = f2;
    const f4 = s4 + d4;

    // Crew Preparation
    const d5 = round(8 * scale);
    const s5 = f2;
    const f5 = s5 + d5;

    // Catering Service
    const d6 = round(5 * scale);
    const s6 = f2;
    const f6 = s6 + d6;

    // Crew Security Tarama
    const d7 = round(4 * scale);
    const s7 = f4;
    const f7 = s7 + d7;

    // Baggage Unloading
    const d10 = round(10 * scale);
    const s10 = f1;
    const f10 = s10 + d10;

    // Baggage Loading
    const d11 = round(16 * scale);
    const s11 = f10;
    const f11 = s11 + d11;

    // Passenger Embarking 
    const d8 = round(14 * scale);
    const s8 = Math.max(f3, f4, f7);
    const f8 = s8 + d8;

    // Systematic gate Boarding
    const d9 = round(10 * scale);
    const s9 = Math.max(s8 - round(3 * scale), 0);
    const f9 = s9 + d9;

    // Pushback 
    const d12 = round(3 * scale);
    const s12 = Math.max(f8, f11);
    const f12 = s12 + d12;

    const list: LocalGanttService[] = [
      {
        id: 'gs-1',
        name: 'Bridge-Stairs Connection',
        baseDuration: d1,
        plannedStart: s1,
        plannedFinish: f1,
        predecessor: '—',
        relationType: 'none',
        isCritical: false,
        slackMinutes: round(2 * scale),
        flexibleStart: s1,
        flexibleFinish: f1 + round(2 * scale),
        status: 'Completed'
      },
      {
        id: 'gs-2',
        name: 'De-Boarding (Yolcu İniş)',
        baseDuration: d2,
        plannedStart: s2,
        plannedFinish: f2,
        predecessor: 'Bridge-Stairs Connection',
        relationType: 'FS',
        isCritical: true,
        slackMinutes: 0,
        flexibleStart: s2,
        flexibleFinish: f2,
        status: 'Completed'
      },
      {
        id: 'gs-3',
        name: 'Fuelling (Yakıt İkmali)',
        baseDuration: d3,
        plannedStart: s3,
        plannedFinish: f3,
        predecessor: 'De-Boarding',
        relationType: 'FS',
        isCritical: true,
        slackMinutes: round(2 * scale),
        flexibleStart: s3,
        flexibleFinish: f3 + round(2 * scale),
        status: selectedFlight.elapsedGt >= f3 ? 'Completed' : selectedFlight.elapsedGt >= s3 ? 'In Progress' : 'Not Started'
      },
      {
        id: 'gs-4',
        name: 'Cabin Cleaning & Prep',
        baseDuration: d4,
        plannedStart: s4,
        plannedFinish: f4,
        predecessor: 'De-Boarding',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(4 * scale),
        flexibleStart: s4,
        flexibleFinish: f4 + round(4 * scale),
        status: selectedFlight.elapsedGt >= f4 ? 'Completed' : selectedFlight.elapsedGt >= s4 ? 'In Progress' : 'Not Started'
      },
      {
        id: 'gs-5',
        name: 'Crew Preparing (Kokpit/Kabin)',
        baseDuration: d5,
        plannedStart: s5,
        plannedFinish: f5,
        predecessor: 'De-Boarding',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(8 * scale),
        flexibleStart: s5,
        flexibleFinish: f5 + round(8 * scale),
        status: selectedFlight.elapsedGt >= f5 ? 'Completed' : 'Not Started'
      },
      {
        id: 'gs-6',
        name: 'Catering (İkram Hizmeti)',
        baseDuration: d6,
        plannedStart: s6,
        plannedFinish: f6,
        predecessor: 'De-Boarding',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(10 * scale),
        flexibleStart: s6,
        flexibleFinish: f6 + round(10 * scale),
        status: selectedFlight.elapsedGt >= f6 ? 'Completed' : 'Not Started'
      },
      {
        id: 'gs-7',
        name: 'Crew Security Check',
        baseDuration: d7,
        plannedStart: s7,
        plannedFinish: f7,
        predecessor: 'Cabin Cleaning & Prep',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(2 * scale),
        flexibleStart: s7,
        flexibleFinish: f7 + round(2 * scale),
        status: selectedFlight.elapsedGt >= f7 ? 'Completed' : 'Not Started'
      },
      {
        id: 'gs-10',
        name: 'Baggage Unloading',
        baseDuration: d10,
        plannedStart: s10,
        plannedFinish: f10,
        predecessor: 'Bridge-Stairs Connection',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(4 * scale),
        flexibleStart: s10,
        flexibleFinish: f10 + round(4 * scale),
        status: 'Completed'
      },
      {
        id: 'gs-11',
        name: 'Baggage Loading (Yükleme)',
        baseDuration: d11,
        plannedStart: s11,
        plannedFinish: f11,
        predecessor: 'Baggage Unloading',
        relationType: 'FS',
        isCritical: false,
        slackMinutes: round(3 * scale),
        flexibleStart: s11,
        flexibleFinish: f11 + round(3 * scale),
        status: selectedFlight.elapsedGt >= f11 ? 'Completed' : selectedFlight.elapsedGt >= s11 ? 'In Progress' : 'Not Started'
      },
      {
        id: 'gs-8',
        name: 'Passenger Embarking (Giriş)',
        baseDuration: d8,
        plannedStart: s8,
        plannedFinish: f8,
        predecessor: 'Fuelling / Cleaning / Security',
        relationType: 'FS',
        isCritical: true,
        slackMinutes: 0,
        flexibleStart: s8,
        flexibleFinish: f8,
        status: selectedFlight.elapsedGt >= f8 ? 'Completed' : selectedFlight.elapsedGt >= s8 ? 'In Progress' : 'Not Started'
      },
      {
        id: 'gs-9',
        name: 'Systematic Boarding (Gate)',
        baseDuration: d9,
        plannedStart: s9,
        plannedFinish: f9,
        predecessor: 'Passenger Embarking',
        relationType: 'SS',
        isCritical: false,
        slackMinutes: round(3 * scale),
        flexibleStart: s9,
        flexibleFinish: f9 + round(3 * scale),
        status: selectedFlight.elapsedGt >= f9 ? 'Completed' : selectedFlight.elapsedGt >= s9 ? 'In Progress' : 'Not Started'
      },
      {
        id: 'gs-12',
        name: 'Pushback Process (Kalkış)',
        baseDuration: d12,
        plannedStart: s12,
        plannedFinish: f12,
        predecessor: 'Passenger Embarking & Baggage',
        relationType: 'FS',
        isCritical: true,
        slackMinutes: 0,
        flexibleStart: s12,
        flexibleFinish: f12,
        status: selectedFlight.elapsedGt >= f12 ? 'Completed' : selectedFlight.elapsedGt >= s12 ? 'In Progress' : 'Not Started'
      }
    ];

    return list.map(item => {
      if (item.status === 'In Progress' && selectedFlight.elapsedGt > item.flexibleFinish) {
        return { ...item, status: 'Delayed' as const };
      }
      if (item.status === 'In Progress' && selectedFlight.elapsedGt > item.plannedFinish) {
        return { ...item, status: 'At Risk' as const };
      }
      return item;
    });
  }, [selectedFlight]);

  // Delay causes calculations
  const delayRootCauses = useMemo(() => {
    return DELAY_CAUSES_DB[rootCauseTimeRange];
  }, [rootCauseTimeRange]);

  const maxTimelineMinutes = selectedFlight ? Math.max(55, selectedFlight.gtTarget + 10) : 55;

  // Render method
  return (
    <div id="occ-live-dashboard" className="space-y-6">
      
      {/* SECTION 1: GT TYPE COMPLIANCE DASHBOARD */}
      <section id="gt-template-performance" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
              <Timer className="w-4 h-4 text-slate-800" />
            </span>
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                {activeHub} HUB - Defined Ground Time SLA Templates
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Click template card to trigger deep-dive filters for active flights.
              </p>
            </div>
          </div>
        </div>
        {/* Template List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeHubTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            
            let complianceColor = 'text-slate-700';
            let circleColor = 'stroke-slate-200';
            let activeCircleColor = 'stroke-blue-500';

            if (template.compliance >= 90) {
              complianceColor = 'text-emerald-700';
              circleColor = 'stroke-emerald-100';
              activeCircleColor = 'stroke-emerald-500';
            } else if (template.compliance >= 80) {
              complianceColor = 'text-amber-700';
              circleColor = 'stroke-amber-100';
              activeCircleColor = 'stroke-amber-500';
            } else {
              complianceColor = 'text-red-700 font-black';
              circleColor = 'stroke-red-100';
              activeCircleColor = 'stroke-red-500';
            }

            return (
              <div
                key={template.id}
                id={`template-card-${template.id}`}
                onClick={() => setSelectedTemplateId(isSelected ? null : template.id)}
                className={`border p-4 rounded-xl transition-all cursor-pointer relative ${
                  isSelected 
                    ? 'border-[#FFCC00] bg-yellow-50/40 shadow-sm ring-1 ring-[#FFCC00]/50' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Selector indicator */}
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFCC00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFCC00]"></span>
                  </span>
                )}

                <div className="flex justify-between gap-2.5 items-start">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight leading-snug line-clamp-2" title={template.name}>
                      {template.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[11px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-mono font-black border border-amber-500 shadow-2xs">
                        🎯 {template.targetMinutes} dakika
                      </span>
                      <span className="text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded-md font-mono font-bold uppercase border border-slate-150">
                        {template.type}
                      </span>
                    </div>
                  </div>

                  {/* Circular SLA Indicator Progress Ring */}
                  <div className="relative h-11 w-11 shrink-0 select-none">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className={`fill-none stroke-2 ${circleColor}`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`fill-none stroke-2 stroke-cap-round ${activeCircleColor}`}
                        strokeDasharray={`${template.compliance}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-slate-800">
                      %{template.compliance}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 py-2.5 my-2.5 border-t border-b border-slate-100 text-center font-mono text-xs">
                  <div>
                    <span className="block text-[8px] font-semibold text-slate-400 uppercase tracking-wider">TOPLAM</span>
                    <strong className="text-slate-800 font-extrabold">{template.todayTotal}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] font-semibold text-emerald-600 uppercase tracking-wider">SLA OK</span>
                    <strong className="text-emerald-700 font-extrabold">{template.successful}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] font-semibold text-red-500 uppercase tracking-wider">HATA</span>
                    <strong className="text-red-600 font-extrabold">{template.failed}</strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span>Ortalama Süre</span>
                  <span className={template.avgDeviation > 0 ? 'text-red-500 font-mono' : 'text-emerald-600 font-mono'}>
                    {template.averageGT} dk ({template.avgDeviation >= 0 ? `+${template.avgDeviation}` : template.avgDeviation}m)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drill-down Meta details prompt */}
        <AnimatePresence>
          {selectedTemplateId && activeTemplateDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#FFCC00]/5 border border-[#FFCC00]/30 p-4 rounded-xl space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-1.5 text-[#DD8800] text-xs font-black">
                <MousePointerClick className="w-4 h-4 text-slate-800 animate-pulse" />
                <span>GT TEMPLATE DRILL-DOWN AKTİF:</span>
                <span className="text-slate-900 underline font-black">{activeTemplateDetails.name}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Gözlemlenen Akış</span>
                  <strong className="text-sm text-slate-900 font-mono font-black">{activeTemplateDetails.todayTotal} Sefer</strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Uyum Oranı</span>
                  <strong className="text-sm text-emerald-600 font-mono font-black">%{activeTemplateDetails.compliance} SLA</strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Defect Ortalama Sapma</span>
                  <strong className={`text-sm font-mono font-black block ${activeTemplateDetails.avgDeviation > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {activeTemplateDetails.avgDeviation >= 0 ? `+${activeTemplateDetails.avgDeviation}` : activeTemplateDetails.avgDeviation} dk
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Sık Geciken Kısım</span>
                  <strong className="text-[10px] text-red-600 font-bold block truncate mt-1" title={activeTemplateDetails.delayingService}>
                    {activeTemplateDetails.delayingService}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">En Sık Darboğaz</span>
                  <strong className="text-[10px] text-slate-800 font-bold block truncate mt-1" title={activeTemplateDetails.bottleneck}>
                    {activeTemplateDetails.bottleneck}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-center shadow-2xs">
                  <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Riskli / Geciken</span>
                  <strong className="text-sm text-amber-600 font-mono font-black">
                    {flights.filter(f => f.station === activeHub && f.status !== 'On Target').length} Uçuş
                  </strong>
                </div>
              </div>

              <div className="bg-white/80 border border-slate-200/60 p-2 rounded text-[10px] text-slate-600 flex items-center justify-between font-semibold">
                <span>💡 Şablon filtresi uygulanıyor. Apron tablosundaki tüm uçakların rampa silsileleri bu sınıflara göre kısıtlanmıştır.</span>
                <button 
                  onClick={() => setSelectedTemplateId(null)}
                  className="text-[10px] font-bold text-[#DD8800] underline hover:text-slate-900 cursor-pointer"
                >
                  Filtreyi Temizle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 2: EXECUTIVE SUMMARY */}
      <section id="executive-summary" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Timer className="w-4 h-4 text-slate-400" />
            Operasyonel Genel Sağlık Durumu & KPI Dağılımı
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
            HER 5 SANİYEDE BİR GÜNCELLENİR
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-8 gap-3">
          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">🛫 Aktif Seferler</span>
            <div className="mt-1 text-2xl font-mono font-black text-slate-950">{stats.totalActive}</div>
            <span className="text-[8px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">Çalışan</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider">🟢 Hedefinde (SLA OK)</span>
            <div className="mt-1 text-2xl font-mono font-black text-emerald-600">{stats.onTargetCount}</div>
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">Nominal Kapasite</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs bg-amber-50/20">
            <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider">🟡 Risk Seviyesi</span>
            <div className="mt-1 text-2xl font-mono font-black text-amber-600">{stats.atRiskCount}</div>
            <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">Esneklik Sınırı</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs bg-orange-50/20 animate-pulse">
            <span className="text-[9px] text-orange-650 font-extrabold uppercase tracking-wider text-orange-600">🔴 Tahmini Geciken</span>
            <div className="mt-1 text-2xl font-mono font-black text-orange-600">{stats.criticalCount}</div>
            <span className="text-[8px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">Darboğaz Tehdidi</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs bg-red-50/20">
            <span className="text-[9px] text-red-650 font-extrabold uppercase tracking-wider text-red-600">⛔ Kesin Geciken</span>
            <div className="mt-1 text-2xl font-mono font-black text-red-600">{stats.delayedCount}</div>
            <span className="text-[8px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">Hedef Aşıldı</span>
          </div>

          <div className="bg-white border border-[#FFCC00]/40 p-3.5 rounded-xl text-center shadow-2xs bg-yellow-50/10">
            <span className="text-[9px] text-slate-800 font-extrabold uppercase tracking-wider">📊 SLA Uyum Oranı</span>
            <div className="mt-1 text-2xl font-mono font-black text-slate-900">%{stats.slaSuccessRate}</div>
            <span className="text-[8px] font-bold text-slate-700 bg-yellow-50 px-1.5 py-0.2 rounded mt-1.5 inline-block">Hedef: %95.0</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">⏱ Ort. Turnaround</span>
            <div className="mt-1 text-2xl font-mono font-black text-slate-800">{stats.avgGt} dk</div>
            <span className="text-[8px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">Süreç Ortalaması</span>
          </div>

          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-center shadow-2xs">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">⏱ Ort. Sapma</span>
            <div className="mt-1 text-2xl font-mono font-black text-slate-800">
              {stats.avgSapma >= 0 ? `+${stats.avgSapma}` : stats.avgSapma} dk
            </div>
            <span className="text-[8px] font-bold text-slate-655 bg-slate-100 px-1.5 py-0.2 rounded mt-1.5 inline-block">Ort. Plana Oran</span>
          </div>
        </div>
      </section>

      {/* SLA DEVIATION STACKED SPLIT BAR CHART & DELAY ROOT CAUSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Row 1 Left: Oransal Sağlık Dağılımı */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1.5 bg-slate-100 text-slate-900 rounded-lg shrink-0">
                <Gauge className="w-4 h-4 text-slate-700" />
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                  Oransal Sağlık Durumu Dağılımı
                </h3>
              </div>
            </div>

            {/* Split Stacked Bar Chart */}
            <div className="mt-6 space-y-5">
              <div className="h-7 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
                <div 
                  className="bg-emerald-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] text-white font-extrabold"
                  style={{ width: `${stats.totalActive > 0 ? (stats.onTargetCount / stats.totalActive) * 100 : 40}%` }}
                >
                  {stats.onTargetCount > 0 && `${Math.round((stats.onTargetCount / stats.totalActive) * 100)}%`}
                </div>
                <div 
                  className="bg-amber-400 hover:opacity-90 transition-all flex items-center justify-center text-[10px] text-slate-900 font-extrabold"
                  style={{ width: `${stats.totalActive > 0 ? (stats.atRiskCount / stats.totalActive) * 100 : 30}%` }}
                >
                  {stats.atRiskCount > 0 && `${Math.round((stats.atRiskCount / stats.totalActive) * 100)}%`}
                </div>
                <div 
                  className="bg-orange-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] text-white font-extrabold"
                  style={{ width: `${stats.totalActive > 0 ? (stats.criticalCount / stats.totalActive) * 100 : 20}%` }}
                >
                  {stats.criticalCount > 0 && `${Math.round((stats.criticalCount / stats.totalActive) * 100)}%`}
                </div>
                <div 
                  className="bg-red-50 hover:opacity-90 transition-all flex items-center justify-center text-[10px] text-white font-extrabold bg-red-500"
                  style={{ width: `${stats.totalActive > 0 ? (stats.delayedCount / stats.totalActive) * 100 : 10}%` }}
                >
                  {stats.delayedCount > 0 && `${Math.round((stats.delayedCount / stats.totalActive) * 100)}%`}
                </div>
              </div>

              {/* Stats Legend Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 border border-emerald-100 rounded-xl bg-emerald-50/25">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    ZAMANINDA (ON TARGET)
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono text-xs">
                    <span className="text-sm font-black text-slate-800">{stats.onTargetCount}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Uçuş</span>
                    <span className="text-xs font-bold text-emerald-600 ml-auto font-mono">
                      {stats.totalActive > 0 ? Math.round((stats.onTargetCount / stats.totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-amber-100 rounded-xl bg-amber-50/25">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] text-amber-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    RİSK HEDEFİNDE (AT RISK)
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono text-xs">
                    <span className="text-sm font-black text-slate-800">{stats.atRiskCount}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Uçuş</span>
                    <span className="text-xs font-bold text-amber-600 ml-auto font-mono">
                      {stats.totalActive > 0 ? Math.round((stats.atRiskCount / stats.totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-orange-100 rounded-xl bg-orange-50/25">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] text-orange-850 text-orange-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-55 bg-orange-500" />
                    DARBOĞAZ (CRITICAL PATH)
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono text-xs">
                    <span className="text-sm font-black text-slate-800">{stats.criticalCount}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Uçuş</span>
                    <span className="text-xs font-bold text-orange-600 ml-auto">
                      {stats.totalActive > 0 ? Math.round((stats.criticalCount / stats.totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="p-3 border border-red-100 rounded-xl bg-red-50/25">
                  <div className="flex items-center gap-1.5 font-bold text-[10px] text-red-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    GECİKMİŞ (DELAYED)
                  </div>
                  <div className="mt-1 flex items-baseline gap-1 font-mono text-xs">
                    <span className="text-sm font-black text-slate-800">{stats.delayedCount}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Uçuş</span>
                    <span className="text-xs font-bold text-red-650 ml-auto text-red-500">
                      {stats.totalActive > 0 ? Math.round((stats.delayedCount / stats.totalActive) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: DELAY ROOT CAUSE ANALYSIS */}
        <div id="delay-root-causes" className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-slate-100 text-slate-900 rounded-lg shrink-0">
                  <BarChart4 className="w-4 h-4 text-slate-700" />
                </span>
                <div>
                  <h3 className="text-xs font-black text-slate-905 uppercase tracking-widest text-slate-950">
                    Gecikme Kök Neden Analitiği
                  </h3>
                </div>
              </div>

              {/* Timeframe Selector Tab */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['Today', '7Days', '30Days'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setRootCauseTimeRange(t as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      rootCauseTimeRange === t ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t === 'Today' ? 'Bugün' : t === '7Days' ? 'Son 7 Gün' : 'Son 30 Gün'}
                  </button>
                ))}
              </div>
            </div>

            {/* Metric Mode Toggle (Gecikme Payı %, Toplam Gecikme Dakikası, Etkilenen Uçuş Sayısı) */}
            <div className="mt-3 flex gap-2 justify-center bg-slate-50 p-1.5 rounded-xl border border-slate-150">
              <button 
                onClick={() => setRootCauseMetric('ratio')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  rootCauseMetric === 'ratio' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Gecikme Payı %
              </button>
              <button 
                onClick={() => setRootCauseMetric('minutes')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  rootCauseMetric === 'minutes' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Toplam Gecikme Dakikası
              </button>
              <button 
                onClick={() => setRootCauseMetric('flights')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  rootCauseMetric === 'flights' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Etkilenen Uçuş Sayısı
              </button>
            </div>

            {/* List of Causes based on toggle */}
            <div className="mt-4 space-y-3">
              {delayRootCauses.map((cause, idx) => {
                let displayVal = `% ${cause.share}`;
                let progressValue = cause.share;
                
                if (rootCauseMetric === 'minutes') {
                  displayVal = `${cause.avgMinutes} dk`;
                  progressValue = (cause.avgMinutes / 25) * 100;
                } else if (rootCauseMetric === 'flights') {
                  displayVal = `${cause.affectedFlights} sefer`;
                  progressValue = (cause.affectedFlights / 200) * 100;
                }

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>{cause.name}</span>
                      <span className="font-mono text-slate-950 font-extrabold">{displayVal}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-400' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, progressValue))}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 italic mt-4 border-t border-slate-100 pt-2 flex justify-between font-semibold">
            <span>* Kaynak: Pegasus DCS SLA Raporları</span>
            <span>IATA Delay Code Compliance Active</span>
          </div>
        </div>

      </div>

      {/* SECTION 5: SERVICE PERFORMANCE ANALYTICS */}
      <ServicePerformance />

      {/* THREE MODULE CONTAINER COZY GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* SECTION 3: LIVE APRON MONITORING (TABLE & FILTERS) */}
        <section id="live-apron-monitoring" className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
                <Activity className="w-4 h-4 text-slate-800" />
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                  Live Apron Turnaround Process Monitoring
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Uçuşlar gecikme riskine göre sıralanmaktadır. Tercih durumunda SLA şablon filtrelemesi üst kısımdan yapılabilir.
                </p>
              </div>
            </div>
          </div>

          {/* TABLE FILTERS */}
          <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-2.5">
            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">HUB</label>
              <div className="bg-white border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-500 font-mono select-none">
                {activeHub} (Locked)
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Destination</label>
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value as any)}
                className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">Tümü (All)</option>
                <option value="SAW">SAW (Istanbul)</option>
                <option value="ADB">ADB (Izmir)</option>
                <option value="AYT">AYT (Antalya)</option>
                <option value="BER">BER (Berlin)</option>
                <option value="CGN">CGN (Cologne)</option>
                <option value="FRA">FRA (Frankfurt)</option>
                <option value="MUC">MUC (Munich)</option>
              </select>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">A/C Tipi</label>
              <select
                value={aircraftFilter}
                onChange={(e) => setAircraftFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">Tümü (All)</option>
                <option value="B738">Boeing 737-800</option>
                <option value="A320">Airbus A320</option>
                <option value="A20N">Airbus A20N</option>
                <option value="A321">Airbus A321</option>
              </select>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">GT Tipi</label>
              <select
                value={gtTypeFilter}
                onChange={(e) => setGtTypeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">Tümü (All)</option>
                <option value="Turnaround">Turnaround</option>
                <option value="Departure">Departure</option>
              </select>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Hat Türü</label>
              <select
                value={flightTypeFilter}
                onChange={(e) => setFlightTypeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 px-2 py-1 rounded text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">Tümü (All)</option>
                <option value="Domestic">Yurtiçi (Dom)</option>
                <option value="International">Yurtdışı (Int)</option>
              </select>
            </div>
          </div>

          {/* LIVE FLIGHTS TABLE */}
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto overflow-y-auto max-h-[460px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 font-bold uppercase text-[9px] tracking-wider select-none sticky top-0 z-10">
                    <td className="py-3 px-4 text-white">Flight & Tail</td>
                    <td className="py-3 px-2 text-white">Station</td>
                    <td className="py-3 px-2 text-white text-center">GT Target</td>
                    <td className="py-3 px-2 text-white text-center">Elapsed GT</td>
                    <td className="py-3 px-2 text-white text-center">Remaining GT</td>
                    <td className="py-3 px-2 text-white">Active Service</td>
                    <td className="py-3 px-2 text-white text-center">SLA Compliance</td>
                    <td className="py-3 px-3 text-white text-right">Status</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 bg-white">
                  {processedFlights.length > 0 ? (
                    processedFlights.map((flight) => {
                      const isSelected = selectedFlight?.id === flight.id;
                      
                      let statusText = '';
                      let badgeColors = '';
                      if (flight.status === 'Delayed') {
                        statusText = 'DELAYED';
                        badgeColors = 'bg-red-50 text-red-650 border-red-150 text-red-650 font-extrabold border-red-200';
                      } else if (flight.status === 'Critical') {
                        statusText = 'CRITICAL';
                        badgeColors = 'bg-orange-50 text-orange-700 border-orange-150 animate-pulse font-extrabold border-orange-200';
                      } else if (flight.status === 'At Risk') {
                        statusText = 'AT RISK';
                        badgeColors = 'bg-amber-50 text-amber-700 border-amber-150 border-amber-200 font-extrabold';
                      } else {
                        statusText = 'ON TARGET';
                        badgeColors = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-extrabold';
                      }

                      return (
                        <tr
                           key={flight.id}
                           id={`flight-row-${flight.id}`}
                           onClick={() => {
                             setSelectedFlight(flight);
                             setClickedService(null);
                           }}
                           className={`hover:bg-slate-50 cursor-pointer transition-all ${
                             isSelected ? 'bg-yellow-50/50 border-l-4 border-l-[#FFCC00] font-semibold' : 'border-l-4 border-transparent'
                           }`}
                        >
                          <td className="py-3 px-4">
                            <div>
                              <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                                {flight.flightNumber}
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1 rounded uppercase tracking-wide">{flight.flightType}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block leading-none mt-0.5">{flight.tailNumber} ({flight.aircraftType})</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-600 font-bold uppercase">
                            {flight.station}➔{flight.destination}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-slate-800 font-mono">
                            {flight.gtTarget} dk
                          </td>
                          <td className="py-3 px-2 text-center font-mono">
                            <span className={`font-extrabold ${flight.elapsedGt > flight.gtTarget ? 'text-red-500 font-black' : 'text-slate-800'}`}>
                              {flight.elapsedGt} dk
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-mono">
                            <span className={`font-bold ${flight.remainingGt === 0 ? 'text-red-600 font-black italic' : 'text-slate-500'}`}>
                              {flight.remainingGt > 0 ? `${flight.remainingGt} dk` : 'LATED'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700 max-w-[130px] truncate" title={flight.currentService}>
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                              <span className="truncate">{flight.currentService}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-black">
                            <span className={flight.delayRiskPercentage >= 80 ? 'text-red-500' : flight.delayRiskPercentage >= 60 ? 'text-orange-500' : 'text-slate-700'}>
                              %{100 - flight.delayRiskPercentage}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block px-1.5 py-0.2 rounded border text-[9px] tracking-wide uppercase ${badgeColors}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-bold italic">
                        Filtrelere uygun turnaround uçuş listelenemedi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-150 p-3 rounded-xl text-[11px] text-blue-800 leading-snug flex items-start gap-2 select-none font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>Herhangi bir uçuş satırına tıklayarak alt kısımdaki <strong>Gantt Servis Çizelgesi</strong>'ni ve <strong>Darboğaz Monitorü</strong>'nü saniyeler içerisinde güncelleyebilirsiniz.</p>
          </div>
        </section>

        {/* Dynamic vertical panel */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* SECTION 4: PREDICTED GT VIOLATIONS */}
          <section id="predicted-gt-violations" className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-950/80 border border-blue-900 text-blue-400 rounded-lg shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </span>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                  predicted GT violations
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Servislerin anlık rampa sürelerine göre gecikme analizör tahmini.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {flights.filter(f => f.station === activeHub && f.status !== 'On Target').slice(0, 3).map((f) => {
                const isSelected = selectedFlight?.id === f.id;
                const riskColor = f.delayRiskPercentage >= 80 ? 'text-red-400 bg-red-950/40 border-red-900/30' : 'text-amber-400 bg-amber-950/40 border-amber-900/30';

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFlight(f)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#FFCC00] bg-slate-800' 
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-extrabold text-xs text-white block leading-none">
                          {f.flightNumber}
                          <span className="text-[9px] font-mono font-bold text-slate-500 ml-1.5">({f.tailNumber})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-2 font-bold leading-none">
                          Aşama: {f.currentService}
                        </span>
                      </div>

                      <div className={`px-1.5 py-0.2 rounded border font-mono font-extrabold text-[9.5px] leading-none shrink-0 ${riskColor}`}>
                        %{f.delayRiskPercentage} Risk
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2.5 border-t border-slate-800 pt-2 italic flex items-start gap-1 leading-normal">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                      <span>{f.riskFactor}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 7: CRITICAL PATH BOTTLENECK MONITOR */}
          <section id="critical-path-monitor" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg shrink-0 border border-rose-200">
                <Workflow className="w-4 h-4 text-rose-600" />
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
                  Critical path bottleneck monitor
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Seçili <strong>{selectedFlight?.flightNumber || 'Uçuş'}</strong> için rampa critical path darboğazları.
                </p>
              </div>
            </div>

            {/* Path flow sequence UI */}
            <div className="space-y-3 relative pl-4 border-l-2 border-slate-150 select-none">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700">Bridge Connection (Körük Bağlantısı)</h4>
                  <p className="text-[10px] text-emerald-600 font-mono font-bold">✓ Tamamlandı (0m - 2m)</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700">De-Boarding (Yolcu İniş Tamamlanışı)</h4>
                  <p className="text-[10px] text-emerald-600 font-mono font-bold">✓ Tamamlandı (2m - 9m)</p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                  selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Fuelling') 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-emerald-500'
                }`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-[11px] font-bold ${
                      selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Fuelling') ? 'text-red-750 font-extrabold' : 'text-slate-700'
                    }`}>
                      Fuelling (Yakıt İkmali)
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-snug">
                    {selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Fuelling') 
                      ? '⚠ Yakıt ikmali uçağın sol park geçişi rampa gecikmesiyle tıkandı.' 
                      : '✓ Yakıt ikmali standart buffer tanziminde.'}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                  selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Embarking') 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-slate-300'
                }`} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-[11px] font-bold ${
                      selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Embarking') ? 'text-red-750 font-black' : 'text-slate-500'
                    }`}>
                      Passenger Boarding (Yolcu Alımı)
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    {selectedFlight?.status !== 'On Target' && selectedFlight?.currentService.includes('Embarking') 
                      ? `⚠ Geç temizlik onayı yolcu biniş kapısını kilitledi.`
                      : 'Kabin onayı verildikten sonra biniş başlayacaktır.'}
                  </p>
                </div>
              </div>
            </div>

            {selectedFlight?.status !== 'On Target' ? (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-[10.5px] text-red-800 leading-normal flex gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Darboğaz Teşhisi:</strong> {selectedFlight?.currentService} rampa akışını engellemektedir. De-boarding gecikmesi rampa buffer payını eritmiştir.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[10.5px] text-emerald-800 leading-normal flex gap-2 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  Tüm turnaround operasyonel aşamaları nominal tolerans aralığında. Kök gecikme uyarısı bulunmamaktadır.
                </p>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* SECTION 9: AUTOMATION EFFECTIVENESS */}
      <AutomationEffectiveness />

      {/* SECTION 10: FINANCIAL IMPACT CENTER */}
      <FinancialSimulator />

      {/* SECTION 11: GROUND TIME GANTT TIMELINE & PREDECESSOR COLUMN LIST */}
      {selectedFlight && (
        <section id="ground-time-service-timeline" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-105 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FFCC00]/10 text-slate-900 rounded-lg shrink-0 border border-[#FFCC00]/25">
                <Workflow className="w-4 h-4 text-slate-800" />
              </span>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none bg-white">
                  Ground Time Gantt Servis Çizelgesi & Predecessor Akışı
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Seçili <strong>{selectedFlight.flightNumber}</strong> uçağının sıfırıncı (0.) dakikadan başlayan bağımlılık süreç analizi.
                </p>
              </div>
            </div>
            
            <div className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold leading-none select-none">
              Süreç Limiti: {selectedFlight.gtTarget} dk
            </div>
          </div>

          {/* Grid Layout Representing Name columns + Visual Timeline Area */}
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-2xs bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[850px] relative">
                
                {/* Headers */}
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-400 uppercase tracking-wider py-2 px-3 select-none">
                  <div className="col-span-4 py-0.5">Servis İsmi & Planlanan Süre</div>
                  <div className="col-span-2 text-center border-l border-slate-200 py-0.5">Predecessor (Öncül)</div>
                  <div className="col-span-1 text-center border-l border-slate-200 py-0.5">İlişki Türü</div>
                  <div className="col-span-5 relative border-l border-slate-200 py-0.5 pr-2 pl-4">
                    {/* Tick labels */}
                    <div className="flex justify-between font-mono text-[9px] font-bold text-slate-400 select-none">
                      {Array.from({ length: 11 }, (_, i) => Math.round((maxTimelineMinutes / 10) * i)).map((tick, tIdx) => (
                        <div 
                          key={tIdx} 
                          className="absolute text-center transform -translate-x-1/2"
                          style={{ left: `${(tick / maxTimelineMinutes) * 100}%` }}
                        >
                          <span className={tick === selectedFlight.gtTarget ? 'text-amber-600 font-black' : ''}>
                            {tick} dk
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rows List */}
                <div className="divide-y divide-slate-150 py-1.5 relative">
                  
                  {/* Vertical separator tick guidelines */}
                  <div className="absolute inset-y-0 left-[58.333333%] right-0 pointer-events-none flex justify-between z-0">
                    {Array.from({ length: 11 }, (_, i) => Math.round((maxTimelineMinutes / 10) * i)).map((tick, tIdx) => (
                      <div 
                        key={tIdx} 
                        className={`h-full border-r border-dashed ${tick === selectedFlight.gtTarget ? 'border-amber-400 w-[2px]' : 'border-slate-100'}`}
                        style={{ left: `${(tick / maxTimelineMinutes) * 100}%` }}
                      />
                    ))}
                  </div>

                  {/* Vertical overall GT target deadline line */}
                  <div 
                    className="absolute top-0 bottom-0 border-l-2 border-[#FFCC00] z-20 pointer-events-none"
                    style={{ left: `calc(58.333333% + ${((selectedFlight.gtTarget / maxTimelineMinutes) * 41.666667)}%)` }}
                    title="GT Target Deadline Limit"
                  />

                  {dynamicGanttServices.map((service) => {
                    const isServiceSelected = clickedService?.id === service.id;
                    
                    const barLeft = (service.plannedStart / maxTimelineMinutes) * 100;
                    const barWidth = (service.baseDuration / maxTimelineMinutes) * 100;

                    const flexLeft = (service.flexibleStart / maxTimelineMinutes) * 100;
                    const flexWidth = ((service.flexibleFinish - service.flexibleStart) / maxTimelineMinutes) * 100;

                    let serviceColor = 'bg-blue-500 border-blue-600';
                    let relationBadgeColor = 'bg-slate-105 text-slate-500 bg-slate-100';

                    if (service.id === 'gs-2') serviceColor = 'bg-red-500 border-red-600';
                    if (service.id === 'gs-3') serviceColor = 'bg-[#FFCC00] border-yellow-500 text-slate-900';
                    if (service.id === 'gs-8' || service.id === 'gs-9') serviceColor = 'bg-emerald-500 border-emerald-600';

                    if (service.relationType === 'FS') relationBadgeColor = 'bg-red-50 text-red-600 border border-red-100';
                    if (service.relationType === 'SS') relationBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';

                    return (
                      <div 
                        key={service.id}
                        id={`gantt-service-row-${service.id}`}
                        onClick={() => setClickedService(service)}
                        className={`grid grid-cols-12 items-center px-3 py-2.5 transition-colors cursor-pointer relative bg-transparent ${
                          isServiceSelected ? 'bg-yellow-50/20 font-bold border-l-4 border-l-[#FFCC00] pl-2' : 'hover:bg-slate-50 border-l-4 border-transparent'
                        }`}
                      >
                        
                        {/* Column 1: Name and base duration info key */}
                        <div className="col-span-4 z-10">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-800 tracking-tight leading-none">
                              {service.name}
                            </span>
                            {service.isCritical && (
                              <span className="bg-red-50 text-red-600 text-[8px] font-extrabold px-1 rounded border border-red-150 uppercase tracking-widest select-none">
                                critical path
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono mt-1 font-semibold leading-none">
                            Plan: {service.plannedStart}. dk - {service.plannedFinish}. dk ({service.baseDuration} dk)
                          </span>
                        </div>

                        {/* Column 2: Predecessor badge (No curved lines!) */}
                        <div className="col-span-2 text-center px-1 border-l border-slate-100 z-10">
                          {service.predecessor !== '—' ? (
                            <span className="inline-block bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded font-mono font-bold max-w-[120px] truncate" title={service.predecessor}>
                              {service.predecessor}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic font-medium">Kök İşlem</span>
                          )}
                        </div>

                        {/* Column 3: Relation type */}
                        <div className="col-span-1 text-center px-1 border-l border-slate-100 z-10 flex justify-center">
                          {service.relationType !== 'none' ? (
                            <span className={`inline-block text-[9px] px-2 py-0.2 rounded font-mono font-extrabold shadow-3xs uppercase ${relationBadgeColor}`}>
                              {service.relationType}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic font-medium">—</span>
                          )}
                        </div>

                        {/* Column 4: Timeline bars */}
                        <div className="col-span-5 relative h-9 border-l border-slate-100 flex items-center pr-2 bg-transparent z-10">
                          
                          {/* Shaded Allowed esneklik penceresi (Flexible slack/slack window) */}
                          {flexWidth > 0 && (
                            <div
                              className="absolute h-3.5 rounded-sm bg-slate-100 border border-dashed border-slate-200 select-none opacity-90"
                              style={{
                                left: `${flexLeft}%`,
                                width: `${flexWidth}%`
                              }}
                              title={`Tolerans Sınırı: ${service.flexibleStart}dk - ${service.flexibleFinish}dk`}
                            />
                          )}

                          {/* Planned Task duration bar (Matches exact start / end) */}
                          <div
                            className={`absolute h-4 rounded text-[9px] text-white font-extrabold flex items-center justify-center shadow-3xs cursor-pointer select-none transition-transform hover:scale-y-112 ${serviceColor}`}
                            style={{
                              left: `${barLeft}%`,
                              width: `${barWidth}%`
                            }}
                          >
                            <span className="truncate px-1 opacity-0 hover:opacity-100 transition-opacity">
                              {service.baseDuration}dk
                            </span>
                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>
            </div>

            {/* Bottom Timeline Legend */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-slate-500">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Göstergeler:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-500" />
                <span>Aircraft / Ops Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#FFCC00]" />
                <span className="text-slate-800">Fuelling Services</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                <span>Passenger Boarding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-500" />
                <span>De-boarding / Critical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-dashed border-slate-200" />
                <span>Flexible Windows (Süreç Tolerans Sınırı)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-[#FFCC00]" />
                <span className="text-[#DD8800] font-black uppercase">SLA Target Limit</span>
              </div>
            </div>
          </div>

          {/* Drilldown Service details metadata popup */}
          <AnimatePresence>
            {clickedService && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-slate-900 text-slate-100 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-start"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-500 rounded text-[9px] font-black uppercase tracking-tight text-white leading-none">Süreç Bilgisi</span>
                    <strong className="text-sm text-white tracking-tight leading-none block">{clickedService.name}</strong>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block font-sans text-[10px]">Plan Başlangıç:</span>
                      <strong className="text-white text-xs">{clickedService.plannedStart}. dakika</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans text-[10px]">Plan Bitiş:</span>
                      <strong className="text-white text-xs">{clickedService.plannedFinish}. dakika</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans text-[10px]">Tolerans Limit:</span>
                      <strong className="text-blue-300 text-xs">{clickedService.flexibleFinish}. dakika</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-sans text-[10px]">Kritik Yol:</span>
                      <strong className={clickedService.isCritical ? 'text-red-400 font-extrabold text-xs' : 'text-slate-400 text-xs'}>
                        {clickedService.isCritical ? 'Evet (Kritik)' : 'Hayır (Düşük)'}
                      </strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setClickedService(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700/80 rounded text-[11px] font-bold transition-colors text-slate-200 cursor-pointer border border-slate-700 self-end md:self-auto"
                >
                  Kapat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

    </div>
  );
};
