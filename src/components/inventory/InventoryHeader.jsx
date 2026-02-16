import React, { useState } from 'react';
import { Search, X, Filter, ArrowDownAZ, CalendarDays, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Copio i dati dei coinquilini per coerenza
const ROOMMATES = [
  { id: 'mari', initial: 'M', color: 'bg-pink-500' },
  { id: 'gio', initial: 'G', color: 'bg-blue-500' },
  { id: 'pile', initial: 'P', color: 'bg-purple-500' },
];

export default function InventoryHeader({ 
  searchQuery, 
  onSearchChange,
  sortOption,
  onSortChange,
  filterOwner,
  onFilterOwnerChange
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const getSortIcon = (option) => {
    switch(option) {
      case 'name': return <ArrowDownAZ className="w-4 h-4" />;
      case 'expiry': return <CalendarDays className="w-4 h-4" />;
      case 'recent': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSortLabel = (option) => {
    switch(option) {
      case 'name': return 'A-Z';
      case 'expiry': return 'Scadenza';
      case 'recent': return 'Recenti';
      default: return '';
    }
  };

  return (
    <div className="px-5 pt-6 pb-2 bg-white sticky top-0 z-20">
      {/* HEADER ROW: Titolo e Bottone Filtro */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventario</h1>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${
            showFilters || filterOwner !== 'all' || sortOption !== 'name'
              ? 'bg-[#1A1A1A] text-white border-transparent' 
              : 'bg-white text-gray-500 border-gray-200'
          }`}
        >
          <Filter className="w-5 h-5" />
          {/* Pallino di notifica se ci sono filtri attivi */}
          {(filterOwner !== 'all' || sortOption !== 'name') && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      </div>

      {/* FILTERS PANEL (Collapsible) */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4 space-y-4"
          >
            {/* 1. ORDINAMENTO */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Ordina per</p>
              <div className="flex gap-2">
                {['name', 'expiry', 'recent'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => onSortChange(opt)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      sortOption === opt 
                        ? 'bg-[#3A5A40] text-white shadow-md' 
                        : 'bg-[#F2F0E9] text-gray-600'
                    }`}
                  >
                    {getSortIcon(opt)}
                    {getSortLabel(opt)}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. FILTRO PROPRIETARIO */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Filtra per</p>
              <div className="flex items-center gap-2">
                {/* Tutti */}
                <button
                  onClick={() => onFilterOwnerChange('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    filterOwner === 'all' 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Tutti
                </button>

                {/* Coinquilini */}
                {ROOMMATES.map((roommate) => (
                  <button
                    key={roommate.id}
                    onClick={() => onFilterOwnerChange(roommate.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                      filterOwner === roommate.id 
                        ? `${roommate.color} text-white border-transparent scale-110 shadow-sm` 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {roommate.initial}
                  </button>
                ))}

                {/* Casa / Shared */}
                <button
                  onClick={() => onFilterOwnerChange('shared')}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                    filterOwner === 'shared' 
                      ? 'bg-[#A3B18A] text-white border-[#A3B18A] scale-110 shadow-sm' 
                      : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  🏠
                </button>
              </div>
            </div>
            
            <div className="h-px bg-gray-100 w-full" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca un prodotto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full h-12 pl-12 pr-12 bg-[#F2F0E9] rounded-2xl text-sm text-[#1A1A1A] placeholder:text-gray-400 transition-all font-medium focus:outline-none ${
            isFocused ? 'ring-2 ring-[#1A1A1A]/5' : ''
          }`}
        />
        
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200/80 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}