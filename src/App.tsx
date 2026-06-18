/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plane, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Activity,
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { HubCode } from './types';
import { HUBS } from './data';
import { OccLiveDashboard } from './components/OccLiveDashboard';

export default function App() {
  // Application states
  const [selectedHub, setSelectedHub] = useState<HubCode>('SAW'); // default SAW
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [timeLocal, setTimeLocal] = useState<string>('');

  // Get active HUB details
  const activeHubDetails = HUBS.find((h) => h.code === selectedHub) || HUBS[0];

  // Keep a digital clock ticking for dispatch dispatcher authenticity
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      
      // format UTC clock
      const utcString = now.toUTCString().slice(17, 25);
      setTimeUtc(utcString + " UTC");

      // format Local clock
      const locale = activeHubDetails.country === 'Turkey' ? 'tr-TR' : 'de-DE';
      const localString = now.toLocaleTimeString(locale, { hour12: false });
      setTimeLocal(localString);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [selectedHub]);

  return (
    <div id="tams-root-container" className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-amber-450/20 flex flex-col">
      
      {/* PEGASUS CORPORATE LIGHT PREMIUM HEADER */}
      <header id="tams-header" className="h-16 bg-white border-b border-slate-200 text-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-50">
        
        {/* Brand Logo & Name (Pegasus Corporation Style) */}
        <div id="pegasus-logo-area" className="flex items-center gap-3">
          <div className="bg-[#FFCC00] w-10 h-10 rounded-lg flex items-center justify-center shadow-xs select-none transition-transform hover:scale-105 active:scale-95 border border-slate-300">
            {/* Pegasus wing logo like stylized vector or plane icon with red accents */}
            <span className="text-xl font-bold font-serif text-slate-900 leading-none">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-slate-900">TAMS GT Control Dashboard</span>
              <span className="bg-[#FFCC00]/20 text-[#DD8800] border border-[#FFCC00] text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest select-none uppercase">
                YER İŞLETME
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-wide mt-0.5 leading-none">
              Pegasus Ground Time SLA Performance Analyzer
            </p>
          </div>
        </div>

        {/* Airport Hub Fast Switcher Buttons */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-205">
          <span className="text-[9px] uppercase font-black text-slate-400 px-2 tracking-wider">AKTİF HUB:</span>
          {HUBS.map((hub) => {
            const isSelected = selectedHub === hub.code;
            return (
              <button
                key={hub.code}
                id={`hub-selector-${hub.code}`}
                onClick={() => setSelectedHub(hub.code)}
                className={`px-3 py-1 text-xs font-black font-mono rounded-lg transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#FFCC00] text-slate-900 shadow-xs ring-1 ring-yellow-400' 
                    : 'text-slate-550 hover:text-slate-900 hover:bg-slate-200 text-slate-500'
                }`}
              >
                {hub.code}
              </button>
            );
          })}
        </div>

        {/* Real-time Dispatch Clocks & Live Data Status Indicator */}
        <div id="live-clocks-header" className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono select-none">
            {/* Blinking Live Data Status indicator inside header */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded text-[10px] font-bold text-emerald-800 font-sans tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>CANLI YAYIN / LIVE DATA</span>
              <span className="text-emerald-300 font-normal">|</span>
              <span className="text-slate-550 font-mono text-[9px]">Son Güncelleme: {timeLocal}</span>
            </div>
            
            <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-black">{timeUtc}</span>
          </div>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-extrabold text-slate-800 leading-none">Buse Şahin</p>
              <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Disp. Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FFCC00] flex items-center justify-center text-[11px] font-black border border-amber-300 text-slate-900 select-none shadow-sm">
              TAC
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE AIRPORT HUB SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 p-2.5 flex items-center justify-between gap-1.5 overflow-x-auto">
        <span className="text-[10px] uppercase font-black text-slate-400 font-mono whitespace-nowrap">HUB:</span>
        <div className="flex gap-1.5">
          {HUBS.map((hub) => (
            <button
              key={hub.code}
              id={`hub-selector-mobile-${hub.code}`}
              onClick={() => setSelectedHub(hub.code)}
              className={`px-2.5 py-1 text-xs font-bold font-mono rounded ${
                selectedHub === hub.code 
                  ? 'bg-[#FFCC00] text-slate-950 font-black' 
                  : 'text-slate-500 bg-slate-100'
              }`}
            >
              {hub.code}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GROUND TIME CONTROL PLATFORM ACTIVE SECTION */}
      <main id="tams-main-dashboard" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Hub meta display strip - light color */}
        <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                AKTİF HUB MEYDAN: <span className="text-[#DD8800] font-black">{activeHubDetails.fullName}</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                IATA Meydan Kodu: <strong className="text-slate-800">{activeHubDetails.code}</strong> • Ülke: {activeHubDetails.country} • Tanımlı Eşik Şablonları: {activeHubDetails.totalTemplates} • Hedef Turnaround Süresi: {activeHubDetails.averageTargetGT} dk.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic OCC dashboard loader containing sections 1 to 10 */}
        <OccLiveDashboard activeHub={selectedHub} />

      </main>

      {/* AIRLINE Standard Compliance Corporate Footer */}
      <footer id="tams-footer" className="bg-white text-slate-500 border-t border-slate-200 py-6 text-xs text-center font-sans tracking-wide mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-extrabold text-slate-900 tracking-wide uppercase">PEGASUS FLIGHT OPERATIONS & GROUND OPERATIONS INTEL</p>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Yer İşletme Yönetim ve Karar Destek Platformu. Tüm hakları saklıdır © 2026</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 select-none">
            <span>SLA Standard Compliance</span>
            <span>•</span>
            <span className="font-mono">IATA Airport Handling Council Certified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
