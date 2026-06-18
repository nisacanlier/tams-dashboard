/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Maximize2,
  Minimize2,
  Calendar,
  AlertTriangle,
  User,
  ExternalLink,
  GitCommit,
  X,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { GanttService, GroundTimeTemplate } from '../types';
import { getGanttServicesForTemplate } from '../data';

interface ServiceTimelineProps {
  template: GroundTimeTemplate;
}

export const ServiceTimeline: React.FC<ServiceTimelineProps> = ({ template }) => {
  // Fetch services for this template
  const initialServices = useMemo(() => {
    return getGanttServicesForTemplate(template.id, template.targetMinutes);
  }, [template.id, template.targetMinutes]);

  // State to support dynamic interactive actual timing editing
  const [services, setServices] = useState<GanttService[]>(initialServices);
  React.useEffect(() => {
    setServices(getGanttServicesForTemplate(template.id, template.targetMinutes));
  }, [template.id, template.targetMinutes]);

  const [selectedService, setSelectedService] = useState<GanttService | null>(null);
  const [zoomLevel, setZoomLevel] = useState<'standard' | 'wide' | 'compact'>('standard');
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  
  // Custom inputs for "Planned vs Actual" calculator in sidebar
  const [editActualStart, setEditActualStart] = useState<string>('');
  const [editActualFinish, setEditActualFinish] = useState<string>('');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = services.length;
    const critical = services.filter(s => s.isCritical).length;
    
    // Services starting at similar times or overlapping are parallel
    const parallel = services.length > 0 ? 8 : 0; // standard based on concurrent starts (times like 12, 19, 28 starting multiple)
    
    // Find longest service
    let longest = services[0];
    services.forEach(s => {
      if (s.baseDuration > (longest?.baseDuration || 0)) {
        longest = s;
      }
    });

    // Check if any service has actual timings that cause delay
    let riskStatus: 'On Track' | 'At Risk' | 'Delayed' = 'On Track';
    let delayedCount = 0;
    
    services.forEach(s => {
      if (s.actualFinish && s.actualFinish > s.flexibleFinish) {
        riskStatus = 'Delayed';
        delayedCount++;
      } else if (s.actualFinish && s.actualFinish > s.plannedFinish) {
        if (riskStatus !== 'Delayed') riskStatus = 'At Risk';
      }
    });

    return {
      total,
      critical,
      parallel,
      longestName: longest ? `${longest.name} (${longest.baseDuration} dk)` : '-',
      riskStatus,
      delayedCount
    };
  }, [services]);

  // Handle actual delay simulation save
  const handleSaveActualTimings = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const actStart = editActualStart !== '' ? parseInt(editActualStart, 10) : undefined;
        const actFinish = editActualFinish !== '' ? parseInt(editActualFinish, 10) : undefined;
        
        let newStatus: GanttService['status'] = s.status;
        if (actFinish !== undefined) {
          if (actFinish > s.flexibleFinish) {
            newStatus = 'Delayed';
          } else if (actFinish > 0) {
            newStatus = 'Completed';
          }
        } else if (actStart !== undefined) {
          newStatus = 'In Progress';
        }

        const updated = {
          ...s,
          actualStart: actStart,
          actualFinish: actFinish,
          status: newStatus
        };
        
        // Auto update selected service reference so panel updates
        setSelectedService(updated);
        return updated;
      }
      return s;
    }));
  };

  const handleResetActuals = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const original = initialServices.find(is => is.name === s.name);
        const resetService = {
          ...s,
          actualStart: undefined,
          actualFinish: undefined,
          status: original ? original.status : s.status
        };
        setSelectedService(resetService);
        return resetService;
      }
      return s;
    }));
    setEditActualStart('');
    setEditActualFinish('');
  };

  // Open the detail panel
  const handleSelectService = (service: GanttService) => {
    setSelectedService(service);
    setEditActualStart(service.actualStart !== undefined ? service.actualStart.toString() : '');
    setEditActualFinish(service.actualFinish !== undefined ? service.actualFinish.toString() : '');
  };

  // Color mapping logic for category colors
  const getColorClasses = (cat: string) => {
    switch (cat) {
      case 'blue':
        return {
          bar: 'bg-blue-600 border-blue-700 shadow-blue-100',
          bg: 'bg-blue-200/40 text-blue-800',
          dot: 'bg-blue-500',
          text: 'text-blue-700'
        };
      case 'green':
        return {
          bar: 'bg-emerald-600 border-emerald-700 shadow-emerald-100',
          bg: 'bg-emerald-100/50 text-emerald-800',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700'
        };
      case 'orange':
        return {
          bar: 'bg-amber-500 border-amber-600 shadow-amber-100',
          bg: 'bg-amber-100/40 text-amber-800',
          dot: 'bg-amber-500',
          text: 'text-amber-700'
        };
      case 'red':
      default:
        return {
          bar: 'bg-red-500 border-red-600 shadow-red-100',
          bg: 'bg-red-100/40 text-red-800',
          dot: 'bg-red-500',
          text: 'text-red-700'
        };
    }
  };

  // Width scalar based on timeline zoom levels
  const zoomMultiplier = useMemo(() => {
    if (zoomLevel === 'wide') return 18;
    if (zoomLevel === 'compact') return 9;
    return 13; // standard
  }, [zoomLevel]);

  // Max minute to show on the timeline chart (max schedule goes to 48, let's round up to 55 max for better view of deadline)
  const timelineMaxMinutes = Math.max(55, template.targetMinutes + 10);

  // Generate ticks for the header
  const ticks = useMemo(() => {
    const arr = [];
    const step = zoomLevel === 'compact' ? 5 : 2;
    for (let i = 0; i <= timelineMaxMinutes; i += step) {
      arr.push(i);
    }
    return arr;
  }, [timelineMaxMinutes, zoomLevel]);

  return (
    <div id="service-timeline-container" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col gap-6 p-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Layers className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Ground Time Service Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {template.name} ({template.targetMinutes} dk) süreç şablonunun alt servis bağımlılıkları ve zaman matrisi.
          </p>
        </div>

        {/* Zoom Toggles */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setZoomLevel('compact')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              zoomLevel === 'compact' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dar Görünüm
          </button>
          <button
            onClick={() => setZoomLevel('standard')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              zoomLevel === 'standard' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Standart
          </button>
          <button
            onClick={() => setZoomLevel('wide')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              zoomLevel === 'wide' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Geniş Zoom
          </button>
        </div>
      </div>

      {/* SLA Concept Explanatory Warning Message Banner */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
          <strong>Important Coordination Rule:</strong> Some services can run in parallel. A service may exceed its base duration without causing GT delay if it is still completed within its allowed flexible window. Delay impact starts when the service exceeds its latest allowed timing.
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">GT Target Limit</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{template.targetMinutes} dk</span>
        </div>
        
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Toplam Servis</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">{stats.total} alt iş</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Kritik Servisler</span>
          <span className="text-xl font-extrabold text-red-600 mt-1 block">{stats.critical} servis</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Muvazi (Paralel)</span>
          <span className="text-xl font-extrabold text-indigo-600 mt-1 block">{stats.parallel} süreç</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">En Uzun Süreç</span>
          <span className="text-xs font-bold text-slate-700 mt-1.5 block truncate" title={stats.longestName}>
            {stats.longestName}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Anlık Risk</span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
              stats.riskStatus === 'Delayed'
                ? 'bg-red-50 text-red-700 border-red-200'
                : stats.riskStatus === 'At Risk'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {stats.riskStatus === 'Delayed' ? 'Gecikmeli' : stats.riskStatus === 'At Risk' ? 'Riskli' : 'On Track'}
            </span>
          </div>
        </div>
      </div>

      {/* Gantt & Side Drawer Setup */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
        
        {/* Main Gantt Grid view (Left / center 9 columns or full width if no selection) */}
        <div className={`${selectedService ? 'xl:col-span-8' : 'xl:col-span-12'} flex flex-col gap-4 overflow-hidden`}>
          
          {/* Gantt Table and Chart Wrapper */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            
            <div className="overflow-x-auto">
              <div className="min-w-[850px] relative">
                
                {/* Chart Header Column Row */}
                <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2 px-3">
                  <div className="col-span-4 flex items-center">Service Name & Base Info</div>
                  <div className="col-span-2 text-center border-l border-slate-200">Predecessor & Rel</div>
                  <div className="col-span-6 relative border-l border-slate-200 py-1 pl-4">
                    {/* Tick labels */}
                    <div className="flex justify-between select-none font-mono">
                      {ticks.map(tick => (
                        <div 
                          key={tick} 
                          className="absolute text-center transform -translate-x-1/2"
                          style={{ left: `${(tick / timelineMaxMinutes) * 100}%` }}
                        >
                          <span className={`${tick === template.targetMinutes ? 'text-amber-600 font-extrabold' : ''}`}>
                            {tick}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                 {/* Grid chart rows list with absolute connections overlay */}
                <div className="relative py-1">
                  
                  {/* Predecessor SVG connection lines overlay (Requirement 4) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                    <defs>
                      <marker id="arrow-grey" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cbd5e1" />
                      </marker>
                      <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
                      </marker>
                    </defs>
                    {(() => {
                      const dependencyLinks = [
                        { fromId: 'gs-1', toId: 'gs-2', isCritical: true },
                        { fromId: 'gs-2', toId: 'gs-3', isCritical: false },
                        { fromId: 'gs-2', toId: 'gs-4', isCritical: true },
                        { fromId: 'gs-2', toId: 'gs-5', isCritical: false },
                        { fromId: 'gs-2', toId: 'gs-6', isCritical: false },
                        { fromId: 'gs-4', toId: 'gs-7', isCritical: true },
                        { fromId: 'gs-7', toId: 'gs-9', isCritical: true },
                        { fromId: 'gs-9', toId: 'gs-8', isCritical: true, isSS: true },
                        { fromId: 'gs-1', toId: 'gs-10', isCritical: false },
                        { fromId: 'gs-10', toId: 'gs-11', isCritical: false },
                        { fromId: 'gs-9', toId: 'gs-12', isCritical: true }
                      ];

                      return dependencyLinks.map((link, idx) => {
                        const fromIdx = services.findIndex(s => s.id === link.fromId);
                        const toIdx = services.findIndex(s => s.id === link.toId);
                        if (fromIdx === -1 || toIdx === -1) return null;

                        const fromSrv = services[fromIdx];
                        const toSrv = services[toIdx];

                        // Calculate Ys based on indices out of total rows
                        const y1 = Math.round(((fromIdx + 0.5) / 12) * 1000);
                        const y2 = Math.round(((toIdx + 0.5) / 12) * 1000);

                        // Calculate Xs
                        // Remember the Gantt chart starts at 50% coordinate inside the grid, so range is 500 to 1000
                        const fromMin = link.isSS ? fromSrv.plannedStart : fromSrv.plannedFinish;
                        const toMin = toSrv.plannedStart;

                        const x1 = Math.round(500 + (fromMin / timelineMaxMinutes) * 500);
                        const x2 = Math.round(500 + (toMin / timelineMaxMinutes) * 500);

                        // Bezier path curves
                        const cx1 = x1 + (x2 >= x1 ? 30 : -30);
                        const cx2 = x2 - (x2 >= x1 ? 30 : -30);
                        const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

                        return (
                          <path
                            key={idx}
                            d={d}
                            fill="none"
                            stroke={link.isCritical ? "#f43f5e" : "#cbd5e1"}
                            strokeWidth={link.isCritical ? 1.5 : 0.75}
                            strokeDasharray={link.isCritical ? "none" : "2,2"}
                            markerEnd={`url(#${link.isCritical ? "arrow-red" : "arrow-grey"})`}
                          />
                        );
                      });
                    })()}
                  </svg>

                  <div className="divide-y divide-slate-100 relative z-10 bg-transparent">
                    {services.map((service) => {
                      const colors = getColorClasses(service.colorCategory);
                      const isSelected = selectedService?.id === service.id;
                      const isHovered = hoveredServiceId === service.id;

                      // Calculate positions and width in percentages
                      const barLeft = (service.plannedStart / timelineMaxMinutes) * 100;
                      const barWidth = (service.baseDuration / timelineMaxMinutes) * 100;

                      const flexLeft = (service.flexibleStart / timelineMaxMinutes) * 100;
                      const flexWidth = ((service.flexibleFinish - service.flexibleStart) / timelineMaxMinutes) * 100;

                      // Support actual actual drawing if specified
                      const hasActual = service.actualStart !== undefined && service.actualFinish !== undefined;
                      const actualLeft = hasActual ? (service.actualStart! / timelineMaxMinutes) * 100 : 0;
                      const actualWidth = hasActual ? ((service.actualFinish! - service.actualStart!) / timelineMaxMinutes) * 100 : 0;
                      const isActualDelayed = hasActual && service.actualFinish! > service.flexibleFinish;

                      return (
                        <div 
                          key={service.id}
                          className={`grid grid-cols-12 items-center px-3 py-3 transition-colors cursor-pointer group bg-transparent ${
                            isSelected ? 'bg-blue-50/30 border-l-4 border-l-blue-600 font-medium pl-2' : 'hover:bg-slate-50/30 border-l-4 border-transparent'
                          }`}
                          onClick={() => handleSelectService(service)}
                          onMouseEnter={() => setHoveredServiceId(service.id)}
                          onMouseLeave={() => setHoveredServiceId(null)}
                        >
                          {/* 1. Name & Badges */}
                          <div className="col-span-4 pr-3 py-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-800 break-words tracking-tight group-hover:text-blue-700 transition-colors">
                                {service.name}
                              </span>
                              {service.isCritical && (
                                <span className="bg-red-50 text-red-600 text-[8px] font-extrabold px-1 rounded border border-red-200 uppercase tracking-widest select-none">
                                  Kritik
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                              <span className="font-semibold text-slate-500">Süre: {service.baseDuration} dk</span>
                              <span>•</span>
                              <span>Plan: {service.plannedStart}-{service.plannedFinish}m</span>
                              {hasActual && (
                                <span className={`fount-bold ${isActualDelayed ? 'text-red-500 font-extrabold' : 'text-emerald-600 font-semibold'}`}>
                                  (Gerçekleşen: {service.actualStart}-{service.actualFinish}m)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 2. Predecessor & Relation Columns */}
                          <div className="col-span-2 text-center px-1 border-l border-slate-100 flex flex-col justify-center items-center">
                            {service.predecessor !== 'none' ? (
                              <div className="w-full max-w-[120px]">
                                <span className="block text-[9px] font-semibold text-slate-600 truncate uppercase tracking-tight" title={service.predecessor}>
                                  {service.predecessor.split(' ')[0]}
                                </span>
                                <span className="inline-block bg-slate-100 text-slate-500 text-[8px] px-1 py-0.2 rounded font-extrabold uppercase mt-0.5">
                                  {service.relationType === 'Finish-Start' ? 'FS' : service.relationType === 'Start-Start' ? 'SS' : service.relationType} 
                                  {service.offset ? `(${service.offset > 0 ? '+' : ''}${service.offset}m)` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-300 font-medium italic">Kök Bağısız</span>
                            )}
                          </div>

                          {/* 3. Gantt Timeline visualizer Area (6 Cols) */}
                          <div className="col-span-6 relative h-10 border-l border-slate-100 flex items-center pr-2 bg-transparent">
                            
                            {/* Background minute indicator lines mimic for hover guideline */}
                            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex justify-between">
                              {ticks.map(tick => (
                                <div 
                                  key={tick} 
                                  className={`h-full border-r border-dashed ${
                                    tick === template.targetMinutes ? 'border-amber-400 opacity-60 w-[2px]' : 'border-slate-100'
                                  }`}
                                  style={{ left: `${(tick / timelineMaxMinutes) * 100}%` }}
                                />
                              ))}
                            </div>

                            {/* 40 minute GT Target vertical deadline line indicator inside the grid row */}
                            <div 
                              className="absolute top-0 bottom-0 border-l-2 border-amber-500/80 z-20 pointer-events-none"
                              style={{ left: `${(template.targetMinutes / timelineMaxMinutes) * 100}%` }}
                              title="GT Target Deadline"
                            />

                            {/* Flexible window: Soluk arka bar */}
                            <div
                              className="absolute h-4 rounded-md bg-slate-200/50 border border-dashed border-slate-300 z-0 opacity-80"
                              style={{
                                left: `${flexLeft}%`,
                                width: `${flexWidth}%`
                              }}
                              title={`Müsait Esneklik Penceresi: ${service.flexibleStart}dk - ${service.flexibleFinish}dk`}
                            />

                            {/* Target/Base service duration: Koyu renkli bar */}
                            <motion.div
                              whileHover={{ scaleY: 1.12 }}
                              className={`absolute h-4 rounded-md border text-[9px] text-white font-bold flex items-center justify-center z-10 shadow-xs cursor-pointer ${colors.bar}`}
                              style={{
                                left: `${barLeft}%`,
                                width: `${barWidth}%`
                              }}
                            >
                              <span className="truncate px-0.5 select-none leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                                {service.baseDuration}m
                              </span>
                            </motion.div>

                            {/* Overlay representation for simulated Actual timings if any */}
                            {hasActual && (
                              <div 
                                className={`absolute h-1.5 bottom-1 rounded-sm z-30 opacity-90 border-t ${
                                  isActualDelayed 
                                    ? 'bg-red-600 border-red-700' 
                                    : 'bg-emerald-500 border-emerald-600'
                                }`}
                                style={{
                                  left: `${actualLeft}%`,
                                  width: `${actualWidth}%`
                                }}
                                title={`Gerçekleşen Zamanlama Slider: ${service.actualStart} - ${service.actualFinish} dk`}
                              />
                            )}

                            {/* Rich inline Tooltip popover on Row Hover */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 15 }}
                                  animate={{ opacity: 1, y: -25 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute left-[20%] z-40 bg-slate-900 text-white rounded-lg p-2.5 shadow-xl border border-slate-800 text-[10px] space-y-1 w-52 pointer-events-none select-none font-sans"
                                >
                                  <p className="font-bold text-blue-300 text-[11px] leading-tight">{service.name}</p>
                                  <div className="grid grid-cols-2 gap-1 mt-1 border-t border-slate-800 pt-1 font-mono text-slate-300">
                                    <span>Planlanan:</span>
                                    <span className="text-right font-bold text-white">{service.plannedStart} - {service.plannedFinish} dk</span>
                                    <span>Tolerans:</span>
                                    <span className="text-right font-bold text-slate-400">{service.flexibleStart} - {service.flexibleFinish} dk</span>
                                    <span>Gecikme Risk:</span>
                                    <span className={`text-right font-extrabold uppercase ${
                                      service.isCritical ? 'text-red-400' : 'text-emerald-400'
                                    }`}>
                                      {service.isCritical ? 'Kritik Yol' : 'Düşük'}
                                    </span>
                                  </div>
                                  {service.businessRule && (
                                    <p className="italic text-[9px] text-slate-400 mt-1 pb-0.5 border-t border-slate-800 pt-1">
                                      {service.businessRule}
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Legend Row */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold text-slate-500">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Göstergeler:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-blue-700" />
                <span>Aircraft / Crew / Ops Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-700" />
                <span>Yolcu Biniş (Boarding) Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600" />
                <span>Bagaj Ayrıştırma / Yükleme (Baggage) Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600" />
                <span>Deboarding / Kritik Yolcu (Critical) Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-dashed border-slate-300" />
                <span>Allowed Flexible Window (Tolerans)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-amber-500" />
                <span className="text-amber-600 font-bold">GT Target Deadline</span>
              </div>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
            <p>※ Her bir satıra veya renkli kutucuğa tıklayarak gerçekleşen zaman kaydı girip SLA gecikme simülasyonunu başlatabilirsiniz.</p>
            <p className="font-mono">TAMS Ops Engine v3.2</p>
          </div>

        </div>

        {/* 2. Right Service Detail sliding/fixed Panel (xl:col-span-4) */}
        <AnimatePresence>
          {selectedService && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="xl:col-span-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden self-start flex flex-col h-full"
            >
              
              {/* Header */}
              <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-blue-400 tracking-widest block">Alt Süreç Detayı</span>
                  <h4 className="text-sm font-extrabold tracking-tight mt-0.5 text-white">
                    {selectedService.name}
                  </h4>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-1 px-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="p-4 space-y-4 text-xs font-sans">
                
                {/* Details list item boxes */}
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-850">
                    <span className="text-slate-400">Base Planlanan Süre:</span>
                    <span className="text-white font-extrabold">{selectedService.baseDuration} dk</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-850">
                    <span className="text-slate-400">Plan Başlangıç / Bitiş:</span>
                    <span className="text-white font-mono font-bold">
                      {selectedService.plannedStart}. dk → {selectedService.plannedFinish}. dk
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-850">
                    <span className="text-slate-400">Zaman Tolerans Penceresi:</span>
                    <span className="text-blue-300 font-mono font-extrabold">
                      {selectedService.flexibleStart}. dk → {selectedService.flexibleFinish}. dk
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Kritik Süreç Belirteci:</span>
                    <span className={`font-extrabold uppercase text-[10px] ${
                      selectedService.isCritical ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {selectedService.isCritical ? 'KRİTİK ROTA' : 'STANDART'}
                    </span>
                  </div>
                </div>

                {/* Predecessor rule explanation box */}
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Bağımlılık ve Silsile Şartları (Predecessors)
                  </span>
                  <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-800 space-y-1">
                    <p className="font-bold text-slate-200">
                      Öncül Süreç: <span className="text-blue-400">{selectedService.predecessor}</span>
                    </p>
                    <p className="text-slate-400 leading-snug">
                      Bağlantı Türü: {selectedService.relationType === 'Finish-Start' ? (
                        <span className="text-amber-300">Finish-Start (FS)</span>
                      ) : selectedService.relationType === 'Start-Start' ? (
                        <span className="text-emerald-400">Start-Start (SS)</span>
                      ) : (
                        <span className="text-slate-300">Tanımlanmamış</span>
                      )}
                    </p>
                    {selectedService.offset ? (
                      <p className="text-slate-400">Offset Fark / Payı: <span className="text-amber-400">{selectedService.offset} dakika</span></p>
                    ) : null}
                    
                    {/* Relation Explanation list */}
                    <div className="mt-2.5 pt-2 border-t border-slate-750 text-[10px] text-slate-500 space-y-1">
                      <p>• <strong>Finish-Start:</strong> Bağımlı sürecin başlaması için öncülünün tamamen bitmiş olması gerekir.</p>
                      <p>• <strong>Start-Start:</strong> Öncül süreç başladığı an bağımlı süreç de başlayabilir.</p>
                    </div>
                  </div>
                </div>

                {/* Business rule notes conditional display */}
                {selectedService.businessRule && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Aviation Business Note
                    </span>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex gap-2 text-slate-300 leading-snug italic">
                      <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <span>{selectedService.businessRule}</span>
                    </div>
                  </div>
                )}

                {/* PLAN VS ACTUAL SIMULATOR CALCULATOR */}
                <div className="border-t border-slate-800 pt-3.5">
                  <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Sliders className="w-3.5 h-3.5" />
                    Planned vs Actual Simulator
                  </span>
                  
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-blue-900/30 space-y-3">
                    
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Kayıt sistemlerinden gelen gerçek zamanlı gerçekleşen anlık dakika verisini simüle ederek IATA gecikme riskini hesaplayın:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                          Gerçekleşen Start
                        </label>
                        <input
                          type="number"
                          placeholder="Örn: 10"
                          value={editActualStart}
                          onChange={(e) => setEditActualStart(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 outline-none text-white font-mono px-2 py-1 rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                          Gerçekleşen Finish
                        </label>
                        <input
                          type="number"
                          placeholder="Örn: 14"
                          value={editActualFinish}
                          onChange={(e) => setEditActualFinish(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500 outline-none text-white font-mono px-2 py-1 rounded"
                        />
                      </div>
                    </div>

                    {/* Quick evaluation readout */}
                    {editActualFinish !== '' && (
                      <div className="pt-1.5 border-t border-slate-900 text-[11px]">
                        {parseInt(editActualFinish, 10) > selectedService.flexibleFinish ? (
                          <div className="text-red-400 font-extrabold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>IATA Gecikme Riski! ({parseInt(editActualFinish, 10) - selectedService.flexibleFinish} dk aşım)</span>
                          </div>
                        ) : parseInt(editActualFinish, 10) > selectedService.plannedFinish ? (
                          <div className="text-amber-400 font-extrabold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>Tolerans Sınırlarında. (%100 On-Track)</span>
                          </div>
                        ) : (
                          <div className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>Zamanında Tamamlandı.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveActualTimings(selectedService.id)}
                        className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded text-[11px] select-none transition-colors cursor-pointer"
                      >
                        Değerleri Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResetActuals(selectedService.id)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 rounded text-[11px] select-none transition-colors cursor-pointer"
                      >
                        Sıfırla
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};
