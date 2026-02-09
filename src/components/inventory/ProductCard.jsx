import React from 'react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, index, onClick }) {
  const getDaysUntilExpiry = () => {
    if (!product.expiry_date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(product.expiry_date);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();
  
  const getExpiryStyle = () => {
    if (daysLeft === null) return '';
    if (daysLeft <= 0) return 'grayscale-[30%] opacity-80';
    if (daysLeft <= 1) return 'opacity-90';
    if (daysLeft <= 3) return '';
    return '';
  };

  const getOwnerBadge = () => {
    if (product.owner === 'mari') return null;
    if (product.owner === 'gio') return { label: 'G', color: 'bg-blue-500' };
    if (product.owner === 'pile') return { label: 'P', color: 'bg-purple-500' };
    if (product.owner === 'shared') return { label: '🏠', color: 'bg-[#A3B18A]' };
    return null;
  };

  const ownerBadge = getOwnerBadge();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className="active:scale-95 transition-transform cursor-pointer"
      onClick={() => onClick?.(product)}
    >
      <div className={`bg-[#F2F0E9] rounded-2xl p-3 text-center relative ${getExpiryStyle()}`}>
        {ownerBadge && (
          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${ownerBadge.color} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white z-10`}>
            {ownerBadge.label}
          </div>
        )}
        
        <div className="text-3xl mb-2">{product.icon || '📦'}</div>
        
        <p className="text-xs font-semibold text-[#1A1A1A] truncate">{product.name}</p>
        
        {product.quantity && (
          <p className="text-[10px] text-[#666666] mt-0.5">
            {product.quantity} {product.unit || ''}
          </p>
        )}
      </div>
    </motion.div>
  );
}