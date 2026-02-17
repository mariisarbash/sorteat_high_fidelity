import React from 'react';
import ProductCard from './ProductCard';

export default function ProductsGrid({ 
  products, 
  title, 
  onProductClick, 
  highlightedProductId, 
  hideEmptyState, 
  isSearchMode,
  className = "px-3 pb-24" // Padding laterale ridotto (px-3)
}) {
  
  if (products.length === 0) {
    if (hideEmptyState) return null;

    return (
      <div className="px-5 py-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-[#666666]">Nessun prodotto trovato</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h3 className="font-bold text-[#1A1A1A] mb-3 px-1 text-sm">{title}</h3>
      )}
      
      {/* 3 COLONNE: Larghezza circa 115px.
          Con h-32, otteniamo il formato quadrato richiesto.
      */}
      <div className="grid grid-cols-3 gap-2">
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index} 
            onClick={onProductClick}
            isHighlighted={product.id === highlightedProductId}
            showCategory={isSearchMode}
            // Altezza fissa h-32 per garantire il formato quadrato anche qui
            className="h-32"
          />
        ))}
      </div>
    </div>
  );
}