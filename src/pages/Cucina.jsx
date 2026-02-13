import React from 'react';
import { Toaster, toast } from 'sonner'; 
import { useProducts } from '../context/ProductsContext';
import MealTimeWidget from '../components/cucina/MealTimeWidget';
import MealStream from '../components/cucina/MealStream';

export default function Cucina() {
  const { expiringProducts } = useProducts();
  const suggestions = expiringProducts.slice(0, 2);

  const handleSuggestionClick = (product) => {
    toast.success(`Idea salvata! 💡`, {
        description: `Proveremo a usare ${product.name} nella prossima ricetta.`
    });
  };

  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      <div className="px-5 pt-6 pb-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Cucina</h1>
            <p className="text-sm text-[#666666] mt-1">Pianifica i tuoi pasti</p>
        </div>
        {/* FIX: Bottone Libreria Nascosto
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center card-shadow active:scale-95 text-xl">
            📚
        </button>
        */}
      </div>

      <MealTimeWidget />
      
      {/* 1. Calendario Pasti (Spostato SOPRA) */}
      <MealStream />

    </div>
  );
}