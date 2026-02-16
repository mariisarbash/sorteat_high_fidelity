import React from 'react';
import { motion } from 'framer-motion';
import AvatarStack from '../spesa/AvatarStack';

// Definisco le categorie qui per mappare l'icona
const CATEGORIES_MAP = {
  frigo: { name: 'Frigo', icon: '❄️' },
  dispensa: { name: 'Dispensa', icon: '🗄️' },
  freezer: { name: 'Freezer', icon: '🧊' },
};

export default function ProductCard({ product, index, onClick, isHighlighted, showCategory }) {
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

  const productOwners = product.owners || (product.owner ? [product.owner] : ['shared']);
  
  // Recupera info categoria
  const categoryInfo = CATEGORIES_MAP[product.category] || { name: '', icon: '' };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={
        isHighlighted 
        ? { scale: [1, 1.05, 1], opacity: 1, transition: { duration: 0.5, repeat: 1 } } 
        : { scale: 1, opacity: 1 }
      }
      transition={{ delay: index * 0.03 }}
      className="active:scale-95 transition-transform cursor-pointer relative pt-2 pr-2"
      onClick={() => onClick?.(product)}
    >
      {isHighlighted && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5 }}
            className="absolute top-2 right-2 bottom-0 left-0 bg-yellow-400/50 rounded-[18px] blur-sm z-0"
        />
      )}
      
      <div className={`bg-[#F2F0E9] rounded-2xl p-3 text-center relative z-10 ${getExpiryStyle()} ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}>
        
        {/* FIX LOCATION: Badge categoria in alto a sinistra (solo in ricerca) */}
        {showCategory && (
          <div className="absolute -top-2 -left-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100 shadow-sm z-20 flex items-center gap-1">
             <span>{categoryInfo.icon}</span> {categoryInfo.name}
          </div>
        )}

        {/* AvatarStack in alto a destra */}
        <div className="absolute -top-2 -right-2 z-10">
            <AvatarStack owners={productOwners} />
        </div>
        
        <div className="text-3xl mb-2 mt-1">{product.icon || '📦'}</div>
        
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