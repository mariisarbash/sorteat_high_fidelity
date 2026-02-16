import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit2, MessageCircle, AlertCircle, Check, Calendar, Plus, Minus, ArrowLeft, Clock, ScanLine, Loader2 } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useWaste } from '../../context/WasteContext';
import { toast } from 'sonner';
import OwnerSelector from '../spesa/OwnerSelector';

const inventoryCategories = [
  { id: 'frigo', name: 'Frigo', icon: '❄️' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'freezer', name: 'Freezer', icon: '🧊' },
];

const units = ['pz', 'g', 'kg', 'ml', 'L', 'confezione'];
const commonEmojis = ['🍅', '🍌', '🥬', '🧀', '🥓', '🍞', '🍝', '🫒', '🧴', '🥛', '🍎', '🥚', '🍗', '📦'];

export default function ProductDetailModal({ product, isOpen, onClose }) {
  const { updateProduct, removeProduct } = useProducts();
  const { registerWaste } = useWaste();
  
  const [view, setView] = useState('detail');
  const [editForm, setEditForm] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // STATI UNIFICATI PER CHIEDI / CONSUMA
  const [actionQuantity, setActionQuantity] = useState(''); 
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (product) {
      // FIX: Caricamento corretto degli owners.
      // Se il prodotto ha la nuova prop 'owners', usa quella.
      // Altrimenti fallback sulla vecchia logica 'owner' (per compatibilità o dati vecchi)
      let initialOwners = [];
      if (product.owners && Array.isArray(product.owners)) {
          initialOwners = product.owners;
      } else {
          // Fallback legacy
          initialOwners = product.owner === 'shared' ? ['mari', 'gio', 'pile'] : [product.owner || 'mari'];
      }

      setEditForm({
        name: product.name || '',
        icon: product.icon || '📦',
        quantity: product.quantity || 1,
        unit: product.unit || 'pz',
        category: product.category || 'frigo',
        owners: initialOwners, // Usa l'array calcolato
        price: product.price || '',
        expiryDate: product.expiry_date || ''
      });
      // Resetta stati
      setActionQuantity('');
      setIsAiLoading(false);
      setView('detail');
    }
  }, [product, isOpen]);

  if (!isOpen || !product || !editForm) return null;

  const currentCategory = inventoryCategories.find(c => c.id === product.category) || inventoryCategories[0];
  const isExpired = product.expiry_date && new Date(product.expiry_date) < new Date();

  // Helper per visualizzare i proprietari nel dettaglio
  const getOwnerLabel = () => {
      const owners = product.owners || (product.owner === 'shared' ? ['mari', 'gio', 'pile'] : [product.owner]);
      if (owners.length === 3) return 'Shared'; // O "Tutti"
      if (owners.length === 0) return 'Nessuno';
      // Capitalizza i nomi
      return owners.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(' & ');
  };

  // --- VALIDAZIONE ---
  const isQuantityValid = () => {
    if (!actionQuantity || actionQuantity === '') return false;
    const val = parseFloat(actionQuantity);
    const max = parseFloat(product.quantity);
    if (isNaN(val) || val <= 0 || val > max) return false;
    return true;
  };

  // --- TASTI RAPIDI (Metà / Tutto) ---
  const handleSetAmount = (type) => {
    const total = parseFloat(product.quantity);
    if (type === 'half') {
        const val = total / 2;
        setActionQuantity(product.unit === 'pz' ? Math.floor(val).toString() : val.toFixed(1));
    } else if (type === 'all') {
        setActionQuantity(total.toString());
    }
  };

  // --- MOCK AI UPDATE ---
  const handleAiUpdate = () => {
    setIsAiLoading(true);
    setTimeout(() => {
        setIsAiLoading(false);
        const total = parseFloat(product.quantity);
        const aiGuess = (total * 0.5).toFixed(product.unit === 'pz' ? 0 : 1);
        setActionQuantity(aiGuess);
        toast.success("AI: Ho rilevato che hai consumato circa metà confezione! 🤖");
    }, 1500);
  };

  // --- SALVATAGGIO MODIFICHE ---
  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
        toast.error('Inserisci un nome per il prodotto');
        return;
    }

    // CONTROLLO SICUREZZA: L'utente non può rimuovere se stesso ('mari')
    if (!editForm.owners.includes('mari')) {
        toast.error("Non puoi rimuoverti dalla proprietà del prodotto! 🚫");
        return;
    }
    
    // Aggiorna usando l'ID corretto e passando l'ARRAY owners
    updateProduct(product.id, {
        name: editForm.name,
        icon: editForm.icon,
        quantity: Number(editForm.quantity),
        unit: editForm.unit,
        category: editForm.category,
        owners: editForm.owners, // Salva l'array così com'è (es. ['mari', 'gio'])
        price: editForm.price,
        expiry_date: editForm.expiryDate
    });
    
    toast.success('Prodotto aggiornato');
    onClose(product.id);
  };

  // --- CONFERMA AZIONI ---
  const handleConfirmAction = () => {
    // 1. ELIMINA
    if (view === 'delete') {
        const reason = isExpired ? 'scaduto' : 'buttato';
        registerWaste(product, product.quantity, product.unit, reason);
        toast.success('Prodotto eliminato (Spreco registrato 🗑️)');
        removeProduct(product.id);
        onClose(); 
    } 
    // 2. CONSUMA
    else if (view === 'consume') {
        if (!isQuantityValid()) return;
        const consumed = parseFloat(actionQuantity);
        const total = parseFloat(product.quantity);

        if (consumed >= total) {
            removeProduct(product.id);
            toast.success('Ottimo! Hai finito il prodotto 😋');
            onClose(); 
        } else {
            const remaining = parseFloat((total - consumed).toFixed(2));
            updateProduct(product.id, { quantity: remaining });
            toast.success(`Aggiornato! Rimangono ${remaining} ${product.unit}`);
            onClose(product.id);
        }
    } 
    // 3. CHIEDI
    else if (view === 'ask') {
        if (!isQuantityValid()) {
            toast.error("Inserisci una quantità valida");
            return;
        }
        updateProduct(product.id, {
            hasPendingRequest: true,
            pendingRequestDate: new Date().toISOString()
        });
        
        // Calcola a chi stai chiedendo (escludendo te stesso)
        const targetOwner = product.owners 
            ? product.owners.filter(o => o !== 'mari').join(' & ') 
            : product.owner;

        const newNotification = {
            id: Date.now(),
            title: `Hai chiesto ${product.name}`,
            message: `Richiesta inviata a ${targetOwner} (${actionQuantity} ${product.unit})`,
            type: 'activity',
            icon: product.icon || '💬',
            iconBg: 'bg-yellow-100'
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('sorteat_notifications') || '[]');
        localStorage.setItem('sorteat_notifications', JSON.stringify([newNotification, ...existingNotifications]));
        window.dispatchEvent(new CustomEvent('add-notification', { detail: newNotification }));

        toast.success(`Richiesta inviata a ${targetOwner}!`);
        onClose(product.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* HEADER */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
            {view !== 'detail' ? (
                <button onClick={() => setView('detail')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
                </button>
            ) : (
                <div className="w-6" />
            )}
            <h2 className="text-lg font-bold text-[#1A1A1A]">
                {view === 'detail' ? 'Dettaglio Prodotto' : 
                 view === 'edit' ? 'Modifica Prodotto' : 
                 view === 'ask' ? 'Chiedi in Prestito' : 
                 view === 'delete' ? 'Elimina' : 'Consuma'}
            </h2>
            <button onClick={() => onClose()} className="p-2 -mr-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* CORPO CENTRALE */}
          <div className="p-6 overflow-y-auto no-scrollbar flex-1">
            
            {/* VISTA DETTAGLIO */}
            {view === 'detail' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                            {product.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#1A1A1A]">{product.name}</h3>
                            <p className="text-[#666666] flex items-center gap-2 mt-1">
                                {currentCategory.icon} {currentCategory.name}
                            </p>
                            {/* Visualizza i proprietari reali */}
                            <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 inline-block px-2 py-1 rounded-lg">
                                Di: {getOwnerLabel()}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#F2F0E9] p-4 rounded-2xl">
                            <p className="text-xs text-[#666666] font-medium mb-1 uppercase tracking-wide">Quantità</p>
                            <p className="text-xl font-bold text-[#1A1A1A]">{product.quantity} <span className="text-sm font-normal text-gray-500">{product.unit}</span></p>
                        </div>
                        <div className={`p-4 rounded-2xl ${isExpired ? 'bg-red-50' : 'bg-[#F2F0E9]'}`}>
                            <p className={`text-xs font-medium mb-1 uppercase tracking-wide ${isExpired ? 'text-red-500' : 'text-[#666666]'}`}>Scadenza</p>
                            <p className={`text-lg font-bold ${isExpired ? 'text-red-600' : 'text-[#1A1A1A]'}`}>
                                {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) : 'N/D'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA MODIFICA */}
            {view === 'edit' && (
                <div className="space-y-8">
                    {/* ... (Codice UI identico a prima per Nome/Icona/Quantità/Categoria) ... */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Cosa stai modificando?</label>
                        <div className="flex gap-3 relative">
                            <button
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className="w-14 h-14 bg-[#F2F0E9] rounded-2xl flex items-center justify-center text-2xl active:scale-95 transition-transform shrink-0"
                            >
                                {editForm.icon}
                            </button>
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center">
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    placeholder="Es. Pomodori..."
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-bold text-lg placeholder:text-gray-400 placeholder:font-normal"
                                />
                            </div>
                            {showIconPicker && (
                                <div className="absolute top-full left-0 mt-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 grid grid-cols-5 gap-2 z-50">
                                    {commonEmojis.map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => { setEditForm({...editForm, icon: emoji}); setShowIconPicker(false); }}
                                            className="text-2xl hover:scale-110 transition-transform p-1"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Quantità</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F2F0E9] rounded-2xl p-2 flex items-center justify-between">
                                <button 
                                    onClick={() => setEditForm(prev => ({...prev, quantity: Math.max(0, Number(prev.quantity) - 1)}))}
                                    className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <input 
                                    type="number"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({...editForm, quantity: e.target.value})}
                                    className="w-full bg-transparent text-center font-bold text-lg text-[#1A1A1A] outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button 
                                    onClick={() => setEditForm(prev => ({...prev, quantity: Number(prev.quantity) + 1}))}
                                    className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center active:scale-95 text-[#1A1A1A] shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="bg-[#F2F0E9] rounded-2xl px-4 py-2 flex items-center">
                                <select 
                                    value={editForm.unit}
                                    onChange={(e) => setEditForm({...editForm, unit: e.target.value})}
                                    className="bg-transparent border-none outline-none w-full font-bold text-[#1A1A1A] appearance-none"
                                >
                                    {units.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Dove lo conservi?</label>
                        <div className="grid grid-cols-3 gap-2">
                            {inventoryCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setEditForm({...editForm, category: cat.id})}
                                    className={`py-3 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all ${
                                        editForm.category === cat.id 
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

                    {/* PROPRIETARIO - Logica aggiornata */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-[#1A1A1A] ml-1">Di chi è?</label>
                        <OwnerSelector 
                            selectedOwners={editForm.owners}
                            onChange={(owners) => setEditForm({...editForm, owners})}
                        />
                        <p className="text-[10px] text-gray-400 ml-1">Nota: non puoi rimuovere te stesso.</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-[#1A1A1A] ml-1">Dettagli Aggiuntivi</h3>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center gap-3">
                                <span className="text-gray-400 font-bold">€</span>
                                <input 
                                    type="number" 
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                    placeholder="Prezzo"
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium placeholder:font-normal"
                                />
                            </div>
                            <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 py-3 flex items-center gap-3 relative">
                                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                                <input 
                                    type="date" 
                                    value={editForm.expiryDate}
                                    onChange={(e) => setEditForm({...editForm, expiryDate: e.target.value})}
                                    className="bg-transparent border-none outline-none w-full text-[#1A1A1A] font-medium text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* VISTA ASK / CONSUME / DELETE (Codice identico a prima, ometto per brevità ma è incluso nel file completo) */}
            {(view === 'ask' || view === 'consume') && (
                <div className="space-y-6 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${view === 'ask' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    {view === 'ask' ? <MessageCircle className="w-8 h-8 text-yellow-600" /> : <Check className="w-8 h-8 text-green-600" />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[#1A1A1A]">
                    {view === 'ask' ? 'Chiedi prodotto' : 'Quanto ne hai usato?'}
                  </h3>
                  <p className="text-[#666666]">
                    {view === 'ask' 
                        ? `Quanto ${product.name} vuoi chiedere a ${getOwnerLabel()}?`
                        : `Aggiorna la quantità di ${product.name} consumata.`
                    }
                  </p>

                  <div className={`bg-[#F2F0E9] p-4 rounded-2xl border-2 transition-colors ${!isQuantityValid() && actionQuantity ? 'border-red-300 bg-red-50' : view === 'ask' ? 'border-yellow-100' : 'border-green-100'}`}>
                     <div className="flex items-center justify-center gap-2 mb-2">
                        <input 
                          type="number" 
                          value={actionQuantity}
                          onChange={(e) => setActionQuantity(e.target.value)}
                          placeholder="0"
                          className="w-24 text-center text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-black text-[#1A1A1A]"
                          max={product.quantity}
                        />
                        <span className="text-gray-400 font-medium text-lg">{product.unit}</span>
                     </div>
                     <p className="text-xs text-gray-400">Disponibili: {product.quantity} {product.unit}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleSetAmount('half')}
                      className="py-2 px-4 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                      Metà ({product.unit === 'pz' ? Math.floor(product.quantity/2) : (product.quantity/2).toFixed(1)})
                    </button>
                    <button 
                      onClick={() => handleSetAmount('all')}
                      className="py-2 px-4 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                      Tutto ({product.quantity})
                    </button>
                  </div>

                  {view === 'consume' && (
                      <button 
                        onClick={handleAiUpdate}
                        disabled={isAiLoading}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                      >
                        {isAiLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Analisi foto in corso...
                            </>
                        ) : (
                            <>
                                <ScanLine className="w-5 h-5" /> Aggiorna con AI
                            </>
                        )}
                      </button>
                  )}
                </div>
            )}

            {view === 'delete' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Eliminare prodotto?</h3>
                    <p className="text-[#666666]">Stai per buttare questo prodotto. Se è scaduto verrà registrato come spreco.</p>
                </div>
            )}
          </div>

          {/* FOOTER BOTTONI (Identico a prima) */}
          <div className="p-5 bg-white border-t border-gray-50 shrink-0">
            {view === 'detail' && (
                <div className="flex gap-3">
                    <button onClick={() => setView('delete')} className="p-4 rounded-2xl bg-gray-100 text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-6 h-6" />
                    </button>
                    <button onClick={() => setView('edit')} className="p-4 rounded-2xl bg-gray-100 text-[#1A1A1A] hover:bg-gray-200 transition-colors">
                        <Edit2 className="w-6 h-6" />
                    </button>
                    
                    {/* Logica Chiedi: se NON sono proprietario */}
                    {!(product.owners && product.owners.includes('mari')) ? (
                        product.hasPendingRequest ? (
                            <button disabled className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-gray-100 text-gray-500 cursor-not-allowed opacity-60">
                                <Clock className="w-5 h-5" /> In attesa
                            </button>
                        ) : (
                            <button onClick={() => setView('ask')} className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/20 active:scale-[0.98] transition-all">
                                <MessageCircle className="w-5 h-5" /> Chiedi...
                            </button>
                        )
                    ) : (
                        <button onClick={() => setView('consume')} className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg bg-[#3A5A40] text-white shadow-lg shadow-[#3A5A40]/20 active:scale-[0.98] transition-all">
                            Consuma...
                        </button>
                    )}
                </div>
            )}

            {view === 'edit' && (
                <button 
                    onClick={handleSaveEdit} 
                    className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#3A5A40]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                >
                    <Check className="w-6 h-6" /> Salva Modifiche
                </button>
            )}

            {(view === 'ask' || view === 'consume' || view === 'delete') && (
                <button 
                    onClick={handleConfirmAction} 
                    disabled={(view === 'ask' || view === 'consume') && !isQuantityValid()}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg transition-all active:scale-[0.98] shadow-lg ${
                        view === 'ask' 
                          ? 'bg-yellow-400 text-yellow-900 shadow-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed' 
                          : view === 'delete' 
                             ? 'bg-red-500 text-white shadow-red-500/20' 
                             : 'bg-[#3A5A40] text-white shadow-[#3A5A40]/30 disabled:opacity-50'
                    }`}
                >
                    {view === 'ask' ? 'Invia Richiesta' : 
                     view === 'delete' ? 'Sì, Elimina' : 
                     'Conferma Consumo'}
                </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}