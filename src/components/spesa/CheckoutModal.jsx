import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, Check, RefreshCw, Box, User, Save, Calendar } from 'lucide-react';
import OwnerSelector from './OwnerSelector'; // IMPORTANTE: Usa il componente reale per i sottogruppi!

// Mock prezzi per la simulazione scontrino
const MOCK_PRICES = {
  'Latte': 1.20, 'Pane': 1.50, 'Pasta': 0.90, 'Pomodori': 2.50,
  'Banane': 1.80, 'Mozzarella': 1.10, 'Detersivo': 3.50, 'Uova': 2.20
};

// Categorie identiche a ManualProductEntry / CategoryPills
const CATEGORIES = [
  { id: 'frigo', label: 'Frigo', icon: '❄️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'dispensa', label: 'Dispensa', icon: '🥫', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'freezer', label: 'Freezer', icon: '🧊', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
];

const ROOMMATES = [
  { id: 'mari', label: 'Mari', color: 'bg-pink-500' },
  { id: 'gio', label: 'Gio', color: 'bg-blue-500' },
  { id: 'pile', label: 'Pile', color: 'bg-purple-500' },
];

export default function CheckoutModal({ isOpen, onClose, checkedItems, onConfirm }) {
  const [step, setStep] = useState(1); 
  const [prices, setPrices] = useState({}); 
  const [itemsToCheckout, setItemsToCheckout] = useState([]);
  
  // Stato per il modale di modifica singolo item
  const [editingItem, setEditingItem] = useState(null); 
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Inizializza i dati quando si apre il checkout
  useEffect(() => {
    if (isOpen) {
      // Prezzi vuoti
      const initialPrices = {};
      checkedItems.forEach(item => initialPrices[item.id] = '');
      setPrices(initialPrices);

      // Preparazione items con logica intelligente
      const initialItems = checkedItems.map(item => ({
        ...item,
        // Default expiry date: oggi + 7 giorni
        finalExpiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // Default owner: se c'è un solo owner lo preimposta, altrimenti array vuoto (che OwnerSelector gestisce come "Nessuno" o "Tutti" a seconda della logica)
        finalOwners: item.owners || ['shared'], 
        finalCategory: mapDeptToCategory(item.department),
        finalQuantity: item.quantity
      }));
      setItemsToCheckout(initialItems);
    }
  }, [isOpen, checkedItems]);

  const mapDeptToCategory = (dept) => {
    if (dept === 'freschi' || dept === 'ortofrutta') return 'frigo';
    if (dept === 'surgelati') return 'freezer';
    return 'dispensa';
  };

  const handleEditClick = (item) => {
    setEditingItem({ ...item }); 
  };

  const handleSaveEdit = (updatedItem) => {
    setItemsToCheckout(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const handlePriceChange = (id, value) => {
    setPrices(prev => ({ ...prev, [id]: value }));
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
    setTimeout(() => {
      const detectedPrices = {};
      checkedItems.forEach(item => {
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

  const handleConfirmCheckout = () => {
    const productsToConfirm = itemsToCheckout.map(item => ({
      ...item,
      quantity: parseFloat(item.finalQuantity),
      owner: item.finalOwners.length === 1 ? item.finalOwners[0] : 'shared', // Semplificazione per il context attuale
      owners: item.finalOwners, // Passiamo anche l'array completo se il context lo supporta
      category: item.finalCategory,
      expiry_date: item.finalExpiryDate, // Passiamo la scadenza
      price: parseFloat(prices[item.id]) || 0,
      purchase_date: new Date().toISOString()
    }));
    
    onConfirm(productsToConfirm);
    resetAndClose();
  };

  const resetAndClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setPrices({});
      setItemsToCheckout([]);
      setScanComplete(false);
      setIsScanning(false);
      setEditingItem(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] flex flex-col max-w-md mx-auto shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header Principale */}
        <div className="flex items-center justify-between px-6 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                {step === 1 && 'Controlla Prodotti'}
                {step === 2 && 'Prezzi'}
                {step === 3 && 'Conferma'}
                </h2>
                <p className="text-xs text-gray-500 font-medium">Step {step} di 3</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex gap-2 px-6 mb-6 shrink-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#3A5A40]' : 'bg-gray-100'}`} />
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="px-6 overflow-y-auto flex-1 pb-6 min-h-0">
          <AnimatePresence mode="wait">
            
            {/* --- STEP 1: LISTA (Tocca per modificare) --- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div className="bg-[#F2F0E9] p-4 rounded-2xl mb-4 border border-[#E5E5E5]">
                    <p className="text-sm text-[#666666] leading-relaxed">
                        Tocca un prodotto per modificare <strong>quantità</strong>, <strong>scadenza</strong> o <strong>proprietari</strong>.
                    </p>
                </div>

                {itemsToCheckout.map((item) => {
                    const categoryData = CATEGORIES.find(c => c.id === item.finalCategory);
                    // Logica semplice per mostrare chi paga/possiede nella card riassuntiva
                    const ownerLabel = item.finalOwners.length > 1 ? 'Condiviso' : 
                                       item.finalOwners.length === 1 && item.finalOwners[0] !== 'shared' 
                                       ? ROOMMATES.find(r => r.id === item.finalOwners[0])?.label 
                                       : 'Tutti';

                    return (
                        <motion.div 
                            key={item.id} 
                            onClick={() => handleEditClick(item)}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3 relative overflow-hidden active:bg-gray-50 cursor-pointer"
                        >
                            <span className="text-2xl w-10 text-center shrink-0">{item.icon}</span>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[#1A1A1A] truncate">{item.name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[#1A1A1A] font-bold">
                                        {item.finalQuantity} {item.unit}
                                    </span>
                                    <span>•</span>
                                    {categoryData && (
                                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${categoryData.color.replace('border', 'bg').split(' ')[0]} bg-opacity-20`}>
                                            {categoryData.icon} {categoryData.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-400">{ownerLabel}</span>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </div>
                        </motion.div>
                    );
                })}
              </motion.div>
            )}

            {/* --- STEP 2: PREZZI --- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <button
                    onClick={handleScanReceipt}
                    disabled={isScanning}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-sm border ${
                    isScanning || scanComplete ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-[#3A5A40] border-[#3A5A40] hover:bg-[#3A5A40]/5'}`}
                >
                    {isScanning ? <><RefreshCw className="w-5 h-5 animate-spin" /> Analisi...</> : scanComplete ? <><Check className="w-5 h-5" /> Prezzi rilevati!</> : <><Camera className="w-5 h-5" /> Scansiona scontrino</>}
                </button>

                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prezzi singoli</p>
                    {checkedItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-xl w-8 text-center">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-[#1A1A1A] truncate">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-2 w-24 border border-gray-200 focus-within:border-[#3A5A40]">
                                <span className="text-gray-400 text-sm">€</span>
                                <input 
                                    type="number" placeholder="0.00" value={prices[item.id]} onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className="bg-transparent w-full outline-none text-right font-bold text-[#1A1A1A] text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                    <span className="text-gray-500 font-medium">Totale</span>
                    <span className="text-xl font-bold text-[#3A5A40]">€ {calculateTotal().toFixed(2)}</span>
                </div>
              </motion.div>
            )}

            {/* --- STEP 3: CONFERMA --- */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-24 h-24 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-[#3A5A40] rounded-full flex items-center justify-center shadow-lg shadow-[#3A5A40]/30">
                        <Check className="w-8 h-8 text-white stroke-[3]" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Spesa Conclusa!</h3>
                <p className="text-gray-500 mb-8 max-w-[80%] mx-auto">Totale speso: <strong className="text-[#3A5A40]">€ {calculateTotal().toFixed(2)}</strong>. I prodotti sono stati spostati in dispensa.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-6 border-t border-gray-100 shrink-0 bg-white">
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#3A5A40]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              Continua <ChevronRight className="w-5 h-5 opacity-80" />
            </button>
          ) : (
            <button onClick={handleConfirmCheckout} className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
              Finito <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {/* --- NESTED MODAL: EDIT ITEM (Clone di ManualProductEntry) --- */}
      <AnimatePresence>
        {editingItem && (
            <CheckoutItemEditModal 
                item={editingItem} 
                onClose={() => setEditingItem(null)} 
                onSave={handleSaveEdit} 
            />
        )}
      </AnimatePresence>
    </>
  );
}

// --- SUB-COMPONENT: EDIT MODAL ---
// Questo è una copia adattata di ManualProductEntry.jsx per garantire lo stesso look & feel
function CheckoutItemEditModal({ item, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...item });

    // Funzione per aggiornare i proprietari usando la logica dell'OwnerSelector
    const handleOwnersChange = (newOwners) => {
        setFormData(prev => ({ ...prev, finalOwners: newOwners }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-auto">
            {/* Backdrop Scuro sopra il precedente */}
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Card - Stile identico a ManualProductEntry */}
            <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 pb-8 shadow-2xl z-10"
            >
                {/* Header con Icona grande */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#F2F0E9] rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                            {formData.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#1A1A1A]">{formData.name}</h3>
                            <p className="text-sm text-gray-400 font-medium">Modifica dettaglio</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Fields - Struttura copiata da ManualProductEntry */}
                <div className="space-y-6">
                    
                    {/* 1. Quantità (Input grande) */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quantità</label>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-[#F9F9F9] rounded-2xl border border-gray-200 focus-within:border-[#3A5A40] focus-within:bg-white transition-all flex items-center px-4 py-4 shadow-sm">
                                <input 
                                    type="number" 
                                    value={formData.finalQuantity}
                                    onChange={(e) => setFormData({...formData, finalQuantity: e.target.value})}
                                    className="w-full bg-transparent font-bold text-2xl text-[#1A1A1A] outline-none placeholder:text-gray-300"
                                />
                            </div>
                            <div className="w-28 bg-[#F9F9F9] rounded-2xl flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                                {formData.unit}
                            </div>
                        </div>
                    </div>

                    {/* 2. Scadenza (Input Data standard) */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Scadenza</label>
                        <div className="bg-[#F9F9F9] rounded-2xl border border-gray-200 focus-within:border-[#3A5A40] focus-within:bg-white transition-all flex items-center px-4 py-3 shadow-sm">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <input 
                                type="date"
                                value={formData.finalExpiryDate}
                                onChange={(e) => setFormData({...formData, finalExpiryDate: e.target.value})}
                                className="w-full bg-transparent font-medium text-[#1A1A1A] outline-none text-base"
                            />
                        </div>
                    </div>

                    {/* 3. Categoria (Pillole con icone uguali a ManualProductEntry) */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Dove lo metti?</label>
                        <div className="flex gap-2">
                            {CATEGORIES.map(cat => {
                                const isSelected = formData.finalCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFormData({...formData, finalCategory: cat.id})}
                                        className={`flex-1 py-3 px-2 rounded-xl font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                                            isSelected
                                            ? `${cat.color} shadow-md scale-[1.02]`
                                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                                        }`}
                                    >
                                        <span className="text-xl">{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Proprietari (OwnerSelector Component) */}
                    <div>
                        <OwnerSelector 
                            selectedOwners={formData.finalOwners}
                            onSelectionChange={handleOwnersChange}
                        />
                    </div>

                    {/* Save Button */}
                    <button 
                        onClick={handleSave}
                        className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#3A5A40]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-6"
                    >
                        Salva modifiche
                        <Check className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}