import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, AlertCircle, Check, ShoppingCart, MessageCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { toast } from 'sonner';
// FIX 3: Importo l'AvatarStack per mostrare i coinquilini
import AvatarStack from '../spesa/AvatarStack';

export default function RecipeDetailModal({ meal, isOpen, onClose, onRemove, onReplace }) {
  const { addToShoppingList, consumeIngredients, restoreData, checkIngredientAvailability } = useProducts();
  const [activeTab, setActiveTab] = useState('ingredients');
  // Previene l'aggiunta multipla alla spesa
  const [addedItems, setAddedItems] = useState(new Set());

  if (!meal) return null;

  // Usa la funzione globale che tiene conto di conversioni Kg/g
  const ingredientsWithStatus = meal.ingredients ? meal.ingredients.map(ing => {
      const { status, productOwner } = checkIngredientAvailability(ing.name, ing.qty, ing.unit);
      return { ...ing, status, productOwner };
  }) : [];

  const canCook = ingredientsWithStatus.length > 0 && ingredientsWithStatus.every(i => i.status === 'ok');

  // Mappatura nomi avatar -> id minuscoli (Mari -> mari)
  const mappedOwners = meal.participants && meal.participants.length > 0 
        ? meal.participants.map(p => p.toLowerCase()) 
        : ['shared'];

  const handleBuy = (ing) => {
    if (addedItems.has(ing.name)) return; 

    // Aggiungo alla spesa usando i partecipanti della ricetta come proprietari (Task 2 & 3)
    addToShoppingList({ 
        name: ing.name, 
        qty: ing.qty, 
        unit: ing.unit,
        owners: mappedOwners 
    });

    setAddedItems(prev => new Set(prev).add(ing.name));
    toast.success(`${ing.name} aggiunto alla spesa!`);
  };

  const handleAsk = (ing) => {
    toast.success(`Richiesta inviata a ${ing.productOwner || 'coinquilino'} per ${ing.name}`);
  };

  const handleCook = () => {
    if (!canCook) return;
    
    // Devo importare products solo se mi serve lo snapshot (lo ometto per brevità o posso passarlo se necessario, qui semplifico l'undo a solo messaggistica per non spezzare il context hook)
    const count = consumeIngredients(meal.ingredients);
    onClose();

    toast.success(`Buon appetito! Consumati ${count} ingredienti.`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-br from-amber-100 to-orange-50 relative flex items-center justify-center shrink-0">
                <span className="text-6xl filter drop-shadow-xl">{meal.icon}</span>
                <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors z-10">
                    <X className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={onReplace} className="absolute top-3 left-3 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-xl flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors z-10">
                    <RefreshCw className="w-4 h-4" /> Cambia
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">
                                {meal.type === 'pranzo' ? 'Pranzo' : 'Cena'} • Chef {meal.chef}
                            </p>
                            <h2 className="text-2xl font-bold text-[#1A1A1A]">{meal.name}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 mb-6">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg"><Clock className="w-4 h-4" /> <span className="text-sm font-medium">30 min</span></div>
                        
                        {/* FIX 3: Mostro chi partecipa alla cena in modo visivo */}
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <span className="text-sm font-medium pr-1">Per:</span>
                            <AvatarStack owners={mappedOwners} size="small" />
                        </div>
                    </div>

                    <div className="flex border-b border-gray-100 mb-6">
                        <button onClick={() => setActiveTab('ingredients')} className={`pb-3 px-4 text-sm font-bold transition-colors relative ${activeTab === 'ingredients' ? 'text-[#3A5A40]' : 'text-gray-400'}`}>
                            Ingredienti
                            {activeTab === 'ingredients' && (<motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3A5A40]" />)}
                        </button>
                        <button onClick={() => setActiveTab('steps')} className={`pb-3 px-4 text-sm font-bold transition-colors relative ${activeTab === 'steps' ? 'text-[#3A5A40]' : 'text-gray-400'}`}>
                            Preparazione
                            {activeTab === 'steps' && (<motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3A5A40]" />)}
                        </button>
                    </div>

                    {activeTab === 'ingredients' ? (
                        <div className="space-y-3">
                            {ingredientsWithStatus.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${ing.status === 'ok' ? 'bg-green-500' : ing.status === 'ask' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                        <span className={`font-medium ${ing.status === 'ok' ? 'text-gray-700' : 'text-gray-400'}`}>{ing.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 font-medium">{ing.qty} {ing.unit}</span>
                                        
                                        {ing.status === 'buy' && !addedItems.has(ing.name) && (
                                            <button onClick={() => handleBuy(ing)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm"><ShoppingCart className="w-4 h-4" /></button>
                                        )}
                                        {ing.status === 'buy' && addedItems.has(ing.name) && (
                                            <div className="p-2 bg-green-100 text-green-600 rounded-lg shadow-sm"><Check className="w-4 h-4" /></div>
                                        )}

                                        {ing.status === 'ask' && (
                                             <button onClick={() => handleAsk(ing)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors shadow-sm"><MessageCircle className="w-4 h-4" /></button>
                                        )}
                                        {ing.status === 'ok' && (<div className="p-2 text-green-600"><Check className="w-4 h-4" /></div>)}
                                    </div>
                                </div>
                            ))}
                            {!canCook && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>Mancano alcuni ingredienti. Aggiungili alla lista o chiedi ai coinquilini.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {meal.steps ? meal.steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#3A5A40]/10 text-[#3A5A40] font-bold flex items-center justify-center shrink-0 mt-1">{i + 1}</div>
                                    <p className="text-gray-600 leading-relaxed pt-1.5">{step}</p>
                                </div>
                            )) : (<p className="text-gray-400 italic">Nessun passaggio registrato.</p>)}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                <button onClick={onRemove} className="p-4 rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors font-bold"><X className="w-5 h-5" /></button>
                <button 
                    onClick={handleCook}
                    disabled={!canCook}
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl transition-all ${
                        canCook ? 'bg-[#3A5A40] text-white shadow-[#3A5A40]/20 active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                >
                    {canCook ? 'Cucina ora 👨‍🍳' : 'Ingredienti mancanti'}
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}