import React from 'react';
import { Sun, Moon, Coffee, Utensils, CloudSun, Sunset, ChefHat } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

// 1. LOGICA ORARIA SINCRONIZZATA CON LA CUCINA
const getTimeContext = () => {
  const hour = new Date().getHours();
  // Uso i decimali per gestire le mezz'ore (es. 14.5 = 14:30)
  const time = hour + (new Date().getMinutes() / 60);
  
  if (time >= 6 && time < 10) return 'mattina';
  if (time >= 10 && time < 12) return 'mezzogiorno';
  if (time >= 12 && time < 14.5) return 'pranzo';
  if (time >= 14.5 && time < 17) return 'pomeriggio';
  if (time >= 17 && time < 22.5) return 'sera';
  return 'notte';
};

const getGreeting = (timeContext) => {
  switch (timeContext) {
    case 'mattina': return 'Buongiorno';
    case 'mezzogiorno': return 'Buona giornata';
    case 'pranzo': return 'Buon pranzo';
    case 'pomeriggio': return 'Buon pomeriggio';
    case 'sera': return 'Buonasera';
    case 'notte': return 'Buonanotte';
    default: return 'Ciao';
  }
};

// Mappa per sapere quale pasto cercare nel DB in base all'orario
const getMealTypeForTime = (timeContext) => {
    switch (timeContext) {
      case 'mattina': return 'colazione';
      case 'mezzogiorno': return 'snack'; // o spuntino
      case 'pranzo': return 'pranzo';
      case 'pomeriggio': return 'merenda'; // o snack
      case 'sera': return 'cena';
      case 'notte': return 'snack';
      default: return 'pranzo';
    }
};

const getTimeIcon = (timeContext) => {
    switch (timeContext) {
        case 'mattina': return <Sun className="w-5 h-5 text-amber-500" />;
        case 'mezzogiorno': return <CloudSun className="w-5 h-5 text-sky-500" />;
        case 'pranzo': return <Utensils className="w-5 h-5 text-green-600" />;
        case 'pomeriggio': return <Coffee className="w-5 h-5 text-orange-500" />;
        case 'sera': return <Sunset className="w-5 h-5 text-indigo-500" />;
        case 'notte': return <Moon className="w-5 h-5 text-slate-400" />;
        default: return <Sun className="w-5 h-5 text-amber-500" />;
    }
};

export default function TimeSensitiveWidget({ userName, onMealClick }) {
  const { meals } = useProducts();
  
  const timeContext = getTimeContext();
  const greeting = getGreeting(timeContext);
  const icon = getTimeIcon(timeContext);
  
  const targetMealType = getMealTypeForTime(timeContext);
  
  // Cerchiamo un pasto per OGGI (day 0) che corrisponda al tipo (es. 'pranzo')
  // O che sia uno 'snack' generico se siamo in orari intermedi
  const currentMeal = meals.find(m => 
    m.day === 0 && 
    (m.type === targetMealType || (['mezzogiorno', 'pomeriggio', 'notte'].includes(timeContext) && m.type === 'snack')) && 
    !m.isEmpty
  );

  return (
    <div className="px-5 mb-2 mt-4">
      {/* Intestazione Saluto */}
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon}
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {greeting}, <span className="text-[#3A5A40]">{userName}</span>
        </h2>
      </div>
      
      {currentMeal ? (
        // CASO 1: C'è un pasto pianificato -> Mostra la Card "In Programma"
        <button 
          onClick={() => onMealClick && onMealClick(currentMeal)}
          className="w-full bg-white rounded-3xl p-4 card-shadow border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-all text-left relative overflow-hidden"
        >
           {/* Indicatore laterale verde */}
           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3A5A40]" />

           <div className="w-12 h-12 bg-[#F2F0E9] rounded-2xl flex items-center justify-center text-2xl shrink-0 ml-2">
              {currentMeal.icon || (['snack', 'merenda'].includes(targetMealType) ? '🍪' : '🍽️')}
           </div>

           <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A5A40] bg-[#3A5A40]/10 px-2 py-0.5 rounded-full">
                    In programma
                 </span>
              </div>
              
              <p className="font-bold text-lg text-[#1A1A1A] leading-tight truncate">
                  {currentMeal.name}
              </p>
              
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                 <ChefHat className="w-3 h-3" />
                 <span className="truncate">Chef: {currentMeal.chef} • {currentMeal.participants?.length || 1} persone</span>
              </div>
           </div>
        </button>
      ) : (
        // CASO 2: Nessun piano -> Mostra Card "Vuota" (Suggerimento)
        <div className="bg-white rounded-3xl p-5 card-shadow border border-gray-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 grayscale opacity-70">
              {['pomeriggio', 'mezzogiorno', 'notte'].includes(timeContext) ? '☕' : '🍃'}
           </div>
           <div>
              <p className="font-bold text-[#1A1A1A] text-sm">Nessun piano per {timeContext}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                 {['pomeriggio', 'mezzogiorno', 'notte'].includes(timeContext) 
                    ? "È il momento perfetto per una pausa!" 
                    : "Dai un'occhiata al frigo o crea una ricetta."}
              </p>
           </div>
        </div>
      )}
    </div>
  );
}