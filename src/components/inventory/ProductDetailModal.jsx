import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit2, MessageCircle, AlertCircle, Check, Calendar, Plus, Minus, ArrowLeft, Camera } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useWaste } from '../../context/WasteContext'; // FIX 3: Importo il context per l'anti-waste
import { toast } from 'sonner';
import OwnerSelector from '../spesa/OwnerSelector';
import CategoryPills from './CategoryPills';

const CATEGORIES = [
    { id: 'frigo', label: 'Frigo', icon: '❄️', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'dispensa', label: 'Dispensa', icon: '🥫', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'freezer', label: 'Freezer', icon: '🧊', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
];

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { updateProduct, removeProduct, products } = useProducts();
  const { registerWaste } = useWaste(); // Inizializzo l'anti-waste
  
  // Viste possibili: 'detail' | 'edit' | 'ask' | 'consume' | 'delete'
  const [view, setView] = useState('detail');
  
  // Stati per la Modifica
  const [editData, setEditData] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [editOwners, setEditOwners] = useState([]); // FIX 1: Risolve la selezione corretta del proprietario
  
  // Stati Condivisi per le azioni (Chiedi / Consuma)
  const [actionQty, setActionQty] = useState('');
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    if (product) {
        setEditData({ ...product });
        setEditOwners([product.owner]);
        setActionQty((product.quantity / 2).toString());
    }
    setView('detail');
    setEditErrors({});
    setActionError(false);
  }, [product, isOpen]);

  if (!product || !editData) return null;

  // FIX 4: Permessi ristretti
  const isOwner = product.owner === 'mari' || product.owner === 'shared';

  // --- AZIONI: DETTAGLIO ---
  const handleQuickQuantityChange = (amount) => {
    const newQty = parseFloat(product.quantity) + amount;
    if (newQty <= 0) {
        setView('delete'); // Se si azzera coi tastini, chiedo conferma se è spreco
    } else {
        updateProduct({ ...product, quantity: parseFloat(newQty.toFixed(2)) });
    }
  };

  // --- AZIONI: ELIMINA / SPRECO (FIX 3) ---
  const handleWasteDelete = () => {
      registerWaste(product.name); // Aggiorna il WasteContext!
      removeProduct(product.id);
      toast.error(`${product.name} buttato. Spreco registrato 📉`);
      onClose();
  };

  const handleMistakeDelete = () => {
      removeProduct(product.id);
      toast.success(`${product.name} rimosso con successo.`);
      onClose();
  };

  // --- AZIONI: CHIEDI o CONSUMA (FIX 2) ---
  const handleConfirmAction = () => {
      const qty = parseFloat(actionQty);
      if (isNaN(qty) || qty <= 0 || qty > product.quantity) {
          setActionError(true);
          toast.error("Quantità non valida");
          return;
      }
      
      if (view === 'ask') {
          updateProduct({ ...product, isAsked: true });
          toast.success(`Hai chiesto ${qty} ${product.unit} a ${product.owner}!`);
          onClose(); 
      } else if (view === 'consume') {
          const newQty = product.quantity - qty;
          if (newQty <= 0) {
              removeProduct(product.id);
              toast.success(`${product.name} esaurito!`);
              onClose();
          } else {
              updateProduct({ ...product, quantity: parseFloat(newQty.toFixed(2)) });
              toast.success(`Consumati ${qty} ${product.unit} di ${product.name}`);
              onClose();
          }
      }
  };

  // --- AZIONI: MODIFICA (FIX 1) ---
  const handleSaveEdit = () => {
      const newErrors = {};
      if (!editData.name.trim()) newErrors.name = true;
      if (!editData.quantity || parseFloat(editData.quantity) <= 0) newErrors.quantity = true;

      if (Object.keys(newErrors).length > 0) {
          setEditErrors(newErrors);
          toast.error("Controlla i dati inseriti: nome mancante o quantità non valida.");
          return;
      }

      // Estrae in modo sicuro il nuovo proprietario dall'array del selector
      const finalOwner = editOwners.length === 1 ? editOwners[0] : 'shared';
      updateProduct({ ...editData, owner: finalOwner });
      toast.success("Prodotto aggiornato!");
      setView('detail'); 
  };

  const categoryData = CATEGORIES.find(c => c.id === product.category);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-auto">
          {/* Sfondo scuro */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* HEADER DINAMICO IN BASE ALLA VISTA */}
            {view !== 'edit' && view !== 'delete' ? (
                <div className="h-32 bg-[#F2F0E9] relative flex items-center justify-center shrink-0 shadow-inner">
                    {view !== 'detail' && (
                        <button onClick={() => setView('detail')} className="absolute top-3 left-3 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors z-10">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                    <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors z-10">
                        <X className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="text-6xl filter drop-shadow-xl">{product.icon}</span>
                </div>
            ) : view === 'edit' ? (
                <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('detail')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
                        </button>
                        <h2 className="text-xl font-bold text-[#1A1A1A]">Modifica Prodotto</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            ) : (
                <div className="flex justify-between items-center p-4 shrink-0">
                    <button onClick={() => setView('detail')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            )}

            {/* CONTENUTO SCORREVOLE */}
            <div className={`flex-1 overflow-y-auto ${view === 'edit' ? 'px-6 py-6' : 'px-6 py-5'}`}>
                <AnimatePresence mode="wait">

                    {/* VISTA 1: DETTAGLIO */}
                    {view === 'detail' && (
                        <motion.div key="detail" initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:10}} className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#1A1A1A]">{product.name}</h2>
                                    {categoryData && (
                                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${categoryData.color.replace('border', 'bg').split(' ')[0]} bg-opacity-20`}>
                                            {categoryData.icon} {categoryData.label}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Proprietario</p>
                                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold text-[#1A1A1A] capitalize">
                                        {product.owner === 'shared' ? 'Casa' : product.owner}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                                <span className="text-sm font-bold text-gray-400 uppercase">Quantità</span>
                                <div className="flex items-center gap-4">
                                    {/* Disabilito i controlli rapidi se non è owner per sicurezza */}
                                    <button disabled={!isOwner} onClick={() => handleQuickQuantityChange(-1)} className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all ${isOwner ? 'active:scale-95 text-[#3A5A40]' : 'text-gray-300'}`}><Minus className="w-5 h-5" /></button>
                                    <span className="text-xl font-bold text-[#1A1A1A] w-16 text-center">{product.quantity} {product.unit}</span>
                                    <button disabled={!isOwner} onClick={() => handleQuickQuantityChange(1)} className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 transition-all ${isOwner ? 'active:scale-95 text-[#3A5A40]' : 'text-gray-300'}`}><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {product.expiry_date && (
                                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Scadenza</p>
                                        <p className="font-bold text-[#1A1A1A]">{new Date(product.expiry_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* VISTA 2: MODIFICA FORM */}
                    {view === 'edit' && (
                        <motion.div key="edit" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-8">
                            <div className="flex justify-center">
                                <div className="w-32 h-32 bg-[#F2F0E9] rounded-3xl flex items-center justify-center border-2 border-dashed border-[#3A5A40]/30 cursor-pointer overflow-hidden relative">
                                    <div className="flex flex-col items-center gap-2 text-[#3A5A40]">
                                        <span className="text-4xl">{editData.icon}</span>
                                        <div className="flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded-full shadow-sm">
                                            <Camera className="w-3 h-3" /> Foto
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome Prodotto</label>
                                    <input 
                                        type="text" 
                                        value={editData.name}
                                        onChange={(e) => {
                                            setEditData({...editData, name: e.target.value});
                                            if(editErrors.name) setEditErrors({...editErrors, name: false});
                                        }}
                                        className={`w-full bg-[#F9F9F9] rounded-2xl border-2 px-4 py-4 font-bold text-lg text-[#1A1A1A] outline-none transition-colors ${editErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#3A5A40] focus:bg-white'}`}
                                    />
                                    {editErrors.name && <p className="text-red-500 text-xs mt-1 ml-1">Inserisci un nome</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quantità</label>
                                    <div className="flex gap-3">
                                        <div className={`flex-1 bg-[#F9F9F9] rounded-2xl border-2 transition-all flex items-center px-4 py-4 shadow-sm ${editErrors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-200 focus-within:border-[#3A5A40] focus-within:bg-white'}`}>
                                            <input 
                                                type="number" 
                                                value={editData.quantity}
                                                onChange={(e) => {
                                                    setEditData({...editData, quantity: e.target.value});
                                                    if(editErrors.quantity) setEditErrors({...editErrors, quantity: false});
                                                }}
                                                className="w-full bg-transparent font-bold text-2xl text-[#1A1A1A] outline-none"
                                            />
                                        </div>
                                        <div className="w-28 bg-[#F9F9F9] rounded-2xl flex items-center justify-center font-bold text-gray-600 border border-gray-200 relative overflow-hidden">
                                            <select 
                                                value={editData.unit}
                                                onChange={(e) => setEditData({...editData, unit: e.target.value})}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            >
                                                {['pz', 'kg', 'g', 'L', 'ml', 'conf'].map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                            <span className="z-0">{editData.unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Scadenza</label>
                                    <input 
                                        type="date" 
                                        value={editData.expiry_date}
                                        onChange={(e) => setEditData({...editData, expiry_date: e.target.value})}
                                        className="w-full bg-[#F9F9F9] rounded-2xl border border-gray-200 px-4 py-4 font-medium text-[#1A1A1A] outline-none focus:border-[#3A5A40] focus:bg-white transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Dove lo metti?</label>
                                    <CategoryPills activeCategory={editData.category} onCategoryChange={(cat) => setEditData({...editData, category: cat})} />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Di chi è?</label>
                                    <OwnerSelector selectedOwners={editOwners} onSelectionChange={setEditOwners} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* VISTA 3: CHIEDI O CONSUMA PERSONALIZZATO */}
                    {(view === 'ask' || view === 'consume') && (
                        <motion.div key="ask-consume" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="space-y-6 text-center">
                            <div>
                                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                                    {view === 'ask' ? `Chiedi a ${product.owner}` : `Consuma ${product.name}`}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {view === 'ask' 
                                        ? <>Quanto <strong>{product.name}</strong> vuoi chiedere in prestito?</>
                                        : <>Quanto <strong>{product.name}</strong> hai utilizzato?</>
                                    }
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <input 
                                    type="number" 
                                    value={actionQty} 
                                    onChange={e => { setActionQty(e.target.value); setActionError(false); }}
                                    className={`w-24 text-center text-4xl font-bold text-[#3A5A40] bg-transparent outline-none border-b-2 ${actionError ? 'border-red-500' : 'border-[#3A5A40]'}`}
                                />
                                <span className="text-xl font-bold text-gray-400">{product.unit}</span>
                            </div>
                            
                            <div className="flex gap-3 justify-center mt-4">
                                <button onClick={() => { setActionQty((product.quantity / 2).toString()); setActionError(false); }} className="px-6 py-2 rounded-full bg-gray-100 font-bold text-sm text-gray-600 active:bg-gray-200 transition-colors">
                                    Metà ({product.quantity / 2})
                                </button>
                                <button onClick={() => { setActionQty(product.quantity.toString()); setActionError(false); }} className="px-6 py-2 rounded-full bg-gray-100 font-bold text-sm text-gray-600 active:bg-gray-200 transition-colors">
                                    Tutto ({product.quantity})
                                </button>
                            </div>
                            {actionError && <p className="text-red-500 text-xs mt-2">Inserisci una quantità valida (max {product.quantity}).</p>}
                        </motion.div>
                    )}

                    {/* VISTA 4: ELIMINA (Conferma Spreco) */}
                    {view === 'delete' && (
                        <motion.div key="delete" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">Elimina {product.name}</h3>
                                <p className="text-sm text-gray-500 max-w-[80%] mx-auto">Perché stai rimuovendo questo prodotto dall'inventario?</p>
                            </div>
                            
                            <div className="flex flex-col gap-3 mt-8">
                                <button onClick={handleWasteDelete} className="w-full py-4 rounded-2xl font-bold text-lg bg-red-500 text-white shadow-xl shadow-red-500/30 active:scale-95 transition-all">
                                    È andato a male (Spreco) 📉
                                </button>
                                <button onClick={handleMistakeDelete} className="w-full py-4 rounded-2xl font-bold text-lg bg-gray-100 text-gray-600 active:scale-95 transition-all hover:bg-gray-200">
                                    Errore di inserimento
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* BARRA AZIONI (Nascosta se siamo nella vista Elimina) */}
            {view !== 'delete' && (
                <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                    
                    {view === 'detail' && (
                        <>
                            {/* FIX 4: Se non è mio, niente tasti di modifica/eliminazione */}
                            {isOwner && (
                                <>
                                    <button onClick={() => setView('delete')} className="p-4 rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors font-bold shadow-sm">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setView('edit')} className="p-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-bold shadow-sm">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {!isOwner ? (
                                product.isAsked ? (
                                    <button disabled className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-gray-100 text-gray-400 cursor-not-allowed">
                                        In attesa ⏳
                                    </button>
                                ) : (
                                    <button onClick={() => { setView('ask'); setActionQty((product.quantity/2).toString()); }} className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-yellow-400 text-yellow-900 shadow-xl shadow-yellow-400/20 active:scale-[0.98] transition-all">
                                        Chiedi <MessageCircle className="w-5 h-5" />
                                    </button>
                                )
                            ) : (
                                <button onClick={() => { setView('consume'); setActionQty(product.quantity.toString()); }} className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-[#3A5A40] text-white shadow-xl shadow-[#3A5A40]/20 active:scale-[0.98] transition-all">
                                    Consuma...
                                </button>
                            )}
                        </>
                    )}

                    {view === 'edit' && (
                        <button onClick={handleSaveEdit} className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-3xl shadow-xl shadow-[#3A5A40]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg">
                            <Check className="w-6 h-6" /> Salva Modifiche
                        </button>
                    )}

                    {(view === 'ask' || view === 'consume') && (
                        <button onClick={handleConfirmAction} className={`w-full py-4 rounded-3xl font-bold flex items-center justify-center gap-2 text-lg transition-all active:scale-[0.98] ${
                            view === 'ask' ? 'bg-yellow-400 text-yellow-900 shadow-xl shadow-yellow-400/20' : 'bg-[#3A5A40] text-white shadow-xl shadow-[#3A5A40]/30'
                        }`}>
                            {view === 'ask' ? 'Invia Richiesta' : 'Conferma Consumo'}
                        </button>
                    )}
                </div>
            )}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}