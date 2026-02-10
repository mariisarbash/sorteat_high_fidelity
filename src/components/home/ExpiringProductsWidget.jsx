import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts, getDaysUntilExpiry } from '../../context/ProductsContext';

export default function ExpiringProductsWidget() {
  // Usa il contesto globale dei prodotti
  const { expiringProducts } = useProducts();

  const getDaysText = (days) => {
    if (days <= 0) return 'Scaduto';
    if (days === 1) return 'Domani';
    return `${days} giorni`;
  };

  const getExpiryColor = (days) => {
    if (days <= 0) return 'bg-red-500 text-white';
    if (days <= 1) return 'bg-red-100 text-red-700';
    if (days <= 2) return 'bg-orange-100 text-orange-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getOwnerBadge = (owner) => {
    if (owner === 'mari') return null;
    if (owner === 'gio') return { label: 'G', color: 'bg-blue-500' };
    if (owner === 'pile') return { label: 'P', color: 'bg-purple-500' };
    if (owner === 'shared') return { label: '🏠', color: 'bg-[#A3B18A]' };
    return null;
  };

  // Non mostrare il widget se non ci sono prodotti in scadenza
  if (expiringProducts.length === 0) return null;

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
          {expiringProducts.map((product, index) => {
            const daysLeft = getDaysUntilExpiry(product.expiry_date);
            const ownerBadge = getOwnerBadge(product.owner);
            
            return (
              <motion.div
                key={product.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex-shrink-0 w-24"
              >
                <div className={`bg-[#F2F0E9] rounded-2xl p-3 text-center relative ${daysLeft <= 0 ? 'opacity-75' : ''}`}>
                  {ownerBadge && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${ownerBadge.color} text-white text-[10px] font-bold flex items-center justify-center border-2 border-white`}>
                      {ownerBadge.label}
                    </div>
                  )}
                  <span className={`text-3xl ${daysLeft <= 0 ? 'grayscale-[50%]' : ''}`}>{product.icon}</span>
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
    </motion.div>
  );
}