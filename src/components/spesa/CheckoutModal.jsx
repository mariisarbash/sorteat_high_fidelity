import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, Check, AlertCircle, RefreshCw } from 'lucide-react';
import AvatarStack from './AvatarStack'; // Assicurati che il percorso sia corretto

// Mock prezzi per la simulazione scontrino
const MOCK_PRICES = {
  'Latte': 1.20,
  'Pane': 1.50,
  'Pasta': 0.90,
  'Pomodori': 2.50,
  'Banane': 1.80,
  'Mozzarella': 1.10,
  'Detersivo': 3.50,
  'Uova': 2.20
};

export default function CheckoutModal({ isOpen, onClose, checkedItems, onConfirm }) {
  const [step, setStep] = useState(1); // 1: Riepilogo, 2: Prezzi Singoli, 3: Conferma Finale
  const [prices, setPrices] = useState({}); // Oggetto { id_prodotto: prezzo }
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Inizializza i prezzi vuoti quando si apre il modale
  useEffect(() => {
    if (isOpen) {
      const initialPrices = {};
      checkedItems.forEach(item => {
        initialPrices[item.id] = '';
      });
      setPrices(initialPrices);
    }
  }, [isOpen, checkedItems]);

  const handlePriceChange = (id, value) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
    // Simula tempo di analisi
    setTimeout(() => {
      const detectedPrices = {};
      checkedItems.forEach(item => {
        // Cerca prezzo mock per nome, o genera casuale realistico tra 1€ e 4€
        const mockPrice = MOCK_PRICES[Object.keys(MOCK_PRICES).find(key => item.name.includes(key))] 
                          || (Math.random() * 3 + 1).toFixed(2);
        detectedPrices[item.id] = mockPrice;
      });
      
      setPrices(detectedPrices);
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const calculateTotal = () => {
    return Object.values(prices).reduce((sum, price) => sum + (parseFloat(price) || 0), 0);
  };

  const handleConfirm = () => {
    // Aggiungi il prezzo inserito a ogni oggetto prodotto
    const productsWithPrices = checkedItems.map(item => ({
      ...item,
      price: parseFloat(prices[item.id]) || 0,
      purchase_date: new Date().toISOString()
    }));
    
    onConfirm(productsWithPrices);
    resetAndClose();
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setPrices({});
      setScanComplete(false);
      setIsScanning(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col max-w-md mx-auto shadow-2xl"
      >
        {/* Handle per trascinamento (estetico) */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                {step === 1 && 'Riepilogo'}
                {step === 2 && 'Prezzi'}
                {step === 3 && 'Conferma'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Step {step} di 3</p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-2 px-6 mb-6 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-[#3A5A40]' : 'bg-gray-100'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="px-6 overflow-y-auto flex-1 pb-6 min-h-0">
          <AnimatePresence mode="wait">
            
            {/* --- STEP 1: RIEPILOGO PRODOTTI --- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="bg-[#F2F0E9] p-4 rounded-2xl mb-4 border border-[#E5E5E5]">
                    <p className="text-sm text-[#666666] leading-relaxed">
                        Stai per spostare <strong>{checkedItems.length} prodotti</strong> dalla lista della spesa all'inventario. Controlla che sia tutto corretto.
                    </p>
                </div>

                {checkedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 border-b border-gray-50 last:border-0">
                    <span className="text-2xl w-10 text-center">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-bold text-[#1A1A1A]">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                    </div>
                    <AvatarStack owners={item.owners} size="xs" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* --- STEP 2: INSERIMENTO PREZZI --- */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Tasto Scansione */}
                <button
                    onClick={handleScanReceipt}
                    disabled={isScanning}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-sm border ${
                    isScanning || scanComplete
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-white text-[#3A5A40] border-[#3A5A40] hover:bg-[#3A5A40]/5'
                    }`}
                >
                    {isScanning ? (
                        <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Analisi in corso...
                        </>
                    ) : scanComplete ? (
                        <>
                            <Check className="w-5 h-5" />
                            Prezzi rilevati! (Tocca per rifare)
                        </>
                    ) : (
                        <>
                            <Camera className="w-5 h-5" />
                            Scansiona scontrino per prezzi auto
                        </>
                    )}
                </button>

                {/* Lista Input Prezzi */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {scanComplete ? 'Verifica i prezzi rilevati' : 'Inserisci i prezzi manualmente'}
                    </p>
                    
                    {checkedItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-2xl w-10 text-center">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-[#1A1A1A] truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.quantity} {item.unit}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-28 border border-gray-200 focus-within:border-[#3A5A40] focus-within:ring-1 focus-within:ring-[#3A5A40] transition-all">
                                <span className="text-gray-400 text-sm">€</span>
                                <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={prices[item.id]}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className="bg-transparent w-full outline-none text-right font-bold text-[#1A1A1A]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Totale Parziale */}
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                    <span className="text-gray-500 font-medium">Totale parziale</span>
                    <span className="text-xl font-bold text-[#3A5A40]">€ {calculateTotal().toFixed(2)}</span>
                </div>
              </motion.div>
            )}

            {/* --- STEP 3: CONFERMA FINALE --- */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="w-24 h-24 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-[#3A5A40] rounded-full flex items-center justify-center shadow-lg shadow-[#3A5A40]/30">
                        <Check className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                </div>
                
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Tutto pronto!</h3>
                <p className="text-gray-500 mb-8 max-w-[80%] mx-auto">
                    Hai speso un totale di <strong className="text-[#3A5A40]">€ {calculateTotal().toFixed(2)}</strong> per {checkedItems.length} prodotti.
                </p>

                <div className="w-full bg-[#F2F0E9] rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Prodotti</span>
                        <span className="font-bold">{checkedItems.length}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Metodo prezzi</span>
                        <span className="font-bold">{scanComplete ? 'Scontrino AI' : 'Manuale'}</span>
                    </div>
                    <div className="h-px bg-gray-300/50 my-1" />
                    <div className="flex justify-between text-lg font-bold text-[#1A1A1A]">
                        <span>Totale</span>
                        <span>€ {calculateTotal().toFixed(2)}</span>
                    </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-gray-100 shrink-0 bg-white">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#3A5A40]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Continua
              <ChevronRight className="w-5 h-5 opacity-80" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              Conferma e Sposta
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}