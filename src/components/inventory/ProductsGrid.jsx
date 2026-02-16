import React from 'react';
import ProductCard from './ProductCard';

export default function ProductsGrid({ products, title, onProductClick, highlightedProductId, hideEmptyState }) {
  
  // FIX: Se non ci sono prodotti, controlliamo se dobbiamo nascondere il messaggio di errore
  // (es. perché abbiamo trovato risultati nella sezione "In scadenza")
  if (products.length === 0) {
    if (hideEmptyState) return null; // Non mostrare nulla, nemmeno il messaggio di errore

    return (
      <div className="px-5 py-8 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-[#666666]">Nessun prodotto trovato</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      {title && (
        <h3 className="font-semibold text-[#1A1A1A] mb-3">{title}</h3>
      )}
      <div className="grid grid-cols-4 gap-3">
        {products.map((product, index) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            index={index} 
            onClick={onProductClick}
            isHighlighted={product.id === highlightedProductId}
          />
        ))}
      </div>
    </div>
  );
}