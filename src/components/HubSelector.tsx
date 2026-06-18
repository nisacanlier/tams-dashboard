/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PlaneTakeoff, Info, Star } from 'lucide-react';
import { HubCode, HubDetails } from '../types';

interface HubSelectorProps {
  hubs: HubDetails[];
  selectedHub: HubCode;
  onSelectHub: (code: HubCode) => void;
}

export const HubSelector: React.FC<HubSelectorProps> = ({
  hubs,
  selectedHub,
  onSelectHub,
}) => {
  return (
    <div id="hub-selector-container" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <h2 id="hub-sidebar-title" className="text-sm font-semibold tracking-wider uppercase text-slate-500">
          Operasyonel HUB Listesi
        </h2>
        <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
          {hubs.length} HUB
        </span>
      </div>

      <p className="text-xs text-slate-400 -mt-1">
        Lütfen takip etmek istediğiniz ana merkezi seçin. HUB değişimi, tanımlı kuralları ve detay analizleri otomatik yükleyecektir.
      </p>

      <div id="hub-cards" className="grid grid-cols-1 gap-2.5">
        {hubs.map((hub) => {
          const isSelected = hub.code === selectedHub;
          return (
            <motion.button
              id={`hub-card-${hub.code}`}
              key={hub.code}
              onClick={() => onSelectHub(hub.code)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 text-blue-700 border-blue-200 shadow-xs font-semibold'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}
                >
                  <span className="font-extrabold text-xs tracking-tight">{hub.code}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">{hub.fullName.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({hub.city})</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5 max-w-[124px] truncate">
                    {hub.fullName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">GT Target</span>
                  <span className="text-xs font-bold text-slate-700">
                    {hub.averageTargetGT} dk
                  </span>
                </div>
                
                {/* Active Operations Indicator Dot */}
                <div 
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isSelected 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.65)]' 
                      : 'bg-emerald-500 opacity-30 group-hover:opacity-60'
                  }`}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl p-4 mt-2">
        <div className="flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-blue-900 leading-none">Turnaround Hedefleri</span>
            <p className="text-[11px] text-blue-700 leading-normal">
              Hedefler, yer hizmetleri (ramp, kabin temizliği, catering vb.) performans kriterleri (KPI) baz alınarak belirlenmiştir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
