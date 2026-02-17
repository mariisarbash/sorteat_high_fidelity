import React from 'react';
import ProductCard from './ProductCard'; 

export default function ExpiringSection({ products, onProductClick, highlightedProductId }) {
  if (products.length === 0) return null;

  return (
    <div className="mb-0">
      <h3 className="px-3 font-semibold text-[#1A1A1A] mb-3 text-sm">Da consumare subito ⚠️</h3>
      
      <div className="overflow-x-auto no-scrollbar pb-4 pt-1 px-3 -mx-3 md:mx-0">
        <div className="flex gap-2 px-3 md:px-0 w-max">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onClick={onProductClick}
              isHighlighted={product.id === highlightedProductId}
              // DIMENSIONI FISSE PER CAROSELLO:
              // w-28 (112px) x h-32 (128px) -> Praticamente un quadrato
              className="w-28 h-32 flex-shrink-0" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}