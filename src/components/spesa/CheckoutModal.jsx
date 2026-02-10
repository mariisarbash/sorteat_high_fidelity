import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import AvatarStack from './AvatarStack';

// Mock prodotti extra trovati nella scansione
const mockExtraProducts = [
  { id: 'extra1', name: 'Crackers', icon: '🍘', quantity: 1, unit: 'pz', owners: ['mari', 'gio', 'pile'] },
];

export default function CheckoutModal({ isOpen, onClose, checkedItems, onConfirm }) {
  const [step, setStep] = useState(1); // 1: riepilogo, 2: importo, 3: conferma
  const [totalAmount, setTotalAmount] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [missingProducts, setMissingProducts] = useState([]);

  const handleScan = () => {
    setIsScanning(true);
    // Simula scansione
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      
      // Simula: trova tutti tranne uno, più uno extra
      const missing = checkedItems.length > 1 ? [checkedItems[checkedItems.length - 1]] : [];
      const found = checkedItems.filter(item => !missing.includes(item));
      
      setScannedProducts([...found, ...mockExtraProducts]);
      setMissingProducts(missing);
    }, 2500);
  };

  const handleConfirm = () => {
    // Passa i prodotti da aggiungere all'inventario
    const productsToAdd = scanComplete ? scannedProducts : checkedItems;
    onConfirm(productsToAdd);
    onClose();
    // Reset state
    setStep(1);
    setTotalAmount('');
    setScanComplete(false);
    setScannedProducts([]);
    setMissingProducts([]);
  };

  const resetAndClose = () => {
    onClose();
    setStep(1);
    setTotalAmount('');
    setScanComplete(false);
    setIsScanning(false);
    setScannedProducts([]);
    setMissingProducts([]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-hidden max-w-md mx-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            )}
            <h2 className="text-lg font-bold text-[#1A1A1A]">
              {step === 1 && 'Riepilogo carrello'}
              {step === 2 && 'Totale spesa'}
              {step === 3 && 'Conferma'}
            </h2>
          </div>
          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-2 px-5 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-[#3A5A40]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pb-8 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {/* Step 1: Riepilogo */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-sm text-[#666666] mb-3">
                  {checkedItems.length} prodotti nel carrello
                </p>
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-[#F2F0E9] rounded-2xl"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A1A1A] text-sm">{item.name}</p>
                      <p className="text-xs text-[#666666]">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <AvatarStack owners={item.owners} size="xs" />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 2: Importo */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {!scanComplete ? (
                  <>
                    {/* Input manuale */}
                    <div>
                      <label className="text-sm font-medium text-[#666666] mb-2 block">
                        Inserisci il totale
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] font-semibold">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-4 bg-[#F2F0E9] rounded-2xl text-[#1A1A1A] text-xl font-semibold placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-sm text-[#666666]">oppure</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Scansione scontrino */}
                    <button
                      onClick={handleScan}
                      disabled={isScanning}
                      className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all ${
                        isScanning
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-[#3A5A40] text-white active:scale-[0.98]'
                      }`}
                    >
                      <Camera className="w-5 h-5" />
                      {isScanning ? 'Scansione in corso...' : 'Scansiona scontrino'}
                    </button>

                    {/* Animazione scansione */}
                    {isScanning && (
                      <div className="relative h-40 bg-gray-900 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200"
                            alt="Scontrino"
                            className="w-1/2 object-contain opacity-60"
                          />
                        </div>
                        <motion.div
                          initial={{ top: 0 }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute left-0 right-0 h-1 bg-[#3A5A40] shadow-lg shadow-[#3A5A40]/50"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Risultato scansione */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-2xl">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Scontrino scansionato!</span>
                    </div>

                    {/* Prodotti trovati */}
                    <div>
                      <p className="text-sm font-medium text-[#666666] mb-2">
                        Prodotti trovati ({scannedProducts.length})
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {scannedProducts.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 p-2 bg-green-50 rounded-xl text-sm"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prodotti mancanti */}
                    {missingProducts.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-[#666666] mb-2">
                          Non trovati ({missingProducts.length})
                        </p>
                        <div className="space-y-2">
                          {missingProducts.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl text-sm"
                            >
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>{item.icon}</span>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-xs text-[#666666] ml-auto">Resta in lista</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Conferma */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-4"
              >
                <div className="w-20 h-20 rounded-full bg-[#3A5A40]/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-[#3A5A40]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  Tutto pronto!
                </h3>
                <p className="text-[#666666] mb-4">
                  {scanComplete 
                    ? `${scannedProducts.length} prodotti verranno aggiunti all'inventario`
                    : `${checkedItems.length} prodotti verranno aggiunti all'inventario`
                  }
                </p>
                {totalAmount && (
                  <p className="text-2xl font-bold text-[#3A5A40]">
                    € {parseFloat(totalAmount).toFixed(2)}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer buttons */}
        <div className="px-5 pb-8 pt-2 border-t border-gray-100">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && !totalAmount && !scanComplete}
              className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
                (step === 2 && !totalAmount && !scanComplete)
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-[#3A5A40] text-white active:scale-[0.98]'
              }`}
            >
              Continua
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-[#3A5A40] rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Check className="w-5 h-5" />
              Conferma e aggiungi all'inventario
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
