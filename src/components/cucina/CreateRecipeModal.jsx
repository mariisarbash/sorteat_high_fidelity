import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Clock, Users, Search, ChevronRight, Save, Trash2, Check } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { toast } from 'sonner';
import OwnerSelector from '../spesa/OwnerSelector';

// Lista di emoji predefinite per le ricette
const RECIPE_EMOJIS = ['🍝', '🍕', '🥗', '🥩', '🍣', '🍲', '🍜', '🥪', '🌮', '🥘'];

export default function CreateRecipeModal({ isOpen, onClose, onSave, initialData }) {
  const { products } = useProducts();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  
  const [recipeData, setRecipeData] = useState({
    name: '', icon: '🍝', servings: 2, prepTime: 30, ingredients: [], steps: [''], participants: ['mari', 'gio'] // default esempio
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { if (initialData) setRecipeData(prev => ({ ...prev, ...initialData })); }, [initialData]);

  const validateStep1 = () => {
      if (!recipeData.name.trim()) { setErrors({ name: true }); return false; }
      setErrors({}); return true;
  };
  const validateStep2 = () => {
      if (recipeData.ingredients.length === 0) { toast.error("Aggiungi almeno un ingrediente!"); return false; }
      return true;
  };

  const handleNext = () => {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
      setStep(step + 1);
  };

  const handleAddIngredient = (productOrName) => {
    const isNew = typeof productOrName === 'string';
    const ingName = isNew ? productOrName : productOrName.name;
    const ingUnit = isNew ? 'pz' : (productOrName.unit || 'pz');

    setRecipeData(prev => {
        const exists = prev.ingredients.find(i => i.name === ingName);
        if (exists) return prev;
        return { 
            ...prev, 
            ingredients: [...prev.ingredients, { 
                name: ingName, 
                qty: 1, 
                unit: ingUnit, 
                productId: isNew ? null : productOrName.id 
            }] 
        };
    });
    setSearchTerm('');
  };

  const handleRemoveIngredient = (index) => {
    setRecipeData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
  };

  const updateIngredientQty = (index, field, value) => {
    const newIngredients = [...recipeData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipeData({ ...recipeData, ingredients: newIngredients });
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, products]);

  const handleSaveRecipe = () => {
      if (!recipeData.name.trim()) { setStep(1); setErrors({ name: true }); return; }
      onSave(recipeData);
      onClose();
  };

  const handleParticipantsChange = (newParticipants) => {
    setRecipeData(prev => ({
        ...prev,
        participants: newParticipants,
        servings: newParticipants.length > 0 ? newParticipants.length : 1
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        <div className="p-6 pb-2 shrink-0 border-b border-gray-50">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                        {step === 1 && 'Dettagli Ricetta'}
                        {step === 2 && 'Ingredienti'}
                        {step === 3 && 'Preparazione'}
                    </h2>
                    <p className="text-xs text-gray-400">Step {step} di 3</p>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
            {step === 1 && (
                <div className="space-y-6 pt-4">
                    
                    {/* Selettore Emoji Predefinite */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 bg-[#F2F0E9] rounded-full flex items-center justify-center text-5xl border-2 border-dashed border-gray-300 shadow-inner">
                            {recipeData.icon}
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full pb-2 px-1 no-scrollbar justify-start sm:justify-center">
                            {RECIPE_EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setRecipeData({...recipeData, icon: emoji})}
                                    className={`w-10 h-10 shrink-0 rounded-full text-xl flex items-center justify-center transition-all ${
                                        recipeData.icon === emoji
                                        ? 'bg-[#3A5A40] shadow-md scale-110 z-10 border-2 border-[#3A5A40]'
                                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nome del piatto</label>
                        <input 
                            type="text" 
                            placeholder="Es. Carbonara..." 
                            value={recipeData.name}
                            onChange={e => { setRecipeData({...recipeData, name: e.target.value}); if(errors.name) setErrors({}); }}
                            className={`w-full bg-gray-50 rounded-2xl p-4 font-bold text-lg outline-none border-2 transition-colors ${errors.name ? 'border-red-500 bg-red-50' : 'border-transparent focus:border-[#3A5A40] focus:bg-white shadow-sm'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">Il nome è obbligatorio</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Chi mangia?</label>
                        <OwnerSelector 
                            selectedOwners={recipeData.participants}
                            onSelectionChange={handleParticipantsChange}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Porzioni (Auto)</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl p-3 border-2 border-transparent shadow-sm focus-within:border-[#3A5A40] focus-within:bg-white transition-colors">
                                <Users className="w-5 h-5 text-gray-400 mr-2" />
                                <input type="number" value={recipeData.servings} onChange={e => setRecipeData({...recipeData, servings: parseInt(e.target.value) || 1})} className="w-full bg-transparent font-bold outline-none text-[#1A1A1A]" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Tempo (min)</label>
                            <div className="flex items-center bg-gray-50 rounded-2xl p-3 border-2 border-transparent shadow-sm focus-within:border-[#3A5A40] focus-within:bg-white transition-colors">
                                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                                <input type="number" value={recipeData.prepTime} onChange={e => setRecipeData({...recipeData, prepTime: parseInt(e.target.value) || 0})} className="w-full bg-transparent font-bold outline-none text-[#1A1A1A]" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Cerca ingredienti..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3A5A40]/20 font-medium text-[#1A1A1A] shadow-sm border border-gray-100" />
                    </div>

                    {searchTerm && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {filteredProducts.map(p => (
                                <button key={p.id} onClick={() => handleAddIngredient(p)} className="px-3 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm font-medium hover:border-[#3A5A40] hover:text-[#3A5A40] transition-colors flex items-center gap-2">
                                    <span>{p.icon}</span> {p.name} <Plus className="w-3 h-3" />
                                </button>
                            ))}
                            <button 
                                onClick={() => handleAddIngredient(searchTerm)}
                                className="px-3 py-2 bg-[#3A5A40]/10 text-[#3A5A40] rounded-lg text-sm font-medium border border-transparent hover:bg-[#3A5A40]/20 transition-colors"
                            >
                                + Crea "{searchTerm}"
                            </button>
                        </div>
                    )}

                    <div className="space-y-2 mt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ingredienti aggiunti</p>
                        {recipeData.ingredients.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">Nessun ingrediente ancora.</div>
                        ) : (
                            recipeData.ingredients.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <span className="font-bold text-[#1A1A1A]">{ing.name}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                                            <input 
                                                type="number" 
                                                value={ing.qty} 
                                                onChange={(e) => updateIngredientQty(i, 'qty', e.target.value)} 
                                                className="w-12 bg-transparent text-right font-bold outline-none text-[#1A1A1A]" 
                                            />
                                            <select
                                                value={ing.unit}
                                                onChange={(e) => updateIngredientQty(i, 'unit', e.target.value)}
                                                className="bg-transparent text-xs text-gray-500 ml-1 outline-none font-medium cursor-pointer"
                                            >
                                                <option value="pz">pz</option>
                                                <option value="g">g</option>
                                                <option value="kg">kg</option>
                                                <option value="ml">ml</option>
                                                <option value="L">L</option>
                                                <option value="conf">conf</option>
                                                <option value="spicchio">spicchio</option>
                                                <option value="cucchiaio">cucchiaio</option>
                                            </select>
                                        </div>
                                        <button onClick={() => handleRemoveIngredient(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 pt-4">
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100 font-medium">
                        La gestione dettagliata dei passaggi arriverà presto. Per ora salveremo solo ingredienti e tempi.
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
            {step < 3 ? (
                <button onClick={handleNext} className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[#3A5A40]/20">
                    Continua <ChevronRight className="w-5 h-5 opacity-80" />
                </button>
            ) : (
                <button onClick={handleSaveRecipe} className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl">
                    Salva Ricetta <Check className="w-5 h-5" />
                </button>
            )}
        </div>
      </motion.div>
    </div>
  );
}