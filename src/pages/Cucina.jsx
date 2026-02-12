import React from 'react';
import { Toaster, toast } from 'sonner'; // Importa toast
import { useProducts } from '../context/ProductsContext';
import MealTimeWidget from '../components/cucina/MealTimeWidget';
import MealStream from '../components/cucina/MealStream';

export default function Cucina() {
  const { expiringProducts } = useProducts();
  const suggestions = expiringProducts.slice(0, 2);

  // Azione al click (Mock)
  const handleSuggestionClick = (product) => {
    toast.success(`Idea salvata! 💡`, {
        description: `Proveremo a usare ${product.name} nella prossima ricetta.`
    });
    // In futuro: Apri CreateRecipeModal pre-filtrato per questo prodotto
  };

  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      <div className="px-5 pt-6 pb-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Cucina</h1>
            <p className="text-sm text-[#666666] mt-1">Pianifica i tuoi pasti</p>
        </div>
        {/* Bottone Libreria (Placeholder visivo per ora) - NASCOSTO PER ORA
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center card-shadow active:scale-95 text-xl">
            📚
        </button>
        */}
      </div>

      <MealTimeWidget />
      
      {/* Widget Svuota Frigo (semplificato visivamente) */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-3xl p-5 card-shadow">
          <h3 className="font-semibold text-[#1A1A1A] mb-3">💡 Svuota Frigo</h3>
          
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map(product => (
                <div 
                    key={product.id} 
                    onClick={() => handleSuggestionClick(product)}
                    className="flex items-start gap-3 p-3 bg-[#F2F0E9] rounded-xl active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <span className="text-xl">{product.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                        {product.name} in scadenza
                        {/* FIX 5: Traduzione */}
                        <span className="text-[10px] text-red-500 bg-red-100 px-1.5 py-0.5 rounded-md">Urgente</span>
                    </p>
                    <p className="text-xs text-[#666666] mt-0.5">
                        {product.category === 'frigo' ? 'Che ne dici di una frittata?' : 'Ottimo per un primo piatto veloce.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm italic">
                Nessun prodotto in scadenza. Ottimo lavoro! 👏
            </div>
          )}
        </div>
      </div>

      <MealStream />
    </div>
  );
}