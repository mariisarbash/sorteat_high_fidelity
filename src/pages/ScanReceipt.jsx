import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Trash2, ChevronLeft, Check, ShoppingBag, Edit2, X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { useProducts } from '../context/ProductsContext';
import { OwnerSelector } from '../components/spesa/OwnerSelector';

// --- DATI COSTANTI ---
const inventoryCategories = [
  { id: 'frigo', name: 'Frigo', icon: '❄️' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'freezer', name: 'Freezer', icon: '🧊' },
];
const units = ['pz', 'g', 'kg', 'ml', 'L', 'confezione'];
const commonEmojis = ['🍅', '🍌', '🥬', '🧀', '🥓', '🍞', '🍝', '🫒', '🧴', '🥛', '🍎', '🥚', '🍗', '📦'];

// --- COMPONENTE MODALE DI MODIFICA ---
const EditProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(product);

  // Calcola oggi per bloccare le date passate
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (product) {
        setFormData({
            ...product,
            unit: product.unit || 'pz',
            owners: product.owners || ['mari']
        });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSaveInternal = () => {
    // Validazione Extra sicurezza
    if (formData.price < 0) {
        toast.error("Il prezzo non può essere negativo");
        return;
    }
    onSave(formData);
    onClose();
  };

  const adjustQuantity = (delta) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  // Gestione Prezzo Sicura (No Negativi)
  const handlePriceChange = (e) => {
    const val = e.target.value;
    if (val === '') {
        setFormData(prev => ({ ...prev, price: '' }));
        return;
    }
    const num = parseFloat(val);
    if (num >= 0) {
        setFormData(prev => ({ ...prev, price: num }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#F7F6F3] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#1A1A1A]">Modifica Prodotto</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
           
           {/* Nome e Icona */}
           <div>
            <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Prodotto</label>
            <div className="flex gap-3">
               <div className="shrink-0 w-14 h-[50px] bg-white rounded-2xl flex items-center justify-center text-2xl border border-gray-100">
                  {formData.icon}
               </div>
               <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-4 bg-white rounded-2xl text-[#1A1A1A] font-medium border border-gray-100"
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
              <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Quantità</label>
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
              <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Unità</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full h-[54px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 font-medium"
              >
                {units.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Dove lo metti?</label>
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
               <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Scadenza</label>
               <input
                type="date"
                min={today} // BLOCCO DATE PASSATE
                value={formData.expiry_date ? formData.expiry_date.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="w-full h-[50px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Prezzo (€)</label>
              <input
                type="number"
                min="0" // HTML UI Block
                step="0.01"
                value={formData.price}
                onChange={handlePriceChange} // JS Logic Block
                className="w-full h-[50px] px-3 bg-white rounded-2xl text-[#1A1A1A] border border-gray-100 text-sm"
              />
            </div>
          </div>

          {/* Proprietari */}
          <div>
            <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Di chi è?</label>
            <OwnerSelector
              selectedOwners={formData.owners}
              onChange={(owners) => setFormData(prev => ({ ...prev, owners }))}
              size="md"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-gray-100">
          <button 
            onClick={handleSaveInternal}
            className="w-full py-4 bg-[#3A5A40] text-white font-bold rounded-2xl active:scale-95 transition-transform"
          >
            Salva Modifiche
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MOCK DATA ---
const mockScannedProducts = [
  { id: 1, name: 'Latte Intero 1L', icon: '🥛', quantity: 2, unit: 'pz', price: 1.89, category: 'frigo', owners: ['mari'], expiry_date: '2026-02-22' },
  { id: 2, name: 'Pane Integrale', icon: '🍞', quantity: 1, unit: 'pz', price: 2.50, category: 'dispensa', owners: ['mari'], expiry_date: '2026-02-12' },
  { id: 3, name: 'Mele Fuji', icon: '🍎', quantity: 6, unit: 'pz', price: 3.20, category: 'frigo', owners: ['mari'], expiry_date: '2026-02-18' },
  { id: 4, name: 'Pasta Barilla 500g', icon: '🍝', quantity: 2, unit: 'pz', price: 1.45, category: 'dispensa', owners: ['mari'], expiry_date: '2027-03-01' },
  { id: 5, name: 'Yogurt Greco', icon: '🥄', quantity: 4, unit: 'pz', price: 3.60, category: 'frigo', owners: ['mari'], expiry_date: '2026-02-15' },
];

export default function ScanReceipt() {
  const navigate = useNavigate();
  const { addProducts } = useProducts();
  
  const [step, setStep] = useState('scan');
  const [products, setProducts] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // Stati per la modifica
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setProducts(mockScannedProducts);
      setStep('review');
      toast.success("Scontrino analizzato con successo!");
    }, 2000);
  };

  const handleRemoveProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Apre il modale di modifica
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Salva le modifiche dal modale
  const handleSaveEdit = (updatedProduct) => {
    setProducts(products.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
    ));
    toast.success("Prodotto aggiornato");
  };

  const handleConfirm = () => {
    if (products.length === 0) return;

    const productsToAdd = products.map(p => ({
      ...p,
      id: Date.now() + Math.random(),
      owner: p.owners.length === 3 ? 'shared' : (p.owners[0] || 'mari'),
      owners: p.owners,
      added_date: new Date().toISOString()
    }));

    addProducts(productsToAdd);

    toast.success(`${products.length} prodotti aggiunti all'inventario!`, {
      icon: '✅'
    });
    
    setTimeout(() => {
      navigate('/Inventario');
    }, 1000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] pb-40"> 
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
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
          <div className="relative w-full aspect-[3/4] max-w-xs bg-gray-900 rounded-3xl overflow-hidden mb-6 shadow-2xl">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400"
                alt="Scontrino"
                className="w-3/4 object-contain opacity-60 mix-blend-overlay"
              />
            </div>
            <div className="absolute inset-4 border-2 border-white/30 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent text-white text-center text-xs">
                Allinea i bordi
              </div>
              {isScanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-[#3A5A40] shadow-[0_0_15px_rgba(58,90,64,0.8)]"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
              isScanning 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-[#3A5A40] active:scale-90 hover:scale-105'
            }`}
          >
            <Camera className={`w-8 h-8 ${isScanning ? 'text-gray-400' : 'text-white'}`} />
          </button>
          <p className="text-sm text-[#666666] mt-4 font-medium">
            {isScanning ? 'Analisi prodotti in corso...' : 'Tocca per scansionare'}
          </p>
        </div>
      )}

      {step === 'review' && (
        <div className="p-5 space-y-4">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-[#1A1A1A] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#3A5A40]" />
                Prodotti rilevati ({products.length})
              </h2>
            </div>

            <AnimatePresence mode='popLayout'>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                >
                  {/* Riga Superiore: Icona, Nome, Prezzo + Tasto Edit */}
                  <div className="flex items-start gap-3 mb-3 border-b border-gray-50 pb-3">
                    <div className="w-12 h-12 bg-[#F2F0E9] rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {product.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#1A1A1A] truncate pr-2">{product.name}</h3>
                        <p className="font-bold text-[#3A5A40]">€{product.price.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qtà: {product.quantity} {product.unit} • Scadenza: {new Date(product.expiry_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Bottone Modifica */}
                    <button 
                        onClick={() => handleEditClick(product)}
                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#3A5A40] hover:bg-[#3A5A40]/10 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Riga Inferiore: Badge Proprietari + Categoria + Delete */}
                  <div className="flex items-center justify-between gap-2">
                    
                    {/* Info Sola Lettura (si modifica dal modal) */}
                    <div className="flex items-center gap-2">
                         <span className="px-2 py-1 bg-gray-50 rounded-md text-xs font-medium text-gray-600 flex items-center gap-1">
                            {inventoryCategories.find(c => c.id === product.category)?.icon}
                            {inventoryCategories.find(c => c.id === product.category)?.name}
                         </span>
                         
                         {/* Visualizzazione Proprietari (Mini Avatar Stack) */}
                         <div className="flex -space-x-1">
                            {product.owners.map((owner, i) => (
                                <div key={i} className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold
                                    ${owner === 'mari' ? 'bg-[#3A5A40]' : owner === 'gio' ? 'bg-blue-500' : 'bg-orange-400'}`}
                                >
                                    {owner.charAt(0).toUpperCase()}
                                </div>
                            ))}
                         </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 active:scale-90 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {products.length === 0 && (
              <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-4xl mb-2">🗑️</p>
                <p className="text-gray-500 font-medium">Hai rimosso tutti i prodotti</p>
                <button onClick={handleCancel} className="mt-4 text-[#3A5A40] font-bold text-sm">
                  Torna indietro
                </button>
              </div>
            )}
          </div>

          {/* Footer Totale e Azioni (TRASPARENTE E SCAMBIATI) */}
          <div className="fixed bottom-0 left-0 right-0 p-5 z-20">
             <div className="max-w-md mx-auto space-y-4">
                {/* Card Totale fluttuante sopra i bottoni */}
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white flex justify-between items-center mb-2">
                    <span className="text-gray-500 text-sm font-medium">Totale stimato</span>
                    <span className="text-2xl font-bold text-[#1A1A1A]">
                        €{products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                    </span>
                </div>

                <div className="flex gap-3">
                    {/* CONFERMA A SINISTRA (Con min-width per evitare schiacciamento) */}
                    <button
                        onClick={handleConfirm}
                        disabled={products.length === 0}
                        className={`flex-[2] py-4 rounded-2xl font-bold text-white shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                            products.length === 0 ? 'bg-gray-300 shadow-none' : 'bg-[#3A5A40]'
                        }`}
                    >
                        <Check className="w-5 h-5" />
                        Conferma Tutto
                    </button>

                    {/* ANNULLA A DESTRA */}
                    <button
                        onClick={handleCancel}
                        className="flex-1 py-4 bg-white text-gray-700 rounded-2xl font-bold shadow-lg active:scale-[0.98] border border-gray-100"
                    >
                        Annulla
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
            <EditProductModal 
                product={editingProduct} 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onSave={handleSaveEdit}
            />
        )}
      </AnimatePresence>

    </div>
  );
}