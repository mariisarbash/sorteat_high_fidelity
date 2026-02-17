import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Users, Search, ChevronRight, Save, Trash2, Check, Minus } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { toast } from 'sonner';
// FIX IMPORT: Parentesi graffe per named export
import { OwnerSelector } from '../spesa/OwnerSelector';

const RECIPE_EMOJIS = ['🍝', '🍕', '🥗', '🥩', '🍣', '🍲', '🍜', '🥪', '🌮', '🥘', '🍰', '🍪'];

export default function CreateRecipeModal({ isOpen, onClose, onSave, initialData }) {
  const { addRecipe } = useProducts();
  const [step, setStep] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const [recipeData, setRecipeData] = useState({
    name: '', 
    icon: '🍝', 
    servings: 2, 
    prepTime: 30, 
    ingredients: [], 
    steps: [''], 
    participants: ['mari'] // Default: solo Mari (o utente corrente)
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', qty: '', unit: 'g' });

  useEffect(() => { 
      if (initialData) setRecipeData(prev => ({ ...prev, ...initialData })); 
  }, [initialData]);

  const handleNext = () => {
      if (step === 1 && !recipeData.name.trim()) {
          toast.error("Dai un nome alla ricetta!");
          return;
      }
      setStep(prev => prev + 1);
  };

  const handleSaveRecipe = () => {
      if (recipeData.ingredients.length === 0) {
          toast.error("Aggiungi almeno un ingrediente!");
          return;
      }
      
      const recipeToSave = {
          ...recipeData,
          id: initialData?.id || `r${Date.now()}`
      };

      if (onSave) {
          onSave(recipeToSave);
      } else {
          addRecipe(recipeToSave);
          toast.success("Ricetta salvata nel ricettario! 📖");
      }
      onClose();
  };

  const addIngredient = () => {
      if (!newIngredient.name.trim()) return;
      setRecipeData(prev => ({
          ...prev,
          ingredients: [...prev.ingredients, { ...newIngredient, id: Date.now() }]
      }));
      setNewIngredient({ name: '', qty: '', unit: 'g' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl"
        >
            {/* HEADER */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                    {step > 1 && (
                        <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ChevronRight className="w-5 h-5 rotate-180 text-gray-600" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                        {initialData ? 'Modifica Ricetta' : 'Nuova Ricetta'}
                    </h2>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* STEP 1: INFO BASE */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Nome e Icona */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Nome del piatto</label>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="w-14 h-14 bg-[#F2F0E9] rounded-2xl flex items-center justify-center text-3xl shrink-0 active:scale-95 transition-transform"
                                >
                                    {recipeData.icon}
                                </button>
                                <div className="flex-1 bg-[#F2F0E9] rounded-2xl px-4 flex items-center">
                                    <input 
                                        type="text" 
                                        value={recipeData.name}
                                        onChange={(e) => setRecipeData({...recipeData, name: e.target.value})}
                                        placeholder="Es. Carbonara"
                                        className="bg-transparent w-full outline-none text-lg font-bold text-[#1A1A1A] placeholder:text-gray-400 placeholder:font-normal"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="grid grid-cols-6 gap-2 bg-[#F2F0E9] p-3 rounded-2xl">
                                    {RECIPE_EMOJIS.map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => { setRecipeData({...recipeData, icon: emoji}); setShowEmojiPicker(false); }}
                                            className="text-2xl p-2 hover:bg-white rounded-xl transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Porzioni e Tempo */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#F2F0E9] p-3 rounded-2xl">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                    <Users className="w-3 h-3" /> Porzioni
                                </label>
                                <div className="flex items-center justify-between bg-white rounded-xl p-1">
                                    <button 
                                        onClick={() => setRecipeData(prev => ({...prev, servings: Math.max(1, prev.servings - 1)}))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-lg">{recipeData.servings}</span>
                                    <button 
                                        onClick={() => setRecipeData(prev => ({...prev, servings: prev.servings + 1}))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#F2F0E9] p-3 rounded-2xl">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                    <Clock className="w-3 h-3" /> Minuti
                                </label>
                                <div className="flex items-center justify-between bg-white rounded-xl p-1">
                                    <button 
                                        onClick={() => setRecipeData(prev => ({...prev, prepTime: Math.max(5, prev.prepTime - 5)}))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-lg">{recipeData.prepTime}</span>
                                    <button 
                                        onClick={() => setRecipeData(prev => ({...prev, prepTime: prev.prepTime + 5}))}
                                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Partecipanti (OwnerSelector) */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#1A1A1A] ml-1">Per chi è questa ricetta?</label>
                            <div className="bg-[#F2F0E9] p-3 rounded-2xl">
                                <OwnerSelector 
                                    selectedOwners={recipeData.participants}
                                    onChange={(owners) => setRecipeData(prev => ({ ...prev, participants: owners }))}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: INGREDIENTI */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="bg-[#F2F0E9] p-4 rounded-2xl space-y-3">
                            <label className="text-sm font-bold text-[#1A1A1A]">Aggiungi Ingrediente</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newIngredient.name}
                                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                                    placeholder="Es. Pasta"
                                    className="flex-1 bg-white rounded-xl px-3 py-3 outline-none font-medium"
                                />
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    value={newIngredient.qty}
                                    onChange={(e) => setNewIngredient({...newIngredient, qty: e.target.value})}
                                    placeholder="Qta"
                                    className="w-24 bg-white rounded-xl px-3 py-3 outline-none font-medium text-center"
                                />
                                <select 
                                    value={newIngredient.unit}
                                    onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                                    className="w-20 bg-white rounded-xl px-2 py-3 outline-none font-bold text-center appearance-none"
                                >
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="ml">ml</option>
                                    <option value="pz">pz</option>
                                </select>
                                <button 
                                    onClick={addIngredient}
                                    disabled={!newIngredient.name}
                                    className="flex-1 bg-[#1A1A1A] text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Lista Ingredienti */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-[#1A1A1A] ml-1">Ingredienti ({recipeData.ingredients.length})</h3>
                            {recipeData.ingredients.length === 0 ? (
                                <p className="text-gray-400 text-center py-4 italic text-sm">Nessun ingrediente aggiunto</p>
                            ) : (
                                <div className="space-y-2">
                                    {recipeData.ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-[#3A5A40]" />
                                                <span className="font-medium text-[#1A1A1A]">{ing.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 font-medium text-sm">{ing.qty} {ing.unit}</span>
                                                <button 
                                                    onClick={() => setRecipeData(prev => ({
                                                        ...prev, 
                                                        ingredients: prev.ingredients.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="text-gray-300 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t border-gray-100 bg-white">
                {step === 1 ? (
                    <button 
                        onClick={handleNext}
                        className="w-full bg-[#3A5A40] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[#3A5A40]/20"
                    >
                        Continua <ChevronRight className="w-5 h-5 opacity-80" />
                    </button>
                ) : (
                    <button 
                        onClick={handleSaveRecipe}
                        className="w-full bg-[#1A1A1A] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl"
                    >
                        <Check className="w-5 h-5" /> Salva Ricetta
                    </button>
                )}
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}