import React from 'react';
import { useProducts } from '../../context/ProductsContext';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
// Importiamo la Card Master per garantire uniformità totale
import ProductCard from '../inventory/ProductCard';

export default function ExpiringProductsWidget({ onProductClick }) {
  const { expiringProducts } = useProducts();

  // Prendiamo solo i primi 5 per non intasare la home
  const displayProducts = expiringProducts.slice(0, 5);

  if (displayProducts.length === 0) return null;

  return (
    <div className="mx-5 mb-4">
      {/* HEADER: Titolo + Link Vedi Tutti */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D4A373]" />
            <h3 className="font-bold text-[#1A1A1A] text-sm">
                In scadenza <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md text-[10px]">{expiringProducts.length}</span>
            </h3>
        </div>
        <Link 
            to="/inventario" 
            className="text-xs text-[#3A5A40] font-bold hover:underline"
        >
            Vedi tutti
        </Link>
      </div>
      
      {/* CAROSELLO CARD - IDENTICO ALL'INVENTARIO */}
      <div className="overflow-x-auto no-scrollbar pb-4 pt-1 -mx-5 px-5">
        <div className="flex gap-2 w-max">
          {displayProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onClick={onProductClick}
              // isHighlighted non serve qui nella home, ma possiamo passarlo se vogliamo
              
              // DIMENSIONI QUADRATINO (GEMELLE DELL'INVENTARIO):
              // w-28 (112px) x h-32 (128px)
              className="w-28 h-32 flex-shrink-0" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}