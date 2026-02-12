import React, { useState } from 'react';
import { Plus, Users, X, ChefHat, ShoppingCart, Clock, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import RecipeDetailModal from './RecipeDetailModal';
import CreateRecipeModal from './CreateRecipeModal';
import { useProducts } from '../../context/ProductsContext'; 

const today = new Date();
const formatDay = (daysFromNow) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysFromNow);
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return {
    day: days[date.getDay()],
    date: date.getDate()
  };
};

const ROOMMATES = [
  { id: 'mari', label: 'Mari', color: 'bg-pink-500' },
  { id: 'gio', label: 'Gio', color: 'bg-blue-500' },
  { id: 'pile', label: 'Pile', color: 'bg-purple-500' },
];

export default function MealStream() {
  const { recipes, addRecipe, products, meals, updateMealInCalendar, removeMealFromCalendar } = useProducts();

  const [selectedMeal, setSelectedMeal] = useState(null); 
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [planningMode, setPlanningMode] = useState('menu'); 
  const [mockSelectedIngredients, setMockSelectedIngredients] = useState([]); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
  const [prefilledRecipe, setPrefilledRecipe] = useState(null); 
  const [planningSlot, setPlanningSlot] = useState(null); 

  const days = [0, 1, 2, 3];

  const getMealForDay = (dayOffset, mealType) => {
    return meals ? meals.find(m => m.day === dayOffset && m.type === mealType) : null;
  };

  const handleMealClick = (meal) => {
    if (!meal) return;
    if (meal.isEmpty) {
      setPlanningSlot({ day: meal.day, type: meal.type });
      setPlanningMode('menu'); 
      setMockSelectedIngredients([]);
      setIsPlanningOpen(true);
    } else {
      setSelectedMeal(meal);
    }
  };

  // --- GESTIONE RIMOZIONE SICURA (PREVENZIONE ERRORI) ---
  const handleRemoveMeal = () => {
    if (!selectedMeal) return;
    
    // Toast con azione di conferma invece di window.confirm (più elegante)
    toast("Vuoi davvero eliminare questo pasto?", {
        action: {
            label: 'Elimina',
            onClick: () => {
                removeMealFromCalendar({ day: selectedMeal.day, type: selectedMeal.type });
                setSelectedMeal(null);
                toast.success("Pasto rimosso correttamente");
            }
        },
        cancel: {
            label: 'Annulla',
        },
        duration: 4000,
    });
  };

  // --- GESTIONE SOSTITUZIONE SICURA (RECUPERO ERRORI) ---
  const handleReplaceMeal = () => {
    if (!selectedMeal) return;
    const slotToReplace = { day: selectedMeal.day, type: selectedMeal.type };
    
    // FIX: NON rimuoviamo il pasto vecchio subito!
    // Chiudiamo solo il dettaglio e apriamo il planner.
    // Se l'utente chiude il planner senza scegliere nulla, il vecchio pasto rimane.
    setSelectedMeal(null);
    
    setTimeout(() => {
        setPlanningSlot(slotToReplace);
        setPlanningMode('menu');
        setIsPlanningOpen(true);
    }, 200);
  };

  const handleQuickAdd = (recipe) => {
    if (!planningSlot) return;
    
    const mealData = typeof recipe === 'string' 
        ? { name: recipe, icon: '🍝', chef: 'Mari', participants: ['Tutti'], servings: 2 }
        : { 
            name: recipe.name, 
            icon: recipe.icon, 
            chef: 'Mari', 
            participants: ['Tutti'], 
            servings: recipe.servings,
            ingredients: recipe.ingredients, 
            steps: recipe.steps 
          };

    // Qui sovrascriviamo, sia che fosse vuoto o pieno (caso sostituzione)
    updateMealInCalendar(planningSlot, mealData);
    setIsPlanningOpen(false);
    toast.success(`${mealData.name} aggiunto al menu!`);
  };

  const openCreateModal = (recipeData = null) => {
    setPrefilledRecipe(recipeData);
    setIsPlanningOpen(false);
    setTimeout(() => setIsCreateModalOpen(true), 200);
  };

  const handleSaveNewRecipe = (recipeData) => {
    if (!planningSlot) return;
    updateMealInCalendar(planningSlot, {
        name: recipeData.name,
        icon: recipeData.icon,
        chef: 'Mari', 
        participants: recipeData.participants || ['Tutti'],
        servings: recipeData.servings,
        ingredients: recipeData.ingredients,
        steps: recipeData.steps
    });
    addRecipe(recipeData);
    toast.success('Ricetta salvata e pianificata! 👨‍🍳');
  };

  const startMockAI = () => {
    setPlanningMode('ai_mock');
    const sequence = [{ t: 500, ing: 'Uova' }, { t: 1200, ing: 'Spinaci' }, { t: 1800, ing: 'Formaggio' }];
    sequence.forEach(({ t, ing }) => {
        setTimeout(() => {
            setMockSelectedIngredients(prev => [...prev, ing]);
        }, t);
    });
    setTimeout(() => {
        const generatedRecipe = {
            name: 'Frittata di Spinaci',
            icon: '🍳',
            prepTime: 20,
            servings: 1, 
            ingredients: [
                { productId: '', name: 'Uova', qty: 2, unit: 'pz' },
                { productId: '', name: 'Spinaci', qty: 100, unit: 'g' },
                { productId: '', name: 'Formaggio', qty: 30, unit: 'g' },
                { productId: '', name: 'Olio', qty: 10, unit: 'ml' }
            ],
            steps: ['Sbatti le uova con sale e pepe.', 'Salta gli spinaci.', 'Unisci e cuoci.']
        };
        openCreateModal(generatedRecipe);
    }, 2500);
  };

  return (
    <div className="px-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1A1A1A]">I prossimi giorni</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 no-scrollbar">
        {days.map((dayOffset) => {
          const dayInfo = formatDay(dayOffset);
          const pranzo = getMealForDay(dayOffset, 'pranzo');
          const cena = getMealForDay(dayOffset, 'cena');

          return (
            <div key={dayOffset} className="flex-shrink-0 w-32">
              <div className="text-center mb-2">
                <p className="text-xs text-[#666666] uppercase tracking-wide">{dayInfo.day}</p>
                <p className="font-bold text-[#1A1A1A] text-lg">{dayInfo.date}</p>
              </div>
              <div className="space-y-2">
                <MealCard meal={pranzo} onClick={() => handleMealClick(pranzo)} label="Pranzo" />
                <MealCard meal={cena} onClick={() => handleMealClick(cena)} label="Cena" />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isPlanningOpen && (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm"
                onClick={() => setIsPlanningOpen(false)}
            >
                <motion.div
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                    
                    {planningMode === 'menu' ? (
                        <>
                            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Cosa cuciniamo?</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={startMockAI}
                                    className="w-full p-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl flex items-center gap-3 active:scale-[0.98] shadow-lg shadow-violet-200"
                                >
                                    <Sparkles className="w-6 h-6" />
                                    <div className="text-left">
                                        <p className="font-bold">Genera con AI</p>
                                        <p className="text-xs opacity-90">Usa gli ingredienti che hai</p>
                                    </div>
                                </button>

                                {recipes && recipes.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 px-1">Le tue ricette</p>
                                        {recipes.map(recipe => (
                                            <button 
                                                key={recipe.id}
                                                onClick={() => handleQuickAdd(recipe)}
                                                className="w-full p-4 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center gap-3 mb-2 active:scale-[0.98]"
                                            >
                                                <span className="text-2xl">{recipe.icon}</span>
                                                <div className="text-left">
                                                    <p className="font-bold text-[#1A1A1A]">{recipe.name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <Clock className="w-3 h-3" /> {recipe.prepTime} min • {recipe.servings} pers
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => openCreateModal(null)}
                                    className="w-full p-4 border-2 border-dashed border-[#3A5A40]/30 bg-[#3A5A40]/5 rounded-2xl text-[#3A5A40] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-colors mt-2"
                                >
                                    <Plus className="w-5 h-5" /> Crea nuova ricetta
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
                                    Analisi Frigo...
                                </h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">L'AI sta scegliendo gli ingredienti migliori.</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['Uova', 'Latte', 'Spinaci', 'Pasta', 'Formaggio', 'Pollo', 'Pomodori'].map(name => {
                                    const isSelected = mockSelectedIngredients.includes(name);
                                    return (
                                        <motion.div
                                            key={name}
                                            initial={false}
                                            animate={{ 
                                                scale: isSelected ? 1.05 : 1,
                                                backgroundColor: isSelected ? '#3A5A40' : '#FFFFFF',
                                                borderColor: isSelected ? '#3A5A40' : '#E5E7EB',
                                                color: isSelected ? '#FFFFFF' : '#4B5563'
                                            }}
                                            className="px-3 py-2 rounded-xl text-sm font-medium border flex items-center gap-2"
                                        >
                                            {name}
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </motion.div>
                                    )
                                })}
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-violet-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "linear" }}
                                />
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateModalOpen && (
            <CreateRecipeModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSave={handleSaveNewRecipe}
                initialData={prefilledRecipe}
            />
        )}
      </AnimatePresence>

      <RecipeDetailModal 
        meal={selectedMeal} 
        isOpen={!!selectedMeal && !selectedMeal.isEmpty} 
        onClose={() => setSelectedMeal(null)}
        onRemove={handleRemoveMeal}
        onReplace={handleReplaceMeal}
      />
    </div>
  );
}

const MealCard = ({ meal, onClick, label }) => {
    const chefColor = meal?.chef 
        ? ROOMMATES.find(r => r.label === meal.chef || r.id === meal.chef.toLowerCase())?.color || 'bg-gray-400'
        : 'bg-gray-400';

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full p-3 rounded-2xl text-center transition-all h-[90px] flex flex-col items-center justify-center relative overflow-hidden ${
            meal?.isEmpty 
                ? 'border-2 border-dashed border-gray-200 bg-transparent hover:bg-gray-50' 
                : meal?.isLeftover
                ? 'bg-[#D4A373]/10 border border-[#D4A373]/20'
                : 'bg-white card-shadow border border-transparent'
            }`}
        >
            {meal?.isEmpty ? (
            <>
                <Plus className="w-5 h-5 text-gray-300 mb-1" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            </>
            ) : (
            <>
                {meal?.chef && (
                    <div className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${chefColor}`}>
                        {meal.chef[0]}
                    </div>
                )}
                <span className="text-2xl mb-1 block">{meal?.icon}</span>
                <p className="text-xs font-bold text-[#1A1A1A] w-full truncate px-1">{meal?.name}</p>
                <p className="text-[10px] text-gray-500">{meal?.servings} porz.</p>
            </>
            )}
        </motion.button>
    );
};