import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ChevronRight, User } from 'lucide-react';
import { toast } from 'sonner';

// Roommates per il selector
const ROOMMATES = [
  { id: 'shared', label: 'Tutti' },
  { id: 'mari', label: 'Mari' },
  { id: 'gio', label: 'Gio' },
  { id: 'pile', label: 'Pile' },
];

const CATEGORIES = [
    { id: 'frigo', label: 'Frigo' },
    { id: 'dispensa', label: 'Dispensa' },
    { id: 'freezer', label: 'Freezer' }
];

export default function CheckoutModal({ isOpen, onClose, checkedItems, onConfirm }) {
  // FIX 4.2: Stato locale per gestire le modifiche durante il checkout
  const [itemsToCheckout, setItemsToCheckout] = useState([]);

  // Inizializza lo stato quando il modale si apre
  useEffect(() => {
    if (isOpen && checkedItems) {
      setItemsToCheckout(checkedItems.map(item => ({
        ...item,
        // Mantieni l'owner originale se esiste ed è singolo, altrimenti shared
        finalOwner: item.owners && item.owners.length === 1 ? item.owners[0] : 'shared',
        // Mappa il dipartimento a una categoria inventario sensata
        finalCategory: mapDeptToCategory(item.department),
        // Quantità modificabile
        finalQuantity: item.quantity
      })));
    }
  }, [isOpen, checkedItems]);

  const mapDeptToCategory = (dept) => {
      if (dept === 'freschi') return 'frigo';
      if (dept === 'ortofrutta') return 'frigo';
      return 'dispensa'; // Default
  };

  const handleUpdateItem = (index, field, value) => {
    const newItems = [...itemsToCheckout];
    newItems[index] = { ...newItems[index], [field]: value };
    setItemsToCheckout(newItems);
  };

  const handleConfirm = () => {
    // Prepara i dati puliti per l'inventario
    const productsToAdd = itemsToCheckout.map(item => ({
        name: item.name,
        icon: item.icon,
        quantity: item.finalQuantity,
        unit: item.unit,
        owner: item.finalOwner, // FIX 4.1: Owner corretto passato
        category: item.finalCategory
    }));

    onConfirm(productsToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="p-6 pb-2">
            <h2 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-[#3A5A40]" />
                Riepilogo Spesa
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                Controlla i dettagli prima di spostare in dispensa.
            </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
            {itemsToCheckout.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-[#1A1A1A]">{item.name}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Quantità */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Quantità</label>
                            <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-gray-200">
                                <input 
                                    type="number"
                                    value={item.finalQuantity}
                                    onChange={(e) => handleUpdateItem(index, 'finalQuantity', e.target.value)}
                                    className="w-full font-bold text-[#1A1A1A] outline-none text-sm"
                                />
                                <span className="text-xs text-gray-400 font-medium">{item.unit}</span>
                            </div>
                        </div>

                        {/* Owner Selector */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Di chi è?</label>
                            <select 
                                value={item.finalOwner}
                                onChange={(e) => handleUpdateItem(index, 'finalOwner', e.target.value)}
                                className="w-full bg-white rounded-lg px-2 py-1.5 border border-gray-200 text-sm font-medium outline-none"
                            >
                                {ROOMMATES.map(r => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Selector */}
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Dove lo metti?</label>
                            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleUpdateItem(index, 'finalCategory', cat.id)}
                                        className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                                            item.finalCategory === cat.id 
                                            ? 'bg-[#3A5A40] text-white' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
            <button
                onClick={handleConfirm}
                className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#3A5A40]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                Conferma e Sposta in Frigo
                <ChevronRight className="w-5 h-5" />
            </button>
            <button 
                onClick={onClose}
                className="w-full text-center text-gray-400 text-sm font-medium mt-3 hover:text-gray-600"
            >
                Annulla
            </button>
        </div>
      </motion.div>
    </div>
  );
}