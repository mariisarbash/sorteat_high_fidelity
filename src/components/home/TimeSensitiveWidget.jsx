import React, { useState } from 'react';
import { Sun, Cloud, Moon, Utensils, Coffee, Cookie, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const getTimeContext = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 10) return 'mattina';
  if (hour >= 10 && hour < 12) return 'mezzogiorno';
  if (hour >= 12 && hour < 14.5) return 'pranzo';
  if (hour >= 14.5 && hour < 17) return 'pomeriggio';
  if (hour >= 17 && hour < 22.5) return 'sera';
  return 'notte';
};

const getGreeting = (timeContext) => {
  switch (timeContext) {
    case 'mattina': return 'Buongiorno';
    case 'mezzogiorno': return 'Buongiorno';
    case 'pranzo': return 'Buon pranzo';
    case 'pomeriggio': return 'Buon pomeriggio';
    case 'sera': return 'Buonasera';
    case 'notte': return 'Buonanotte';
    default: return 'Ciao';
  }
};

const timeContextData = {
  mattina: {
    icon: Sun,
    gradient: 'from-amber-100 to-orange-50',
    iconColor: 'text-amber-500',
    message: 'Non dimenticarti di scongelare il pollo per stasera',
    action: 'Fatto',
    actionType: 'defrost'
  },
  mezzogiorno: {
    icon: Cloud,
    gradient: 'from-sky-100 to-blue-50',
    iconColor: 'text-sky-500',
    message: 'Pile è all\'Unes! Vuoi aggiungere qualcosa alla lista della spesa?',
    action: 'Aggiungi',
    actionType: 'addToList'
  },
  pranzo: {
    icon: Utensils,
    gradient: 'from-green-100 to-emerald-50',
    iconColor: 'text-green-600',
    message: 'Hai cucinato pasta al pesto per 1 persona. Posso eliminare gli ingredienti usati dall\'inventario?',
    action: 'Sì',
    actionSecondary: 'No',
    actionType: 'removeIngredients'
  },
  pomeriggio: {
    icon: Cookie,
    gradient: 'from-[#A3B18A]/30 to-[#A3B18A]/10',
    iconColor: 'text-[#3A5A40]',
    message: 'Snack vegani da fare in 10 minuti',
    action: 'Scopri',
    actionType: 'discover'
  },
  sera: {
    icon: Sparkles,
    gradient: 'from-violet-100 to-purple-50',
    iconColor: 'text-violet-500',
    message: 'Piani per cena: Carbonara per 2 persone',
    action: 'Apri ricetta',
    actionType: 'openRecipe'
  },
  notte: {
    icon: Moon,
    gradient: 'from-indigo-100 to-slate-100',
    iconColor: 'text-indigo-400',
    message: 'Voglia di uno spuntino notturno? 5 idee salutari',
    action: 'Scopri',
    actionType: 'discover'
  }
};

export default function TimeSensitiveWidget({ userName = 'Mari' }) {
  const [actionDone, setActionDone] = useState(false);
  const timeContext = getTimeContext();
  const data = timeContextData[timeContext];
  const Icon = data.icon;
  const greeting = getGreeting(timeContext);

  const handleAction = () => {
    switch (data.actionType) {
      case 'defrost':
        toast.success('Pollo spostato dal freezer al frigo!', {
          icon: '🍗'
        });
        setActionDone(true);
        break;
      case 'addToList':
        toast.success('Reindirizzamento alla lista della spesa', {
          icon: '🛒'
        });
        break;
      case 'removeIngredients':
        toast.success('Ingredienti rimossi dall\'inventario', {
          icon: '✅'
        });
        setActionDone(true);
        break;
      case 'discover':
      case 'openRecipe':
        toast.success('Funzionalità in arrivo!', {
          icon: '🚀'
        });
        break;
    }
  };

  const handleSecondaryAction = () => {
    toast('Ingredienti mantenuti nell\'inventario', {
      icon: '📦'
    });
    setActionDone(true);
  };

  if (actionDone && (data.actionType === 'defrost' || data.actionType === 'removeIngredients')) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-5 mb-4"
      >
        <div className={`bg-gradient-to-br ${data.gradient} rounded-3xl p-5 card-shadow`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center ${data.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">{greeting}, {userName}</h2>
            </div>
          </div>
          <p className="text-[#1A1A1A]/80 text-sm font-medium flex items-center gap-2">
            <span className="text-lg">✅</span> Fatto! Tutto aggiornato.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-5 mb-4"
    >
      <div className={`bg-gradient-to-br ${data.gradient} rounded-3xl p-5 card-shadow`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center ${data.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">{greeting}, {userName}</h2>
          </div>
        </div>
        
        <p className="text-[#1A1A1A]/80 text-sm mb-4 leading-relaxed">
          {data.message}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleAction}
            className="px-5 py-2.5 bg-[#3A5A40] text-white font-semibold text-sm rounded-xl active:scale-95 transition-transform"
          >
            {data.action}
          </button>
          {data.actionSecondary && (
            <button
              onClick={handleSecondaryAction}
              className="px-5 py-2.5 bg-white/60 text-[#1A1A1A] font-semibold text-sm rounded-xl active:scale-95 transition-transform"
            >
              {data.actionSecondary}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}