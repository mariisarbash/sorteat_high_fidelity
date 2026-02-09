import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryHeader({ searchQuery, onSearchChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="px-5 pt-6 pb-4">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Inventario</h1>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cerca un prodotto..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl text-sm text-[#1A1A1A] placeholder:text-gray-400 transition-all card-shadow ${
            isFocused ? 'ring-2 ring-[#3A5A40]/20' : ''
          }`}
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center"
            >
              <X className="w-3 h-3 text-gray-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}