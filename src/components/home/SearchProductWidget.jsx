import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchProductWidget() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="mx-5 mb-4"
    >
      <Link 
        to={createPageUrl('Inventario')}
        className="block bg-white rounded-2xl p-4 card-shadow active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2F0E9] flex items-center justify-center">
            <Search className="w-5 h-5 text-[#3A5A40]" />
          </div>
          <span className="text-[#666666] text-sm font-medium">Cerca un prodotto nell'inventario...</span>
        </div>
      </Link>
    </motion.div>
  );
}