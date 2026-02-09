import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const mockExpiringProducts = [
  { id: 1, name: 'Pollo', icon: '🍗', daysLeft: 1, owner: 'mari' },
  { id: 2, name: 'Yogurt', icon: '🥛', daysLeft: 2, owner: 'shared' },
  { id: 3, name: 'Spinaci', icon: '🥬', daysLeft: 3, owner: 'gio' },
];

export default function ExpiringProductsWidget() {
  const getDaysText = (days) => {
    if (days === 0) return 'Oggi';
    if (days === 1) return 'Domani';
    return `${days} giorni`;
  };

  const getExpiryColor = (days) => {
    if (days <= 1) return 'bg-red-100 text-red-700';
    if (days <= 2) return 'bg-[#D4A373]/20 text-[#D4A373]';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="mx-5 mb-4"
    >
      <div className="bg-white rounded-3xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D4A373]" />
            <h3 className="font-semibold text-[#1A1A1A]">In scadenza</h3>
          </div>
          <Link 
            to={createPageUrl('Inventario')}
            className="text-xs text-[#3A5A40] font-medium"
          >
            Vedi tutti
          </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {mockExpiringProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="flex-shrink-0 w-24"
            >
              <div className="bg-[#F2F0E9] rounded-2xl p-3 text-center relative">
                {product.owner !== 'mari' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#A3B18A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {product.owner === 'gio' ? 'G' : product.owner === 'pile' ? 'P' : '🏠'}
                  </div>
                )}
                <span className="text-3xl">{product.icon}</span>
                <p className="text-xs font-medium text-[#1A1A1A] mt-2 truncate">{product.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${getExpiryColor(product.daysLeft)}`}>
                  {getDaysText(product.daysLeft)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}