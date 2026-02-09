import React, { useState } from 'react';
import { Plus, Users, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

const initialMeals = [
  { id: 1, day: 0, type: 'pranzo', name: 'Pasta al pesto', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio', 'Pile'], servings: 3 },
  { id: 2, day: 0, type: 'cena', name: 'Carbonara', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio'], servings: 2 },
  { id: 3, day: 1, type: 'pranzo', name: 'Avanzi Carbonara', icon: '📦', chef: null, participants: ['Mari'], servings: 1, isLeftover: true },
  { id: 4, day: 1, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 5, day: 2, type: 'pranzo', name: 'Insalatona', icon: '🥗', chef: 'Gio', participants: ['Gio', 'Pile'], servings: 2 },
  { id: 6, day: 2, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 7, day: 3, type: 'pranzo', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 8, day: 3, type: 'cena', name: 'Pizza fatta in casa', icon: '🍕', chef: 'Pile', participants: ['Mari', 'Gio', 'Pile'], servings: 3 },
];

export default function MealStream() {
  const [meals, setMeals] = useState(initialMeals);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showCookTwice, setShowCookTwice] = useState(false);

  const days = [0, 1, 2, 3];

  const getMealForDay = (dayOffset, mealType) => {
    return meals.find(m => m.day === dayOffset && m.type === mealType);
  };

  const handleMealClick = (meal) => {
    if (meal.isEmpty) {
      toast('Funzionalità in arrivo!', {
        icon: '🚀',
        description: 'Presto potrai aggiungere pasti qui'
      });
      return;
    }
    setSelectedMeal(meal);
  };

  const handleSkipMeal = (mealId, participant) => {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        const newParticipants = m.participants.filter(p => p !== participant);
        return {
          ...m,
          participants: newParticipants,
          servings: newParticipants.length
        };
      }
      return m;
    }));
    
    toast.success(`${participant} non parteciperà`, {
      description: 'Porzioni aggiornate automaticamente'
    });
    setSelectedMeal(null);
  };

  const handleToggleCookTwice = () => {
    setShowCookTwice(!showCookTwice);
    if (!showCookTwice) {
      toast.success('Cucina per il pranzo di domani attivato!', {
        description: 'Avanzi aggiunti al calendario'
      });
    }
  };

  return (
    <div className="px-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1A1A1A]">I prossimi giorni</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCookTwice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showCookTwice 
                ? 'bg-[#3A5A40] text-white' 
                : 'bg-white text-[#666666] card-shadow'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Cook Once, Eat Twice
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((dayOffset) => {
          const dayInfo = formatDay(dayOffset);
          const pranzo = getMealForDay(dayOffset, 'pranzo');
          const cena = getMealForDay(dayOffset, 'cena');

          return (
            <div key={dayOffset} className="flex-shrink-0 w-32">
              <div className="text-center mb-2">
                <p className="text-xs text-[#666666]">{dayInfo.day}</p>
                <p className="font-bold text-[#1A1A1A]">{dayInfo.date}</p>
              </div>

              <div className="space-y-2">
                {/* Pranzo */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMealClick(pranzo)}
                  className={`w-full p-3 rounded-2xl text-center transition-all ${
                    pranzo?.isEmpty 
                      ? 'border-2 border-dashed border-gray-300 bg-transparent' 
                      : pranzo?.isLeftover
                        ? 'bg-[#D4A373]/20'
                        : 'bg-white card-shadow'
                  }`}
                >
                  {pranzo?.isEmpty ? (
                    <div className="py-2">
                      <Plus className="w-5 h-5 text-gray-400 mx-auto" />
                      <p className="text-[10px] text-gray-400 mt-1">Pranzo</p>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl">{pranzo?.icon}</span>
                      <p className="text-xs font-medium text-[#1A1A1A] mt-1 truncate">{pranzo?.name}</p>
                      {pranzo?.chef && (
                        <p className="text-[10px] text-[#666666]">Chef: {pranzo.chef}</p>
                      )}
                    </>
                  )}
                </motion.button>

                {/* Cena */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMealClick(cena)}
                  className={`w-full p-3 rounded-2xl text-center transition-all ${
                    cena?.isEmpty 
                      ? 'border-2 border-dashed border-gray-300 bg-transparent' 
                      : 'bg-white card-shadow'
                  }`}
                >
                  {cena?.isEmpty ? (
                    <div className="py-2">
                      <Plus className="w-5 h-5 text-gray-400 mx-auto" />
                      <p className="text-[10px] text-gray-400 mt-1">Cena</p>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl">{cena?.icon}</span>
                      <p className="text-xs font-medium text-[#1A1A1A] mt-1 truncate">{cena?.name}</p>
                      {cena?.chef && (
                        <p className="text-[10px] text-[#666666]">Chef: {cena.chef}</p>
                      )}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meal Detail Modal */}
      <AnimatePresence>
        {selectedMeal && !selectedMeal.isEmpty && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setSelectedMeal(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-w-md mx-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedMeal.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedMeal.name}</h2>
                    {selectedMeal.chef && (
                      <p className="text-sm text-[#666666]">Chef: {selectedMeal.chef}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#666666] mb-2">Partecipanti ({selectedMeal.servings} porzioni)</p>
                <div className="flex gap-2">
                  {selectedMeal.participants.map((p) => (
                    <div key={p} className="flex items-center gap-2 px-3 py-2 bg-[#F2F0E9] rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-[#A3B18A] flex items-center justify-center text-white text-xs font-bold">
                        {p[0]}
                      </div>
                      <span className="text-sm font-medium">{p}</span>
                      {p !== 'Mari' && (
                        <button
                          onClick={() => handleSkipMeal(selectedMeal.id, p)}
                          className="text-xs text-red-500 font-medium"
                        >
                          Salto
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  toast.success('Funzionalità in arrivo!', { icon: '🚀' });
                  setSelectedMeal(null);
                }}
                className="w-full py-3 bg-[#3A5A40] text-white font-semibold rounded-2xl"
              >
                Apri ricetta
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}