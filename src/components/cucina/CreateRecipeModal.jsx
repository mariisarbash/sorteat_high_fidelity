import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Users, Plus, Minus, Trash2, Check, Camera, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '../../context/ProductsContext';

const commonEmojis = ['🍝', '🥗', '🥩', '🍲', '🥘', '🍕', '🍔', '🥟', '🍰', '🥑', '🍳'];
const AVAILABLE_UNITS = ['pz', 'g', 'kg', 'ml', 'L', 'qb', 'conf', 'fette'];

const ROOMMATES = [
  { id: 'mari', label: 'M', color: 'bg-pink-500', name: 'Mari' },
  { id: 'gio', label: 'G', color: 'bg-blue-500', name: 'Gio' },
  { id: 'pile', label: 'P', color: 'bg-purple-500', name: 'Pile' },
];

export default function CreateRecipeModal({ isOpen, onClose, onSave, initialData }) {
  const { products } = useProducts();
  
  const [mode, setMode] = useState('manual');
  const [step, setStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [servings, setServings] = useState(1);
  const [selectedParticipants, setSelectedParticipants] = useState(['mari']); 
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍲',
    prepTime: 30,
    // Di default il primo ingrediente è pronto per essere selezionato (isCustom: false)
    ingredients: [{ productId: '', name: '', qty: '', unit: 'g', isCustom: false }],
    steps: ['']
  });

  const myInventory = useMemo(() => {
    return products.filter(p => p.owner === 'mari' || p.owner === 'shared')
                   .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // Inizializzazione dati
  useEffect(() => {
    if (initialData) {
        const mappedIngredients = (initialData.ingredients || []).map(ing => {
            const foundProduct = myInventory.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
            return {
                ...ing,
                productId: foundProduct ? foundProduct.id : '',
                isCustom: !foundProduct,
                unit: foundProduct ? foundProduct.unit : (ing.unit || 'g')
            };
        });

        setFormData({
            name: initialData.name || '',
            icon: initialData.icon || '🍲',
            prepTime: initialData.prepTime || 30,
            ingredients: mappedIngredients,
            steps: initialData.steps || ['']
        });
        setServings(initialData.servings || 1);
        setSelectedParticipants(['mari']); 
    }
  }, [initialData, myInventory]);

  const updateServings = (newServings) => {
    if (newServings < 1) return;
    if (newServings < selectedParticipants.length) {
        toast.warning("Riduci i partecipanti prima di diminuire le porzioni.");
        return;
    }
    const ratio = newServings / servings;
    setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(ing => ({
            ...ing,
            qty: ing.qty && !isNaN(ing.qty) ? (parseFloat(ing.qty) * ratio).toFixed(ing.unit === 'pz' ? 0 : 0) : ing.qty
        }))
    }));
    setServings(newServings);
  };

  const toggleParticipant = (roommateId) => {
    if (roommateId === 'mari') return;
    const isSelected = selectedParticipants.includes(roommateId);
    if (isSelected) {
        setSelectedParticipants(prev => prev.filter(id => id !== roommateId));
        updateServings(Math.max(1, servings - 1));
    } else {
        setSelectedParticipants(prev => [...prev, roommateId]);
        updateServings(servings + 1);
    }
  };

  // --- GESTIONE INGREDIENTI ---
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    const currentIng = newIngredients[index];

    if (field === 'productId') {
        if (value === 'CUSTOM_ITEM') {
            // Utente vuole inserire roba non in dispensa
            currentIng.productId = '';
            currentIng.name = ''; 
            currentIng.unit = 'pz'; 
            currentIng.isCustom = true; // Switcha a input manuale
        } else {
            // Utente seleziona da inventario
            const selectedProduct = myInventory.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                currentIng.productId = selectedProduct.id;
                currentIng.name = selectedProduct.name;
                currentIng.unit = selectedProduct.unit || 'pz'; 
                currentIng.isCustom = false;
            }
        }
    } else if (field === 'qty') {
        if (parseFloat(value) < 0) return; 
        currentIng[field] = value;
    } else {
        currentIng[field] = value;
    }

    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  // FIX: Aggiungi nuovo ingrediente come "Select" di default (isCustom: false)
  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { productId: '', name: '', qty: '', unit: 'pz', isCustom: false }]
    }));
  };

  // Funzione per tornare alla select se si era in modalità custom
  const handleResetToSelect = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { productId: '', name: '', qty: '', unit: 'pz', isCustom: false };
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleAddStep = () => setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  const handleRemoveStep = (index) => setFormData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const handleAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
        setIsScanning(false);
        toast.success('Funzione disponibile dal menu principale!');
        setMode('manual');
    }, 1500);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
        toast.error("Dai un nome alla tua ricetta!", { icon: '✍️' });
        setStep(1);
        return;
    }
    const invalidQty = formData.ingredients.some(i => !i.qty || parseFloat(i.qty) <= 0);
    if (invalidQty) {
        toast.error("Quantità non valida", { description: "Tutti gli ingredienti devono avere una quantità > 0." });
        setStep(2);
        return;
    }
    const validIngredients = formData.ingredients.filter(i => i.name && i.qty);
    if (validIngredients.length === 0) {
        toast.error("Mancano ingredienti", { icon: '🛑' });
        setStep(2);
        return;
    }

    const cleanData = {
        ...formData,
        servings: servings,
        participants: selectedParticipants,
        ingredients: validIngredients,
        steps: formData.steps.filter(s => s.trim() !== '').length > 0 ? formData.steps : ['Procedimento non specificato']
    };

    onSave(cleanData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#F7F6F3] w-full max-w-md h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-lg text-[#1A1A1A]">
            {mode === 'ai' ? 'Scansione AI' : (step === 1 ? 'Nuova Ricetta' : step === 2 ? 'Ingredienti' : 'Procedimento')}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {mode === 'ai' ? (
           <div className="flex-1 flex items-center justify-center flex-col p-6">
               <Sparkles className="w-12 h-12 text-[#3A5A40] mb-4" />
               <p className="text-gray-500 text-center">Usa il pulsante "Genera con AI" nel menu principale per la magia completa!</p>
               <button onClick={() => setMode('manual')} className="text-[#3A5A40] font-bold mt-4 underline">Torna indietro</button>
           </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5">
               {step === 1 && (
                    <div className="space-y-6">
                        {/* Sezione NOME e ICONA */}
                        <div>
                            <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Nome Piatto</label>
                            <div className="flex gap-3">
                                <div className="shrink-0 w-14 h-[50px] bg-white rounded-2xl flex items-center justify-center text-2xl border border-gray-100">
                                    {formData.icon}
                                </div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Es. Pasta al Tonno"
                                    className="flex-1 px-4 bg-white rounded-2xl text-[#1A1A1A] font-bold border border-gray-100 focus:border-[#3A5A40] outline-none"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar mt-1">
                                {commonEmojis.map(emoji => (
                                    <button key={emoji} onClick={() => setFormData({...formData, icon: emoji})} className="w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sezione TEMPO */}
                        <div>
                            <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Tempo (min)</label>
                            <div className="bg-white rounded-2xl p-2 border border-gray-100 flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 ml-2 mr-2" />
                                <input 
                                    type="number" 
                                    min="1"
                                    value={formData.prepTime}
                                    onChange={(e) => setFormData({...formData, prepTime: Math.max(1, parseInt(e.target.value) || 0)})}
                                    className="w-full font-bold text-[#1A1A1A] outline-none"
                                />
                            </div>
                        </div>

                        {/* PORZIONI E CONDIVISIONE */}
                        <div className="bg-[#F2F0E9] p-4 rounded-2xl space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Condividi con:</label>
                                <div className="flex gap-2">
                                    {ROOMMATES.map(roommate => {
                                        const isSelected = selectedParticipants.includes(roommate.id);
                                        return (
                                            <button
                                                key={roommate.id}
                                                onClick={() => toggleParticipant(roommate.id)}
                                                disabled={roommate.id === 'mari'}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                                                    isSelected ? `border-transparent text-white ${roommate.color} shadow-md` : 'bg-white border-transparent text-gray-400 opacity-60'
                                                }`}
                                            >
                                                <span>{roommate.label}</span>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#666666] uppercase mb-2 block">Porzioni totali:</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200">
                                        <button onClick={() => updateServings(servings - 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"><Minus className="w-4 h-4" /></button>
                                        <span className="w-12 text-center font-bold text-xl text-[#1A1A1A]">{servings}</span>
                                        <button onClick={() => updateServings(servings + 1)} className="w-10 h-10 flex items-center justify-center text-[#3A5A40] hover:bg-[#3A5A40]/10 rounded-lg"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 flex-1 leading-tight">Modificando le porzioni, le quantità degli ingredienti verranno ricalcolate.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
               
               {step === 2 && (
                   <div className="space-y-3">
                       <p className="text-sm text-gray-500 mb-2">Ingredienti per <span className="font-bold text-[#3A5A40]">{servings} persone</span></p>
                       
                       {formData.ingredients.map((ing, i) => (
                           <div key={i} className="flex gap-2 items-start">
                               {/* SELETTORE PRODOTTO IBRIDO */}
                               <div className="flex-[2] relative">
                                   {!ing.isCustom ? (
                                       <select 
                                           className="w-full p-3 bg-white rounded-xl border border-gray-100 text-sm font-medium outline-none appearance-none focus:border-[#3A5A40]"
                                           value={ing.productId || ''}
                                           onChange={(e) => handleIngredientChange(i, 'productId', e.target.value)}
                                       >
                                           <option value="" disabled>Seleziona...</option>
                                           <option value="CUSTOM_ITEM" className="font-bold text-[#3A5A40]">+ Altro (non in dispensa)</option>
                                           <hr />
                                           {myInventory.map(p => (
                                               <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                                           ))}
                                       </select>
                                   ) : (
                                       <div className="flex items-center relative">
                                           <input 
                                                autoFocus
                                                placeholder="Nome ingrediente"
                                                value={ing.name}
                                                onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                                                className="w-full p-3 pr-8 bg-white rounded-xl border border-[#3A5A40] text-sm font-medium outline-none"
                                           />
                                           <button 
                                                onClick={() => handleResetToSelect(i)} 
                                                className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 bg-white rounded-full"
                                                title="Scegli dalla dispensa"
                                           >
                                               <X className="w-4 h-4" />
                                           </button>
                                       </div>
                                   )}
                               </div>

                               <input 
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    placeholder="Qtà" 
                                    value={ing.qty}
                                    onChange={(e) => handleIngredientChange(i, 'qty', e.target.value)}
                                    className="w-16 p-3 bg-white rounded-xl border border-gray-100 text-sm outline-none text-center focus:border-[#3A5A40]" 
                               />

                               <select
                                   className="w-16 p-3 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-500 outline-none appearance-none text-center focus:border-[#3A5A40]"
                                   value={ing.unit}
                                   onChange={(e) => handleIngredientChange(i, 'unit', e.target.value)}
                               >
                                   {AVAILABLE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                               </select>
                               
                               <button 
                                onClick={() => handleRemoveIngredient(i)} 
                                className="p-3 text-red-400 hover:bg-red-50 rounded-xl"
                                disabled={formData.ingredients.length === 1}
                               >
                                    <Trash2 className="w-4 h-4" />
                               </button>
                           </div>
                       ))}

                       <button 
                        onClick={handleAddIngredient} 
                        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#3A5A40] hover:text-[#3A5A40] transition-colors mt-2"
                       >
                           <Plus className="w-4 h-4" /> Aggiungi ingrediente
                       </button>
                   </div>
               )}

               {step === 3 && (
                    <div className="space-y-4">
                        {formData.steps.map((st, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#3A5A40] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-2">
                                    {i + 1}
                                </div>
                                <textarea 
                                    placeholder={`Descrivi il passaggio ${i + 1}...`}
                                    value={st}
                                    onChange={(e) => handleStepChange(i, e.target.value)}
                                    className="flex-1 p-3 bg-white rounded-xl border border-gray-100 text-sm outline-none focus:border-[#3A5A40] min-h-[80px]"
                                />
                                {formData.steps.length > 1 && (
                                    <button onClick={() => handleRemoveStep(i)} className="self-start mt-2 text-red-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button onClick={handleAddStep} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-[#3A5A40] hover:text-[#3A5A40] transition-colors">
                            <Plus className="w-4 h-4" /> Aggiungi passaggio
                        </button>
                    </div>
               )}
            </div>
            
            <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex gap-3">
                {step > 1 && (
                    <button 
                        onClick={() => setStep(step - 1)}
                        className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl"
                    >
                        Indietro
                    </button>
                )}
                
                {step < 3 ? (
                    <button 
                        onClick={() => setStep(step + 1)}
                        className="flex-1 py-3 bg-[#3A5A40] text-white font-bold rounded-xl shadow-lg"
                    >
                        Avanti
                    </button>
                ) : (
                    <button 
                        onClick={handleSave}
                        className="flex-1 py-3 bg-[#3A5A40] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" /> Salva Ricetta
                    </button>
                )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}