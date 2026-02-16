import React from 'react';
import { motion } from 'framer-motion';
// Importiamo AvatarStack per coerenza con il resto dell'app
import AvatarStack from '../spesa/AvatarStack';

export default function ExpiringSection({ products, onProductClick, highlightedProductId }) {
  if (products.length === 0) return null;

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
    if (days <= 2) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="mb-6">
      <h3 className="px-5 font-semibold text-[#1A1A1A] mb-3">Da consumare subito ⚠️</h3>
      
      {/* Scroll container con padding verticale per evitare tagli */}
      <div className="overflow-x-auto no-scrollbar pb-2 pt-2 px-5 -mx-5 md:mx-0">
        <div className="flex gap-3 px-5 md:px-0 w-max">
          {products.map((product, index) => {
            const daysLeft = getDaysLeft(product.expiry_date);
            
            // Normalizza gli owners
            const productOwners = product.owners || (product.owner ? [product.owner] : ['shared']);
            
            // Determina se questo prodotto deve essere evidenziato
            const isHighlighted = product.id === highlightedProductId;
            
            return (
              <motion.div
                key={product.id}
                initial={{ scale: 0.9, opacity: 0 }}
                // Animazione di Highlight: pulsazione + opacità fissa a 1
                animate={
                    isHighlighted 
                    ? { scale: [1, 1.05, 1], opacity: 1, transition: { duration: 0.5, repeat: 1 } } 
                    : { scale: 1, opacity: 1 }
                }
                transition={{ delay: index * 0.05 }}
                // Padding per ospitare AvatarStack e Glow
                className="flex-shrink-0 w-28 cursor-pointer relative pt-2 pr-2"
                onClick={() => onProductClick?.(product)}
              >
                {/* Effetto Glow Dorato (solo se evidenziato) */}
                {isHighlighted && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5 }}
                        className="absolute top-2 right-2 bottom-0 left-0 bg-yellow-400/50 rounded-[18px] blur-sm z-0"
                    />
                )}

                <div className={`bg-white rounded-2xl p-3 text-center relative card-shadow active:scale-95 transition-transform z-10 ${daysLeft <= 0 ? 'opacity-75' : ''} ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}>
                  
                  {/* AvatarStack in alto a destra */}
                  <div className="absolute -top-2 -right-2 z-10">
                      <AvatarStack owners={productOwners} />
                  </div>
                  
                  <span className={`text-4xl block mb-2 ${daysLeft <= 0 ? 'grayscale-[50%]' : ''}`}>
                    {product.icon || '📦'}
                  </span>
                  
                  <p className="text-xs font-bold text-[#1A1A1A] truncate w-full">
                    {product.name}
                  </p>
                  
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${getExpiryColor(daysLeft)}`}>
                    {getDaysText(daysLeft)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}