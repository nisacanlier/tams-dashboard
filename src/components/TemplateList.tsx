/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, ArrowRight, ArrowUpDown, Filter } from 'lucide-react';
import { GroundTimeTemplate } from '../types';

interface TemplateListProps {
  templates: GroundTimeTemplate[];
  selectedTemplate: GroundTimeTemplate | null;
  onSelectTemplate: (template: GroundTimeTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Turnaround' | 'Departure'>('All');

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.aircraftTypeCondition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.flightTypeCondition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : t.gtType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div id="template-list-container" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col gap-4">
      {/* Header with Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 id="template-list-main-title" className="text-base font-bold text-slate-900 flex items-center gap-2">
            Ground Time Target Koşulları
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Seçilen HUB için geçerli operasyon tip ve uçak modelleri limitleri.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto shrink-0">
          {(['All', 'Turnaround', 'Departure'] as const).map((type) => (
            <button
              id={`filter-${type.toLowerCase()}`}
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'All' ? 'Tümü' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          id="template-search-input"
          type="text"
          placeholder="İsim, uçak tipi veya uçuş koşulu ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Modern 12-Column Grid table imitation */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Table Header Row */}
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 py-3.5 gap-2 select-none">
          <div className="col-span-4">Template Name</div>
          <div className="col-span-2">GT Type</div>
          <div className="col-span-2 text-center">Flight Rule</div>
          <div className="col-span-2 text-center">Aircraft Type</div>
          <div className="col-span-2 text-right">Target Minute</div>
        </div>

        {/* Table List Items */}
        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template, idx) => {
                const isSelected = selectedTemplate?.id === template.id;
                
                // Flight type badge formatting
                const flightBadgeText = template.flightTypeCondition.includes('Dom-Dom') 
                  ? 'D / D' 
                  : template.flightTypeCondition.includes('Departure')
                  ? 'DEP'
                  : template.flightTypeCondition.includes('Dom-Int') || template.flightTypeCondition.includes('Mixed')
                  ? 'D-I / I-D / I-I'
                  : 'ANY';

                return (
                  <motion.div
                    id={`template-row-${template.id}`}
                    key={template.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: isSelected ? 1 : 0.85, y: 0 }}
                    whileHover={{ opacity: 1, backgroundColor: 'rgba(239, 246, 255, 0.3)' }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => onSelectTemplate(template)}
                    className={`grid grid-cols-12 px-6 py-4.5 items-center gap-2 transition-all cursor-pointer border-l-4 ${
                      isSelected 
                        ? 'bg-blue-50/50 border-blue-600 font-bold' 
                        : 'border-transparent hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Template name */}
                    <div className="col-span-4">
                      <span className={`text-xs block tracking-tight ${
                        isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700 font-semibold'
                      }`}>
                        {template.name}
                      </span>
                    </div>

                    {/* GT Type badge */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          template.gtType === 'Turnaround'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100/50'
                            : 'bg-orange-50 text-orange-700 border border-orange-100'
                        }`}
                      >
                        {template.gtType}
                      </span>
                    </div>

                    {/* Flight type rule */}
                    <div className="col-span-2 text-center">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {flightBadgeText}
                      </span>
                    </div>

                    {/* Aircraft constraint */}
                    <div className="col-span-2 text-center text-xs font-mono text-slate-500 font-semibold truncate px-1" title={template.aircraftTypeCondition}>
                      {template.aircraftTypeCondition}
                    </div>

                    {/* Target minutes duration */}
                    <div className="col-span-2 text-right">
                      <span className={`text-base font-black transition-all ${
                        isSelected ? 'text-blue-600 text-lg' : 'text-slate-500'
                      }`}>
                        {template.targetMinutes}m
                      </span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="font-semibold text-xs">Aradığınız kriterlere uygun şablon bulunamadı.</p>
                <p className="text-[11px] text-slate-400 mt-1">Arama terimini değiştirerek veya filtreyi sıfırlayarak tekrar deneyin.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 border-t pt-3 border-slate-100">
        <span>Görüntülenen: <strong>{filteredTemplates.length}</strong> şablon</span>
        <span className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" />
          Filtreleme aktiftir
        </span>
      </div>
    </div>
  );
};
