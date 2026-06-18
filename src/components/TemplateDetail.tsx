/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  Layers, 
  FileText, 
  Tag, 
  CheckCircle2, 
  Settings2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { GroundTimeTemplate } from '../types';

interface TemplateDetailProps {
  template: GroundTimeTemplate | null;
  hubCity: string;
}

export const TemplateDetail: React.FC<TemplateDetailProps> = ({
  template,
  hubCity,
}) => {
  if (!template) {
    return (
      <div id="no-template-selected-detail" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100 mb-4 animate-pulse">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Şablon Seçilmedi</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-normal">
          Ground Time kurallarını, uçuş koşulu detaylarını ve servis dağılımını görmek için sol/orta tablodan bir şablon seçin.
        </p>
      </div>
    );
  }

  // Determine standard reference level for high or fast turnaround speeds
  const speedRating = template.targetMinutes <= 40 
    ? { text: 'Yüksek Hızlı', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
    : template.targetMinutes <= 50
    ? { text: 'Standart Dönüş', color: 'text-blue-600 bg-blue-50 border-blue-100' }
    : { text: 'Genişletilmiş Hazırlık', color: 'text-amber-700 bg-amber-50 border-amber-100' };

  return (
    <motion.div
      id="template-detail-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col h-full"
    >
      {/* Flight Pass / Ticket Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-10 -mt-10 pointer-events-none" />
        
        {/* Hub Title Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{template.hub} / {hubCity}</span>
          </div>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${speedRating.color}`}>
            {speedRating.text}
          </span>
        </div>

        <h3 className="text-base font-extrabold tracking-tight leading-tight mb-2 flex items-center gap-2">
          <Plane className="w-5 h-5 text-indigo-400 shrink-0" />
          {template.name}
        </h3>
        
        <p className="text-xs text-slate-300 leading-normal font-light">
          {template.description}
        </p>
      </div>

      {/* Ticket Tear Indicator Line */}
      <div className="relative flex items-center justify-between px-3 h-4 bg-slate-50/50">
        <div className="w-4 h-4 rounded-full bg-slate-100 border-r border-slate-200/50 -ml-5" />
        <div className="w-full border-t border-dashed border-slate-200" />
        <div className="w-4 h-4 rounded-full bg-slate-100 border-l border-slate-200/50 -mr-5" />
      </div>

      {/* Details Area */}
      <div className="p-5 flex-1 flex flex-col gap-5 bg-slate-50/30">
        <h4 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Operasyonel Parametreler
        </h4>

        {/* Target Time Accent Block */}
        <div className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">Hedef Ground Time</span>
              <span className="text-sm font-bold text-slate-800">Target Operation Limit</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600 tracking-tight leading-none">
              {template.targetMinutes}
            </span>
            <span className="text-xs font-bold text-blue-600 ml-1">dk</span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="grid grid-cols-1 gap-3 text-[11px]">
          {/* GT Type */}
          <div className="flex items-start justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Süreç Modeli</span>
                <span className="text-slate-800 font-bold text-xs mt-0.5 block">
                  {template.gtType === 'Turnaround' ? 'Turnaround (Geliş-Gidiş)' : 'Departure (Sadece Gidiş)'}
                </span>
              </div>
            </div>
          </div>

          {/* Flight Type Rule */}
          <div className="flex items-start justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Uçuş Sınıf Koşulu</span>
                <span className="text-slate-800 font-bold text-xs mt-0.5 block">
                  {template.flightTypeCondition}
                </span>
              </div>
            </div>
          </div>

          {/* Aircraft Type Rule */}
          <div className="flex items-start justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[9px]">Uçak Tip Sınıfı</span>
                <code className="text-blue-700 font-bold font-mono text-xs mt-0.5 block">
                  {template.aircraftTypeCondition}
                </code>
              </div>
            </div>
          </div>

          {/* Status Verification */}
          <div className="flex items-start justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-600/80 uppercase tracking-wider block text-[9px]">SLA Onay Durumu</span>
                <span className="text-emerald-700 font-extrabold text-xs mt-0.5 block">
                  SLA Kapsamında Aktif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons removed in favor of Read-only OCC compliance indicator */}
        <div className="pt-4 border-t border-slate-200 flex flex-col gap-2 mt-auto">
          <div className="bg-slate-100 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5">
            <Settings2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">OCC Okuma-Yalnızca Modu</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">
                Şablon ve SLA kuralları operasyonel güvenlik sebebiyle salt-okunurdur. Değişiklikler yalnızca OCC Üst Yönetim paneli üzerinden yapılabilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
