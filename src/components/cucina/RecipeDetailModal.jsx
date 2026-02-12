import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, ChevronRight, AlertCircle, Check, ShoppingCart, MessageCircle, RefreshCw } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { toast } from 'sonner';

export default function RecipeDetailModal({ meal, isOpen, onClose, onRemove, onReplace }) {
  const { products, addToShoppingList, consumeIngredients } = useProducts();
  const [activeTab, setActiveTab] = React.useState('ingredients');

  if (!meal) return null;

  // FIX 3: Logica disponibilità ingredienti
  const getIngredientStatus = (ingName, requiredQty, requiredUnit) => {
    // Cerca prodotto in inventario (case insensitive e parziale)
    const product = products.find(p => p.name.toLowerCase().includes(ingName.toLowerCase()));
    
    if (!product) return 'buy'; // Non c'è proprio
    
    // Controllo semplificato quantità (assumiamo unità compatibili o uguali per ora)
    // In un'app reale servirebbe conversione unità rigorosa
    if (product.quantity < requiredQty) return 'buy'; // C'è ma non basta

    // Se il prodotto è di qualcun altro (non shared e non dell'utente corrente 'Mari')
    // Qui simuliamo che l'utente sia 'Mari'
    if (product.owner !== 'mari' && product.owner !== 'shared') return 'ask';

    return 'ok'; // C'è ed è disponibile
  };

  const ingredientsWithStatus = meal.ingredients ? meal.ingredients.map(ing => ({
    ...ing,
    status: getIngredientStatus(ing.name, ing.qty, ing.unit)
  })) : [];

  // FIX 3: Controlla se si può cucinare
  const canCook = ingredientsWithStatus.length > 0 && ingredientsWithStatus.every(i => i.status === 'ok');

  const handleBuy = (ing) => {
    addToShoppingList({ name: ing.name, qty: ing.qty, unit: ing.unit });
    toast.success(`${ing.name} aggiunto alla lista della spesa`);
  };

  const handleAsk = (ing) => {
    toast.success(`Richiesta inviata a ${ing.owner || 'coinquilino'} per ${ing.name}`);
  };

  const handleCook = () => {
    if (!canCook) return;
    const count = consumeIngredients(meal.ingredients);
    toast.success(`Buon appetito! consumati ${count} ingredienti.`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header Immagine */}
            <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-50 relative flex items-center justify-center shrink-0">
                <span className="text-8xl filter drop-shadow-xl">{meal.icon}</span>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>
                
                {/* Tasto Sostituisci */}
                <button
                    onClick={onReplace}
                    className="absolute top-4 left-4 px-3 py-2 bg-white/50 backdrop-blur-md rounded-xl flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Cambia
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-1">
                                {meal.type === 'pranzo' ? 'Pranzo' : 'Cena'} • Chef {meal.chef}
                            </p>
                            <h2 className="text-3xl font-bold text-[#1A1A1A]">{meal.name}</h2>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4 mb-8">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">30 min</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Users className="w-4 h-4" />
                            <span className="text-sm font-medium">{meal.servings} pers.</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 mb-6">
                        <button 
                            onClick={() => setActiveTab('ingredients')}
                            className={`pb-3 px-4 text-sm font-bold transition-colors relative ${
                                activeTab === 'ingredients' ? 'text-[#3A5A40]' : 'text-gray-400'
                            }`}
                        >
                            Ingredienti
                            {activeTab === 'ingredients' && (
                                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3A5A40]" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('steps')}
                            className={`pb-3 px-4 text-sm font-bold transition-colors relative ${
                                activeTab === 'steps' ? 'text-[#3A5A40]' : 'text-gray-400'
                            }`}
                        >
                            Preparazione
                            {activeTab === 'steps' && (
                                <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3A5A40]" />
                            )}
                        </button>
                    </div>

                    {activeTab === 'ingredients' ? (
                        <div className="space-y-3">
                            {ingredientsWithStatus.map((ing, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            ing.status === 'ok' ? 'bg-green-500' : 
                                            ing.status === 'ask' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />
                                        <span className={`font-medium ${ing.status === 'ok' ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {ing.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500 font-medium">{ing.qty} {ing.unit}</span>
                                        
                                        {ing.status === 'buy' && (
                                            <button 
                                                onClick={() => handleBuy(ing)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Aggiungi alla spesa"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        )}
                                        {ing.status === 'ask' && (
                                             <button 
                                                onClick={() => handleAsk(ing)}
                                                className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                                title="Chiedi al coinquilino"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        {ing.status === 'ok' && (
                                            <div className="p-2 text-green-600">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Messaggio se mancano ingredienti */}
                            {!canCook && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>Mancano alcuni ingredienti. Aggiungili alla lista o chiedi ai coinquilini per poter cucinare.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {meal.steps ? meal.steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[#3A5A40]/10 text-[#3A5A40] font-bold flex items-center justify-center shrink-0 mt-1">
                                        {i + 1}
                                    </div>
                                    <p className="text-gray-600 leading-relaxed pt-1.5">{step}</p>
                                </div>
                            )) : (
                                <p className="text-gray-400 italic">Nessun passaggio registrato per questa ricetta.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                <button 
                    onClick={onRemove}
                    className="p-4 rounded-2xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors font-bold"
                >
                    <X className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleCook}
                    disabled={!canCook}
                    className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-xl transition-all ${
                        canCook 
                        ? 'bg-[#3A5A40] text-white shadow-[#3A5A40]/20 active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
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