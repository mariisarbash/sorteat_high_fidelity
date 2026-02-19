import React from 'react';
import { motion } from 'framer-motion';
import AvatarStack from '../spesa/AvatarStack';

const CATEGORIES_MAP = {
  frigo: { name: 'Frigo', icon: '❄️' },
  dispensa: { name: 'Dispensa', icon: '🗄️' },
  freezer: { name: 'Freezer', icon: '🧊' },
};

export default function ProductCard({ product, index, onClick, isHighlighted, showCategory, className = '' }) {
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
  
  const getExpiryText = () => {
    if (daysLeft === null) return '';
    if (daysLeft <= 0) return 'Scaduto';
    if (daysLeft === 1) return '1 giorno';
    if (daysLeft === 2) return '2 giorni';
    if (daysLeft === 3) return '3 giorni';
    return `${daysLeft} giorni`;
  };

  const getExpiryStyle = () => {
    if (daysLeft === null) return '';
    if (daysLeft <= 0) return 'bg-red-500 text-white border-red-500';             // Scaduto: Rosso pieno
    if (daysLeft === 1) return 'bg-red-100 text-red-700 border-red-100';          // 1 giorno: Rosso chiaro
    if (daysLeft === 2) return 'bg-orange-100 text-orange-700 border-orange-100'; // 2 giorni: Arancione chiaro
    if (daysLeft === 3) return 'bg-yellow-100 text-yellow-700 border-yellow-100'; // 3 giorni: Giallo chiaro
    return 'bg-gray-100 text-gray-500 border-gray-100';                           // Oltre i 3 giorni
  };

  const productOwners = product.owners || (product.owner ? [product.owner] : ['shared']);
  const categoryInfo = CATEGORIES_MAP[product.category] || { name: '', icon: '' };

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={
        isHighlighted 
        ? { scale: [1, 1.05, 1], opacity: 1, transition: { duration: 0.5, repeat: 1 } } 
        : { scale: 1, opacity: 1 }
      }
      transition={{ delay: index * 0.03 }}
      className={`active:scale-95 transition-transform cursor-pointer relative ${className}`}
      onClick={() => onClick?.(product)}
    >
      {isHighlighted && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5 }}
            className="absolute -top-1 -right-1 -bottom-1 -left-1 bg-yellow-400/50 rounded-[18px] blur-md z-0"
        />
      )}
      
      {/* DESIGN "QUADRATINO":
          - h-32 (128px): Altezza quasi uguale alla larghezza (~115px).
          - p-2: Padding minimo per massimizzare lo spazio interno.
      */}
      <div className={`bg-white rounded-2xl p-2 card-shadow relative z-10 flex flex-col justify-between h-32 w-full border-2 ${isHighlighted ? 'border-yellow-400' : 'border-transparent'}`}>
        
        {showCategory && (
          <div className="absolute -top-1.5 -left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full text-[9px] font-bold text-gray-500 border border-gray-100 shadow-sm z-20 flex items-center gap-1">
             <span>{categoryInfo.icon}</span> {categoryInfo.name}
          </div>
        )}

        {/* Avatar spostato leggermente più in alto a destra */}
        <div className="absolute top-1.5 right-1.5 z-10">
            <AvatarStack owners={productOwners} size="xs" />
        </div>
        
        {/* Icona prodotto: Spostata in alto per non schiacciare il testo sotto */}
        <div className="text-3xl mt-1.5 ml-1">{product.icon || '📦'}</div>
        
        {/* Blocco Info Inferiore */}
        <div className="w-full flex flex-col gap-0.5">
            <p className="text-xs font-bold text-[#1A1A1A] truncate w-full leading-tight">
                {product.name}
            </p>
            <p className="text-[10px] text-[#666666] font-medium leading-none mb-1">
                {product.quantity} {product.unit || ''}
            </p>
            
            {/* Badge Scadenza: Se presente, toglie un po' di margine ma ci sta grazie a h-32 */}
            {daysLeft !== null && daysLeft <= 3 && (
                <div className={`text-[9px] font-bold px-1 py-0.5 rounded-md w-full text-center border truncate ${getExpiryStyle()}`}>
                    {getExpiryText()}
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}