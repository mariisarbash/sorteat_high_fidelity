import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ArrowLeft, Check, Trash2, ShoppingBag } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { OwnerSelector } from '../components/spesa/OwnerSelector';
import { useProducts } from '../context/ProductsContext';

// Categorie corrette per l'INVENTARIO
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
  const scrollRef = useRef(null); // Per scrollare in alto dopo l'aggiunta
  
  // Stato per la lista temporanea dei prodotti da aggiungere
  const [pendingProducts, setPendingProducts] = useState([]);
  
  // Stato del form attuale
  const [formData, setFormData] = useState(initialFormState);

  // Calcola la data di oggi per il min dell'input date
  const today = new Date().toISOString().split('T')[0];

  // Aggiunge il prodotto attuale alla lista temporanea
  const handleAddToQueue = () => {
    if (!formData.name.trim()) {
      toast.error('Inserisci il nome del prodotto');
      return;
    }

    // Validazione Prezzo Negativo (ridondante ma sicura)
    if (formData.price && parseFloat(formData.price) < 0) {
      toast.error('Il prezzo non può essere negativo');
      return;
    }

    const tempProduct = {
      ...formData,
      tempId: Date.now(), // ID temporaneo per la lista UI
      price: formData.price ? parseFloat(formData.price) : null,
    };

    setPendingProducts(prev => [...prev, tempProduct]);
    toast.success(`${formData.name} aggiunto alla lista!`, { duration: 1500 });
    
    // Reset del form mantenendo categoria e proprietari (spesso sono uguali per prodotti successivi)
    setFormData(prev => ({
      ...initialFormState,
      category: prev.category,
      owners: prev.owners
    }));

    // Scrolla leggermente in alto per far vedere che il form è vuoto
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Rimuove un prodotto dalla lista temporanea
  const handleRemoveFromQueue = (tempId) => {
    setPendingProducts(prev => prev.filter(p => p.tempId !== tempId));
  };

  // Salva TUTTI i prodotti nell'inventario reale
  const handleFinalSave = () => {
    if (pendingProducts.length === 0) return;

    // Prepara i dati finali
    const productsToSave = pendingProducts.map(({ tempId, ...product }) => ({
      id: Date.now() + Math.random(), // Genera ID univoci reali
      ...product,
      // Logica Owner: se 3 owner -> 'shared', altrimenti primo owner o array
      owner: product.owners.length === 3 ? 'shared' : (product.owners[0] || 'mari'),
      expiry_date: product.expiryDate || null,
      added_date: new Date().toISOString(),
    }));

    addProducts(productsToSave);
    toast.success(`${productsToSave.length} prodotti aggiunti all'inventario!`);
    
    setTimeout(() => {
      // Reindirizza all'inventario per vedere i nuovi prodotti
      navigate('/Inventario');
    }, 800);
  };

  const adjustQuantity = (delta) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  // Gestione Input Prezzo (Prevenzione negativi)
  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setFormData(prev => ({ ...prev, price: '' }));
      return;
    }
    const num = parseFloat(val);
    if (num >= 0) {
      setFormData(prev => ({ ...prev, price: val }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#F7F6F3] flex flex-col"
    >
      <Toaster position="top-center" richColors />
      
      {/* Header Fisso */}
      <div className="bg-[#3A5A40] text-white px-5 pt-12 pb-6 rounded-b-3xl shadow-md z-10 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Inserisci prodotti</h1>
              <p className="text-white/70 text-xs">
                {pendingProducts.length === 0 
                  ? "Compila il form per iniziare" 
                  : `${pendingProducts.length} prodotti in attesa`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto Scrollabile */}
      {/* RIPRISTINATO padding inferiore normale (pb-32) dato che non c'è la navbar */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
        
        {/* --- FORM DI INSERIMENTO --- */}
        <div className="space-y-5">
          {/* Nome e Icona */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Cosa stai aggiungendo? *</label>
            <div className="flex gap-3">
               {/* Selettore Icona Semplificato */}
               <div className="shrink-0">
                <div className="w-14 h-[50px] bg-white rounded-2xl flex items-center justify-center text-2xl border border-gray-100">
                  {formData.icon}
                </div>
               </div>
               <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Es. Pomodori"
                className="flex-1 px-4 bg-white rounded-2xl text-[#1A1A1A] placeholder:text-gray-400 border border-gray-100 font-medium"
              />
            </div>
            {/* Quick Emoji Picker */}
            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar mt-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                    formData.icon === emoji ? 'bg-[#3A5A40] text-white' : 'bg-white border border-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Quantità e Unità */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-[#666666] mb-2 block">Quantità *</label>
              <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-gray-100">
                <button onClick={() => adjustQuantity(-1)} className="w-10 h-10 rounded-xl bg-[#F2F0E9] flex items-center justify-center active:scale-95">
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="flex-1 text-center bg-transparent font-bold text-[#1A1A1A]"
                />
                <button onClick={() => adjustQuantity(1)} className="w-10 h-10 rounded-xl bg-[#F2F0E9] flex items-center justify-center active:scale-95">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-1/3">
              <label className="text-sm font-medium text-[#666666] mb-2 block">Unità</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full h-[54px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 font-medium"
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Categoria Inventario */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Dove lo metti? *</label>
            <div className="grid grid-cols-3 gap-2">
              {inventoryCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                    formData.category === cat.id
                      ? 'bg-[#3A5A40] text-white border-[#3A5A40]'
                      : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prezzo e Scadenza */}
          <div className="flex gap-3">
            <div className="flex-1">
               <label className="text-sm font-medium text-[#666666] mb-2 block">Scadenza</label>
               <input
                type="date"
                min={today} // BLOCCO DATE PASSATE
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full h-[50px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-[#666666] mb-2 block">Prezzo (€)</label>
              <input
                type="number"
                min="0" // HTML Validation
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={handlePriceChange} // JS Validation
                className="w-full h-[50px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Proprietari */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Di chi è?</label>
            <OwnerSelector
              selectedOwners={formData.owners}
              onChange={(owners) => setFormData(prev => ({ ...prev, owners }))}
              size="md"
            />
          </div>

          {/* Bottone Aggiungi alla coda */}
          <button
            onClick={handleAddToQueue}
            disabled={!formData.name.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all ${
              formData.name.trim() 
                ? 'bg-white text-[#3A5A40] border-2 border-[#3A5A40]' 
                : 'bg-gray-100 text-gray-400 border-2 border-transparent'
            }`}
          >
            <Plus className="w-5 h-5" />
            Aggiungi alla lista
          </button>
        </div>

        {/* --- LISTA DI RIEPILOGO (Prodotti in attesa) --- */}
        {pendingProducts.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-[#1A1A1A] font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#3A5A40]" />
              Prodotti pronti ({pendingProducts.length})
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence mode='popLayout'>
                {pendingProducts.map((p) => (
                  <motion.div
                    key={p.tempId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{p.icon}</div>
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.quantity} {p.unit} • {inventoryCategories.find(c => c.id === p.category)?.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromQueue(p.tempId)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* --- FOOTER FLOTTANTE (RIPRISTINATO a bottom-0) --- */}
      {pendingProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-5 z-20"> 
          <div className="max-w-md mx-auto">
            <button
              onClick={handleFinalSave}
              // Ho aggiunto "shadow-xl" per dare più stacco visto che non c'è più lo sfondo bianco sotto
              className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
            >
              <Check className="w-6 h-6" />
              Conferma inserimento ({pendingProducts.length})
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}