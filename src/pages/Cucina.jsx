import React from 'react';
import { Toaster } from 'sonner';
import MealTimeWidget from '../components/cucina/MealTimeWidget';
import MealStream from '../components/cucina/MealStream';

export default function Cucina() {
  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Cucina</h1>
        <p className="text-sm text-[#666666] mt-1">Pianifica i tuoi pasti</p>
      </div>

      <MealTimeWidget />
      <MealStream />

      {/* Tips Section */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-3xl p-5 card-shadow">
          <h3 className="font-semibold text-[#1A1A1A] mb-3">💡 Suggerimenti</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-[#F2F0E9] rounded-xl">
              <span className="text-xl">🥗</span>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">Spinaci in scadenza</p>
                <p className="text-xs text-[#666666]">Aggiungi una frittata al menu di domani?</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#F2F0E9] rounded-xl">
              <span className="text-xl">🍗</span>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">Il pollo è scongelato</p>
                <p className="text-xs text-[#666666]">Da consumare entro stasera</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}