import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, Check, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';

const mockScannedProducts = [
  { id: 1, name: 'Latte Intero 1L', icon: '🥛', quantity: 2, price: 1.89, category: 'frigo', owner: 'mari', expiry_date: '2026-02-22' },
  { id: 2, name: 'Pane Integrale', icon: '🍞', quantity: 1, price: 2.50, category: 'dispensa', owner: 'mari', expiry_date: '2026-02-12' },
  { id: 3, name: 'Mele Fuji', icon: '🍎', quantity: 6, price: 3.20, category: 'frigo', owner: 'mari', expiry_date: '2026-02-18' },
  { id: 4, name: 'Pasta Barilla 500g', icon: '🍝', quantity: 2, price: 1.45, category: 'dispensa', owner: 'mari', expiry_date: '2027-03-01' },
  { id: 5, name: 'Yogurt Greco', icon: '🥄', quantity: 4, price: 3.60, category: 'frigo', owner: 'mari', expiry_date: '2026-02-15' },
];

export default function ScanReceipt() {
  const navigate = useNavigate();
  const [step, setStep] = useState('scan'); // scan, review
  const [products, setProducts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setProducts(mockScannedProducts);
      setStep('review');
    }, 2000);
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleToggleOwner = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const owners = ['mari', 'shared', 'gio', 'pile'];
        const currentIndex = owners.indexOf(p.owner);
        const nextOwner = owners[(currentIndex + 1) % owners.length];
        return { ...p, owner: nextOwner };
      }
      return p;
    }));
  };

  const handleToggleCategory = (id) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const categories = ['frigo', 'dispensa', 'freezer'];
        const currentIndex = categories.indexOf(p.category);
        const nextCategory = categories[(currentIndex + 1) % categories.length];
        return { ...p, category: nextCategory };
      }
      return p;
    }));
  };

  const handleConfirm = () => {
    toast.success(`${products.length} prodotti aggiunti all'inventario!`, {
      icon: '✅'
    });
    setTimeout(() => {
      navigate('/Inventario');
    }, 1500);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getOwnerLabel = (owner) => {
    switch (owner) {
      case 'mari': return 'Mio';
      case 'shared': return 'Comune';
      case 'gio': return 'Gio';
      case 'pile': return 'Pile';
      default: return 'Mio';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'frigo': return '❄️';
      case 'dispensa': return '🗄️';
      case 'freezer': return '🧊';
      default: return '📦';
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9]">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 card-shadow">
        <button
          onClick={handleCancel}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-[#1A1A1A]">Scansiona Scontrino</h1>
      </div>

      {step === 'scan' && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          {/* Mock Camera View */}
          <div className="relative w-full aspect-[3/4] max-w-xs bg-gray-900 rounded-3xl overflow-hidden mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400"
                alt="Scontrino"
                className="w-3/4 object-contain opacity-80"
              />
            </div>
            
            {/* Scan overlay */}
            <div className="absolute inset-4 border-2 border-white/50 rounded-2xl">
              {isScanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute left-0 right-0 h-0.5 bg-[#3A5A40]"
                />
              )}
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white/80 text-sm">
                {isScanning ? 'Scansione in corso...' : 'Posiziona lo scontrino nel riquadro'}
              </p>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isScanning 
                ? 'bg-gray-400' 
                : 'bg-[#3A5A40] active:scale-95'
            }`}
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
          <p className="text-sm text-[#666666] mt-3">
            {isScanning ? 'Attendere...' : 'Tocca per scansionare'}
          </p>
        </div>
      )}

      {step === 'review' && (
        <div className="p-5">
          <div className="bg-white rounded-3xl p-5 card-shadow mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1A1A1A]">Prodotti rilevati</h2>
              <span className="text-sm text-[#666666]">{products.length} elementi</span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center gap-3 p-3 bg-[#F2F0E9] rounded-2xl"
                  >
                    <span className="text-2xl">{product.icon}</span>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A1A1A] text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#666666]">x{product.quantity}</span>
                        <span className="text-xs text-[#666666]">€{product.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleCategory(product.id)}
                        className="px-2 py-1 bg-white rounded-lg text-xs active:scale-95 transition-transform"
                      >
                        {getCategoryIcon(product.category)}
                      </button>
                      <button
                        onClick={() => handleToggleOwner(product.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium active:scale-95 transition-transform ${
                          product.owner === 'mari' 
                            ? 'bg-[#3A5A40] text-white' 
                            : product.owner === 'shared'
                            ? 'bg-[#A3B18A] text-white'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {getOwnerLabel(product.owner)}
                      </button>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {products.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-[#666666]">Nessun prodotto rimasto</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-white rounded-2xl p-4 card-shadow mb-6">
            <div className="flex justify-between items-center">
              <span className="text-[#666666]">Totale scontrino</span>
              <span className="text-xl font-bold text-[#1A1A1A]">
                €{products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 bg-white rounded-2xl font-semibold text-[#1A1A1A] active:scale-[0.98] transition-transform card-shadow"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={products.length === 0}
              className={`flex-1 py-4 rounded-2xl font-semibold text-white active:scale-[0.98] transition-transform ${
                products.length === 0 ? 'bg-gray-400' : 'bg-[#3A5A40]'
              }`}
            >
              Conferma
            </button>
          </div>
        </div>
      )}
    </div>
  );
}