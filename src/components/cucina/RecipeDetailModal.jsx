import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Check, Plus, AlertCircle, ChefHat, MessageCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '../../context/ProductsContext';

const ROOMMATES = [
  { id: 'mari', label: 'M', color: 'bg-pink-500' },
  { id: 'gio', label: 'G', color: 'bg-blue-500' },
  { id: 'pile', label: 'P', color: 'bg-purple-500' },
];

export default function RecipeDetailModal({ meal, isOpen, onClose }) {
  const { products, addToShoppingList, consumeIngredients, convertToBaseUnit, areUnitsCompatible } = useProducts();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [addedIngredients, setAddedIngredients] = useState([]);

  const ingredientsStatus = useMemo(() => {
    if (!meal || meal.isLeftover) return [];
    
    // Normalizzazione ingredienti (fallback se dati sporchi)
    let currentIngredients = meal.ingredients || [];
    if (currentIngredients.length === 0 && meal.name?.includes('Carbonara')) {
       currentIngredients = [
            { name: 'Spaghetti', qty: '300', unit: 'g' },
            { name: 'Uova', qty: '4', unit: 'pz' },
            { name: 'Guanciale', qty: '150', unit: 'g' },
            { name: 'Pecorino', qty: '100', unit: 'g' }
       ];
    }

    return currentIngredients.map(ing => {
      // Trova prodotto in inventario
      const inventoryItem = products.find(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
      
      let status = 'MISSING';
      let owner = null;

      if (inventoryItem) {
        // --- LOGICA DI CONFRONTO CON UNITÀ ---
        const invQtyBase = convertToBaseUnit(inventoryItem.quantity, inventoryItem.unit);
        const reqQtyBase = convertToBaseUnit(ing.qty, ing.unit);
        const compatible = areUnitsCompatible(inventoryItem.unit, ing.unit);

        // Se le unità sono compatibili, controlla le quantità convertite
        if (compatible && invQtyBase >= reqQtyBase) {
           status = 'AVAILABLE';
           owner = inventoryItem.owner;
           if (owner !== 'mari' && owner !== 'shared') status = 'ASK_NEEDED';
        } else if (compatible) {
            status = 'INSUFFICIENT'; // C'è ma non basta
        } else {
            // Unità incompatibili (es: uova pz vs kg), assumiamo OK se c'è il prodotto per ora, o INSUFFICIENT
            // Per il mock, se c'è l'oggetto, diamo ok se non sappiamo convertire
            status = 'AVAILABLE'; 
            owner = inventoryItem.owner;
        }
      }
      return { ...ing, status, inventoryItem, owner };
    });
  }, [meal, products]);

  const handleAskRoommate = (ownerId, ingredientName) => {
    const roommate = ROOMMATES.find(r => r.id === ownerId);
    toast.success(`Richiesta inviata a ${roommate ? roommate.label : 'coinquilino'}! 📩`, {
        description: `Hai chiesto in prestito: ${ingredientName}`
    });
  };

  const handleAddToShopping = (ingredientName) => {
    addToShoppingList(ingredientName);
    setAddedIngredients(prev => [...prev, ingredientName]);
    toast.success('Aggiunto al carrello');
  };

  const handleCook = () => {
    if (meal.isLeftover) {
        toast.success('Avanzi riscaldati! Buon appetito! 😋');
        onClose();
        return;
    }
    consumeIngredients(ingredientsStatus);
    toast.success('Buon appetito! 🍽️', { description: 'Dispensa aggiornata.' });
    onClose();
  };

  if (!isOpen || !meal) return null;

  const chefInfo = ROOMMATES.find(r => r.label === meal.chef || r.id === meal.chef?.toLowerCase());

  // Logica visualizzazione partecipanti (Avatar)
  const participantsList = meal.participants || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          className="bg-[#F7F6F3] w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative h-48 bg-gray-200 shrink-0">
             <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-b from-black/10 to-black/60">
              {meal.icon}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h2 className="text-3xl font-bold mb-1 shadow-sm">{meal.name}</h2>
              <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {meal.prepTime || 25} min</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {meal.servings} persone</span>
              </div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur rounded-full flex items-center justify-center text-white"><X className="w-5 h-5"/></button>
          </div>

          {/* Info Chef & Partecipanti (NUOVO DESIGN) */}
          <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${chefInfo?.color || 'bg-gray-400'}`}>
                    {chefInfo?.label?.[0] || '?'}
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Chef</p>
                    <p className="font-bold text-[#1A1A1A]">{meal.chef || 'Tu'}</p>
                </div>
             </div>

             {/* Partecipanti come Avatar */}
             <div className="flex flex-col items-end">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">Per chi?</p>
                <div className="flex -space-x-2">
                    {participantsList.map((pName, i) => {
                        // Cerca se il partecipante è un coinquilino noto
                        const r = ROOMMATES.find(rm => rm.label === pName || rm.id === pName.toLowerCase());
                        const color = r ? r.color : 'bg-gray-300';
                        const initial = pName[0];
                        
                        return (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${color}`} title={pName}>
                                {initial}
                            </div>
                        );
                    })}
                    {participantsList.length === 0 && <span className="text-sm text-gray-400">-</span>}
                </div>
             </div>
          </div>

          {/* Tabs */}
          {!meal.isLeftover && (
            <div className="flex p-2 bg-white border-b border-gray-100 shrink-0">
                <button onClick={() => setActiveTab('ingredients')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${activeTab === 'ingredients' ? 'bg-[#3A5A40] text-white' : 'text-gray-500'}`}>Ingredienti</button>
                <button onClick={() => setActiveTab('steps')} className={`flex-1 py-3 rounded-xl text-sm font-bold ${activeTab === 'steps' ? 'bg-[#3A5A40] text-white' : 'text-gray-500'}`}>Procedimento</button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-[#F7F6F3]">
            {meal.isLeftover ? (
                <div className="text-center py-10 space-y-4">
                    <div className="w-20 h-20 bg-[#D4A373]/20 rounded-full flex items-center justify-center mx-auto text-4xl">📦</div>
                    <div>
                        <h3 className="text-xl font-bold text-[#1A1A1A]">Pranzo Smart!</h3>
                        <p className="text-gray-500">Hai già cucinato questo piatto. Devi solo scaldarlo.</p>
                    </div>
                    <button onClick={handleCook} className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold shadow-lg">Fatto, me lo mangio!</button>
                </div>
            ) : (
                <>
                    {activeTab === 'ingredients' && (
                    <div className="space-y-4">
                        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                        {ingredientsStatus.length > 0 ? ingredientsStatus.map((ing, i) => {
                            const roommate = ROOMMATES.find(r => r.id === ing.owner);
                            const isAdded = addedIngredients.includes(ing.name);
                            
                            return (
                                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                                        ${ing.status === 'AVAILABLE' ? 'bg-green-100 text-green-600' : 
                                        ing.status === 'ASK_NEEDED' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-500'}`}>
                                        {ing.status === 'AVAILABLE' && <Check className="w-4 h-4" />}
                                        {ing.status === 'ASK_NEEDED' && <Users className="w-4 h-4" />}
                                        {(ing.status === 'MISSING' || ing.status === 'INSUFFICIENT') && <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div>
                                    <p className="font-bold text-[#1A1A1A] text-sm">{ing.name}</p>
                                    <p className="text-xs text-gray-500">{ing.qty} {ing.unit || ''}</p>
                                    </div>
                                </div>

                                <div>
                                    {ing.status === 'AVAILABLE' && (
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">OK</span>
                                    )}
                                    
                                    {ing.status === 'ASK_NEEDED' && (
                                        <button onClick={() => handleAskRoommate(ing.owner, ing.name)} className="flex items-center gap-1 text-xs font-bold text-white bg-blue-500 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                                            <MessageCircle className="w-3 h-3" /> Chiedi
                                        </button>
                                    )}

                                    {(ing.status === 'MISSING' || ing.status === 'INSUFFICIENT') && (
                                        <button 
                                            onClick={() => handleAddToShopping(ing.name)}
                                            disabled={isAdded}
                                            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${isAdded ? 'bg-green-600 text-white cursor-default' : 'bg-[#D4A373] text-white active:scale-95'}`}
                                        >
                                            {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                            {isAdded ? 'Aggiunto' : 'Compra'}
                                        </button>
                                    )}
                                </div>
                                </div>
                            );
                        }) : (
                            <div className="p-4 text-center text-gray-400 italic">Nessun ingrediente specificato</div>
                        )}
                        </div>

                        <button onClick={handleCook} className="w-full py-4 bg-[#3A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#3A5A40]/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                            <ChefHat className="w-5 h-5" /> Ho cucinato questo piatto
                        </button>
                    </div>
                    )}

                    {activeTab === 'steps' && (
                        <div className="space-y-4">
                            {meal.steps && meal.steps.length > 0 ? (
                                meal.steps.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-col items-center flex">
                                            <div className="w-8 h-8 rounded-full bg-[#3A5A40] text-white flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                                            {i < meal.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-2"></div>}
                                        </div>
                                        <div className="pb-6"><p className="text-[#1A1A1A] leading-relaxed">{step}</p></div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 bg-white rounded-2xl text-gray-500 italic text-center">Nessun procedimento salvato.</div>
                            )}
                        </div>
                    )}
                </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}