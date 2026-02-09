import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExpiringSection({ products, onProductClick }) {
  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysText = (days) => {
    if (days <= 0) return 'Scaduto';
    if (days === 1) return 'Domani';
    return `${days} giorni`;
  };

  const getExpiryColor = (days) => {
    if (days <= 0) return 'bg-red-500 text-white';
    if (days === 1) return 'bg-red-100 text-red-700';
    if (days <= 2) return 'bg-[#D4A373]/20 text-[#D4A373]';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getOwnerBadge = (owner) => {
    if (owner === 'mari') return null;
    if (owner === 'gio') return { label: 'G', color: 'bg-blue-500' };
    if (owner === 'pile') return { label: 'P', color: 'bg-purple-500' };
    if (owner === 'shared') return { label: '🏠', color: 'bg-[#A3B18A]' };
    return null;
  };

  if (products.length === 0) return null;

  return (
    <div className="px-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-[#D4A373]" />
        <h3 className="font-semibold text-[#1A1A1A]">Da consumare subito</h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((product, index) => {
          const daysLeft = getDaysLeft(product.expiry_date);
          const ownerBadge = getOwnerBadge(product.owner);
          
          return (
            <motion.div
              key={product.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-24 cursor-pointer"
              onClick={() => onProductClick?.(product)}
            >
              <div className={`bg-white rounded-2xl p-3 text-center relative card-shadow active:scale-95 transition-transform ${daysLeft <= 0 ? 'opacity-75' : ''}`}>
                {ownerBadge && (
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${ownerBadge.color} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white z-10`}>
                    {ownerBadge.label}
                  </div>
                )}
                
                <span className={`text-3xl ${daysLeft <= 0 ? 'grayscale-[50%]' : ''}`}>
                  {product.icon || '📦'}
                </span>
                <p className="text-xs font-medium text-[#1A1A1A] mt-2 truncate">{product.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${getExpiryColor(daysLeft)}`}>
                  {getDaysText(daysLeft)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}