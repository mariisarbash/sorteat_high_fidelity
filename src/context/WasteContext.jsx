import React, { createContext, useContext, useState, useCallback } from 'react';

const WasteContext = createContext();

export function useWaste() {
  const context = useContext(WasteContext);
  if (!context) {
    throw new Error('useWaste must be used within a WasteProvider');
  }
  return context;
}

export function WasteProvider({ children }) {
  // Giorni senza spreco (inizialmente 12 come nel mock)
  const [daysWithoutWaste, setDaysWithoutWaste] = useState(12);
  
  // Ultimo spreco registrato (timestamp)
  const [lastWasteDate, setLastWasteDate] = useState(null);
  
  // Totale spreco in euro
  const [totalWastedValue, setTotalWastedValue] = useState(0);
  
  // Obiettivo giorni
  const goal = 30;
  
  // Calcola progresso percentuale
  const progress = Math.min((daysWithoutWaste / goal) * 100, 100);
  
  // Stato di "allarme" quando si è appena sprecato
  const isInWasteAlert = daysWithoutWaste === 0;

  // Registra uno spreco
  const registerWaste = useCallback((productName, value = 2.50) => {
    setDaysWithoutWaste(0);
    setLastWasteDate(new Date().toISOString());
    setTotalWastedValue(prev => prev + value);
  }, []);

  // Reset manuale (per testing o nuovo mese)
  const resetStreak = useCallback((days = 0) => {
    setDaysWithoutWaste(days);
    if (days > 0) {
      setLastWasteDate(null);
    }
  }, []);

  const value = {
    daysWithoutWaste,
    goal,
    progress,
    isInWasteAlert,
    totalWastedValue,
    lastWasteDate,
    registerWaste,
    resetStreak
  };

  return (
    <WasteContext.Provider value={value}>
      {children}
    </WasteContext.Provider>
  );
}
