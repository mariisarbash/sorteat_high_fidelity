import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera, Check, RefreshCw, Box, User, Save, Calendar, Plus, Minus } from 'lucide-react';
import OwnerSelector from './OwnerSelector';
import { useProducts } from '../../context/ProductsContext';
import { toast } from 'sonner';

// Categorie identiche a ProductDetailModal e ManualProductEntry
const inventoryCategories = [
  { id: 'frigo', name: 'Frigo', icon: '❄️' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'freezer', name: 'Freezer', icon: '🧊' },
];

const units = ['pz', 'g', 'kg', 'ml', 'L', 'confezione'];
const commonEmojis = ['🍅', '🍌', '🥬', '🧀', '🥓', '🍞', '🍝', '🫒', '🧴', '🥛', '🍎', '🥚', '🍗', '📦'];

const ROOMMATES = [
  { id: 'mari', label: 'Mari', color: 'bg-pink-500' },
  { id: 'gio', label: 'Gio', color: 'bg-blue-500' },
  { id: 'pile', label: 'Pile', color: 'bg-purple-500' },
];

export default function CheckoutModal({ isOpen, onClose, checkedItems, onConfirm }) {
  const { addProducts } = useProducts();
  const [step, setStep] = useState('review'); // 'review' | 'scan'
  
  const [finalItems, setFinalItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFinalItems(checkedItems.map(item => ({
        ...item,
        finalCategory: 'frigo',
        finalOwners: item.owners || ['mari'],
        finalPrice: '',
        finalExpiry: ''
      })));
      setStep('review');
    }
  }, [isOpen, checkedItems]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFinalItems(prev => prev.map(item => ({
        ...item,
        finalPrice: (Math.random() * 4 + 0.5).toFixed(2)
      })));
      setIsScanning(false);
      setStep('review');
      toast.success('Scontrino scansionato! Prezzi aggiornati.');
    }, 2000);
  };

  const handleSaveEdit = (updatedItem) => {
    setFinalItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    setEditingItem(null);
  };

  const handleConfirmCheckout = () => {
    const productsToAdd = finalItems.map(item => ({
      name: item.name,
      icon: item.icon,
      category: item.finalCategory,
      quantity: Number(item.quantity) || 1,
      unit: item.unit,
      owner: item.finalOwners.length > 1 ? 'shared' : item.finalOwners[0],
      price: item.finalPrice,
      expiry_date: item.finalExpiry
    }));
    
    addProducts(productsToAdd);
    toast.success(`${productsToAdd.length} prodotti aggiunti all'inventario! 📦`);
    onConfirm(finalItems.map(i => i.id)); 
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-[#F9F9F9] w-full max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* HEADER */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Concludi Spesa</h2>
            <button onClick={onClose} className="p-2 -mr-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
            
            {/* WIDGET SCANSIONE */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 text-center">
                <div className="w-16 h-16 bg-[#3A5A40]/10 text-[#3A5A40] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">Hai lo scontrino?</h3>
                <p className="text-sm text-gray-500 mb-4 px-2">
                    Scansiona lo scontrino per aggiornare in automatico prezzi e quantità.
                </p>
                <button 
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="w-full py-3 bg-[#F2F0E9] text-[#1A1A1A] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#E5E3DB] transition-colors"
                >
                    {isScanning ? (
                        <><RefreshCw className="w-5 h-5 animate-spin" /> Analisi in corso...</>
                    ) : (
                        <><Camera className="w-5 h-5" /> Scansiona Ora</>
                    )}
                </button>
            </div>

            {/* LISTA PRODOTTI REVISIONATI */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-bold text-[#1A1A1A]">Riepilogo ({finalItems.length})</h3>
                    <span className="text-xs text-gray-500">Tocca per modificare</span>
                </div>
                <div className="space-y-3">
                    {finalItems.map(item => {
                        const categoryInfo = inventoryCategories.find(c => c.id === item.finalCategory) || inventoryCategories[0];
                        
                        return (
                            <motion.div 
                                key={item.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setEditingItem(item)}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 cursor-pointer hover:border-[#3A5A40]/30 transition-colors"
                            >
                                <div className="w-12 h-12 bg-[#F2F0E9] rounded-xl flex items-center justify-center text-2xl shrink-0">
                                    {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[#1A1A1A] truncate">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-xs font-medium text-[#1A1A1A] bg-gray-100 px-2 py-0.5 rounded-md">
                                            {item.quantity} {item.unit}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            {categoryInfo.icon} {categoryInfo.name}
                                        </span>
                                        {item.finalPrice && (
                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                                                €{item.finalPrice}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 flex -space-x-2">
                                    {item.finalOwners.map((ownerId, i) => {
                                        const r = ROOMMATES.find(r => r.id === ownerId) || ROOMMATES[0];
                                        return (
                                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${r.color}`}>
                                                {r.label[0]}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
          </div>

          <div className="p-5 bg-white border-t border-gray-100 shrink-0">
            <button 
                onClick={handleConfirmCheckout}
                className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#3A5A40]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
                <Check className="w-6 h-6" />
                Aggiorna Inventario
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {editingItem && (
            <CheckoutItemEditModal 
                item={editingItem} 
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                onSave={handleSaveEdit}
            />
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// ==========================================
// MODALE DI MODIFICA PRODOTTO (CLONE DI ProductDetailModal)
// ==========================================
function CheckoutItemEditModal({ item, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);

    useEffect(() => {
        if (item) {
            setFormData({
                ...item,
                name: item.name || '',
                icon: item.icon || '📦',
                quantity: item.quantity || 1,
                unit: item.unit || 'pz',
                finalCategory: item.finalCategory || 'frigo',
                finalOwners: item.finalOwners || item.owners || ['mari'],
                finalPrice: item.finalPrice || '',
                finalExpiry: item.finalExpiry || ''
            });
        }
    }, [item]);

    if (!isOpen || !formData) return null;

    const handleSave = () => {
        onSave({
            ...item,
            ...formData,
            quantity: Number(formData.quantity) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* HEADER */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
                    <div className="w-6" />
                    <h2 className="text-lg font-bold text-[#1A1A1A]">Modifica Prodotto</h2>
                    <button onClick={onClose} className="p-2 -mr-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* CORPO (Identico a ProductDetailModal > view='edit') */}
                <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-8">
                    
                    {/* NOME E ICONA */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Cosa stai modificando?</label>
                        <div className="flex gap-3 relative">
                            <button
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-14 h-14 bg-[#F2F0E9] rounded-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform shrink-0"
                            >
                                {formData.icon}
                            </button>
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Es. Pomodori..."
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-bold text-lg placeholder:text-gray-400 placeholder:font-normal"
                                />
                            </div>

                            {/* ICON PICKER */}
                            {showIconPicker && (
                                <div className="absolute top-full left-0 mt-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 grid grid-cols-5 gap-2 z-50">
                                    {commonEmojis.map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => { setFormData({...formData, icon: emoji}); setShowIconPicker(false); }}
                                            className="text-2xl hover:scale-110 transition-transform p-1"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUANTITÀ E UNITÀ */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Quantità</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F2F0E9] rounded-2xl p-2 flex items-center justify-between">
                                <button 
                                    onClick={() => setFormData(prev => ({...prev, quantity: Math.max(0, Number(prev.quantity) - 1)}))}
                                    className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <input 
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                    className="w-full bg-transparent text-center font-bold text-lg text-[#1A1A1A] outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button 
                                    onClick={() => setFormData(prev => ({...prev, quantity: Number(prev.quantity) + 1}))}
                                    className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="bg-[#F2F0E9] rounded-2xl px-4 py-2 flex items-center">
                                <select 
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    className="bg-transparent border-none outline-none w-full font-bold text-[#1A1A1A] appearance-none"
                                >
                                    {units.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* CATEGORIA */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Dove lo conservi?</label>
                        <div className="grid grid-cols-3 gap-2">
                            {inventoryCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({...formData, finalCategory: cat.id})}
                                    className={`py-3 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all ${
                                        formData.finalCategory === cat.id 
                                        ? 'bg-[#3A5A40] text-white shadow-md' 
                                        : 'bg-[#F2F0E9] text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="text-xs">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PROPRIETARIO */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Di chi è?</label>
                        <OwnerSelector 
                            selectedOwners={formData.finalOwners}
                            onChange={(owners) => setFormData({...formData, finalOwners: owners})}
                            onSelectionChange={(owners) => setFormData({...formData, finalOwners: owners})}
                        />
                    </div>

                    {/* DETTAGLI AGGIUNTIVI */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] ml-1">Dettagli Aggiuntivi</h3>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center gap-3">
                                <span className="text-gray-400 font-bold">€</span>
                                <input 
                                    type="number" 
                                    value={formData.finalPrice}
                                    onChange={(e) => setFormData({...formData, finalPrice: e.target.value})}
                                    placeholder="Prezzo"
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium placeholder:font-normal"
                                />
                            </div>
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center gap-3 relative">
                                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                                <input 
                                    type="date" 
                                    value={formData.finalExpiry}
                                    onChange={(e) => setFormData({...formData, finalExpiry: e.target.value})}
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER BOTTONI */}
                <div className="p-5 bg-white border-t border-gray-50 shrink-0">
                    <button 
                        onClick={handleSave} 
                        className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#3A5A40]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        <Check className="w-6 h-6" /> Salva Modifiche
                    </button>
                </div>

            </motion.div>
        </div>
    );
}