import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ArrowLeft, Check, Trash2, Calendar, Edit2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { OwnerSelector } from '../components/spesa/OwnerSelector'; 
import AvatarStack from '../components/spesa/AvatarStack'; 
import { useProducts } from '../context/ProductsContext';

const inventoryCategories = [
  { id: 'frigo', name: 'Frigo', icon: '❄️' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'freezer', name: 'Freezer', icon: '🧊' },
];

const units = ['pz', 'g', 'kg', 'ml', 'L', 'confezione'];
const commonEmojis = ['🍅', '🍌', '🥬', '🧀', '🥓', '🍞', '🍝', '🫒', '🧴', '🥛', '🍎', '🥚', '🍗', '📦'];

const initialFormState = {
  name: '',
  icon: '📦',
  quantity: 1,
  unit: 'pz',
  category: 'frigo',
  owners: ['mari'],
  price: '',
  expiryDate: '',
};

export default function ManualProductEntry() {
  const navigate = useNavigate();
  const { addProducts } = useProducts();
  const scrollRef = useRef(null); 
  
  const [form, setForm] = useState(initialFormState);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Stato per gestire la modifica
  const [editingId, setEditingId] = useState(null);

  const handleOwnerChange = (newOwners) => {
      if (!newOwners.includes('mari')) {
          toast.error("Devi essere tra i proprietari!");
          setForm(prev => ({ ...prev, owners: [...newOwners, 'mari'] }));
      } else {
          setForm(prev => ({ ...prev, owners: newOwners }));
      }
  };

  // Funzione unificata: Aggiunge o Aggiorna
  const handleAddOrUpdateQueue = () => {
    if (!form.name.trim()) {
      toast.error("Inserisci il nome del prodotto");
      return;
    }

    if (editingId) {
        // --- LOGICA MODIFICA ---
        setPendingProducts(prev => prev.map(p => 
            p.tempId === editingId ? { ...form, tempId: editingId } : p
        ));
        toast.success("Prodotto modificato");
        setEditingId(null);
    } else {
        // --- LOGICA AGGIUNTA NUOVO ---
        const newProduct = {
            ...form,
            tempId: Date.now(),
        };
        setPendingProducts(prev => [newProduct, ...prev]);
        toast.success("Aggiunto alla coda");
    }

    // Reset del form
    setForm(initialFormState); 
    
    // Scroll in alto per inserire il prossimo
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Funzione per caricare un prodotto nel form per la modifica
  const handleEditItem = (product) => {
      setForm(product);
      setEditingId(product.tempId);
      // Scroll in alto per mostrare il form compilato
      if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const handleRemoveFromQueue = (tempId) => {
    setPendingProducts(prev => prev.filter(p => p.tempId !== tempId));
    // Se stavo modificando proprio quello che ho cancellato, resetto il form
    if (editingId === tempId) {
        setEditingId(null);
        setForm(initialFormState);
    }
  };

  const handleFinalSave = () => {
    if (pendingProducts.length === 0) return;
    addProducts(pendingProducts);
    toast.success(`${pendingProducts.length} prodotti aggiunti all'inventario`);
    navigate('/inventario');
  };

  return (
    <div className="bg-white min-h-screen pb-32" ref={scrollRef}>
      <Toaster position="top-center" />
      
      {/* HEADER COMPATTO */}
      <div className="px-5 pt-4 pb-2 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">
            {editingId ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
          </h1>
        </div>
      </div>

      <div className="px-5 mt-2 space-y-5">
        
        {/* --- FORM COMPATTO --- */}

        {/* 1. NOME E ICONA */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1A1A] ml-1">Cosa hai comprato?</label>
            <div className="flex gap-2 relative">
                <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-12 h-12 bg-[#F2F0E9] rounded-xl flex items-center justify-center text-2xl active:scale-95 transition-transform shrink-0 shadow-sm"
                >
                    {form.icon}
                </button>
                <div className="flex-1 bg-[#F2F0E9] rounded-xl px-3 py-0 flex items-center shadow-sm h-12">
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        placeholder="Es. Pomodori..."
                        className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-bold text-base placeholder:text-gray-400 placeholder:font-normal"
                    />
                </div>

                {/* Icon Picker */}
                {showIconPicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 grid grid-cols-5 gap-2 z-50">
                        {commonEmojis.map(emoji => (
                            <button 
                                key={emoji} 
                                onClick={() => { setForm({...form, icon: emoji}); setShowIconPicker(false); }}
                                className="text-2xl hover:scale-110 transition-transform p-1"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* 2. QUANTITÀ E UNITÀ */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1A1A] ml-1">Quantità</label>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F2F0E9] rounded-xl p-1.5 flex items-center justify-between shadow-sm h-12">
                    <button 
                        onClick={() => setForm(prev => ({...prev, quantity: Math.max(0, Number(prev.quantity) - 1)}))}
                        className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <input 
                        type="number"
                        value={form.quantity}
                        onChange={(e) => setForm({...form, quantity: e.target.value})}
                        className="w-full bg-transparent text-center font-bold text-lg text-[#1A1A1A] outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button 
                        onClick={() => setForm(prev => ({...prev, quantity: Number(prev.quantity) + 1}))}
                        className="w-9 h-9 bg-white rounded-lg shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="bg-[#F2F0E9] rounded-xl px-3 flex items-center shadow-sm h-12">
                    <select 
                        value={form.unit}
                        onChange={(e) => setForm({...form, unit: e.target.value})}
                        className="bg-transparent border-none outline-none w-full font-bold text-[#1A1A1A] text-base appearance-none"
                    >
                        {units.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* 3. CATEGORIA */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1A1A] ml-1">Dove lo conservi?</label>
            <div className="grid grid-cols-3 gap-2">
                {inventoryCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setForm({...form, category: cat.id})}
                        className={`py-2 rounded-xl font-bold flex flex-col items-center gap-0.5 transition-all ${
                            form.category === cat.id 
                            ? 'bg-[#3A5A40] text-white shadow-md' 
                            : 'bg-[#F2F0E9] text-gray-500 hover:bg-gray-200'
                        }`}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-[10px]">{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* 4. PROPRIETARIO */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-[#1A1A1A] ml-1">Di chi è?</label>
            <div className="bg-[#F2F0E9] p-3 rounded-xl shadow-sm">
                <OwnerSelector 
                    selectedOwners={form.owners} 
                    onChange={handleOwnerChange} 
                    size="sm" // Usa avatar un po' più piccoli per risparmiare spazio
                />
            </div>
        </div>

        {/* 5. DETTAGLI AGGIUNTIVI */}
        <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#1A1A1A] ml-1">Dettagli (Opzionali)</h3>
            <div className="flex gap-2">
                <div className="flex-1 bg-[#F2F0E9] rounded-xl px-3 py-0 flex items-center gap-2 shadow-sm h-12">
                    <span className="text-gray-400 font-bold text-sm">€</span>
                    <input 
                        type="number" 
                        value={form.price}
                        onChange={(e) => setForm({...form, price: e.target.value})}
                        placeholder="Prezzo"
                        className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium text-sm placeholder:font-normal"
                    />
                </div>
                <div className="flex-1 bg-[#F2F0E9] rounded-xl px-3 py-0 flex items-center gap-2 relative shadow-sm h-12">
                    <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                        type="date" 
                        value={form.expiryDate}
                        onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                        className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium text-xs"
                    />
                </div>
            </div>
        </div>

        {/* --- AZIONE PRINCIPALE --- */}
        <button 
          onClick={handleAddOrUpdateQueue}
          className={`w-full py-3.5 rounded-2xl font-bold text-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-2 ${
              editingId 
              ? 'bg-[#3A5A40] text-white shadow-[#3A5A40]/30' 
              : 'bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-gray-50'
          }`}
        >
          {editingId ? (
              <>
                <Check className="w-5 h-5" /> Salva modifiche
              </>
          ) : (
              <>
                <Plus className="w-5 h-5" /> Aggiungi un altro
              </>
          )}
        </button>

        {/* --- LISTA CODA --- */}
        {pendingProducts.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-[#1A1A1A] mb-3 flex items-center gap-2 text-sm">
                In attesa ({pendingProducts.length})
            </h3>
            <div className="space-y-2.5 pb-4">
              <AnimatePresence>
                {pendingProducts.map((p) => (
                  <motion.div 
                    key={p.tempId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => handleEditItem(p)} // CLICCA PER MODIFICARE
                    className={`border p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer transition-all ${
                        editingId === p.tempId 
                        ? 'bg-yellow-50 border-yellow-400 ring-1 ring-yellow-400' 
                        : 'bg-white border-gray-100 active:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F2F0E9] rounded-lg flex items-center justify-center text-xl">
                        {p.icon}
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A1A] text-sm leading-tight">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-gray-500 font-medium">
                            {p.quantity} {p.unit} • {inventoryCategories.find(c => c.id === p.category)?.name}
                            </p>
                            <AvatarStack owners={p.owners} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        {/* Icona Modifica visiva */}
                        <div className="p-2 text-gray-300">
                            <Edit2 className="w-4 h-4" />
                        </div>
                        <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Evita di triggerare l'edit quando cancelli
                            handleRemoveFromQueue(p.tempId);
                        }}
                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER FLOTTANTE (CONFERMA) --- */}
      <AnimatePresence>
        {pendingProducts.length > 0 && (
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 p-4 z-20 bg-white border-t border-gray-100"
            > 
            <div className="max-w-md mx-auto">
                <button
                onClick={handleFinalSave}
                className="w-full py-3.5 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#3A5A40]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                <Check className="w-5 h-5" />
                Aggiungi prodotti ({pendingProducts.length})
                </button>
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}