import React from 'react';
import { Sun, Cloud, Coffee, Cookie, Moon, Utensils } from 'lucide-react';
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

const mealContexts = {
  mattina: {
    gradient: 'from-amber-100 via-orange-50 to-yellow-50',
    icon: Coffee,
    iconBg: 'bg-amber-200',
    iconColor: 'text-amber-700',
    title: 'Colazione come sempre',
    subtitle: 'con latte macchiato e biscotti?',
    emoji: '☕',
    decorations: ['🥐', '🍪', '☕'],
    buttons: [
      { label: 'Sì', action: 'confirm' },
      { label: 'No', action: 'change' }
    ]
  },
  mezzogiorno: {
    gradient: 'from-green-100 via-emerald-50 to-teal-50',
    icon: Utensils,
    iconBg: 'bg-green-200',
    iconColor: 'text-green-700',
    title: 'Pasta al pesto',
    subtitle: 'Pranzo programmato per oggi',
    emoji: '🍝',
    details: '25 min • 2 persone',
    decorations: ['🌿', '🧀', '🍝'],
    buttons: [
      { label: 'Controlla ingredienti', action: 'ingredients' }
    ]
  },
  pranzo: {
    gradient: 'from-green-100 via-emerald-50 to-teal-50',
    icon: Utensils,
    iconBg: 'bg-green-200',
    iconColor: 'text-green-700',
    title: 'Pasta al pesto',
    subtitle: 'È ora di pranzo!',
    emoji: '🍝',
    details: '25 min • 2 persone',
    decorations: ['🌿', '🧀', '🍝'],
    buttons: [
      { label: 'Apri ricetta', action: 'recipe' }
    ]
  },
  pomeriggio: {
    gradient: 'from-[#A3B18A]/30 via-[#A3B18A]/20 to-[#A3B18A]/10',
    icon: Cookie,
    iconBg: 'bg-[#A3B18A]',
    iconColor: 'text-white',
    title: 'Cuciniamo il tuo snack preferito',
    subtitle: 'Hummus di ceci e crackers?',
    emoji: '🥙',
    decorations: ['🫘', '🥒', '🫓'],
    buttons: [
      { label: 'Apri ricetta', action: 'recipe' }
    ]
  },
  sera: {
    gradient: 'from-violet-100 via-purple-50 to-indigo-50',
    icon: Utensils,
    iconBg: 'bg-violet-200',
    iconColor: 'text-violet-700',
    title: 'Carbonara',
    subtitle: 'Cena per stasera',
    emoji: '🍝',
    details: '30 min • 2 persone',
    decorations: ['🥚', '🧀', '🥓'],
    buttons: [
      { label: 'Apri ricetta', action: 'recipe' }
    ]
  },
  notte: {
    gradient: 'from-indigo-200 via-slate-100 to-blue-100',
    icon: Moon,
    iconBg: 'bg-indigo-300',
    iconColor: 'text-indigo-800',
    title: 'Solito spuntino notturno?',
    subtitle: 'Fragole e panna',
    emoji: '🍓',
    decorations: ['🌙', '⭐', '🍓'],
    buttons: [
      { label: 'Scopri', action: 'discover' }
    ]
  }
};

export default function MealTimeWidget() {
  const timeContext = getTimeContext();
  const context = mealContexts[timeContext];
  const Icon = context.icon;

  const handleAction = (action) => {
    switch (action) {
      case 'confirm':
        toast.success('Perfetto! Buona colazione! ☕');
        break;
      case 'change':
        toast('Cosa preferisci invece?', { icon: '🤔' });
        break;
      case 'ingredients':
        toast.success('Funzionalità in arrivo!', { icon: '🚀' });
        break;
      case 'recipe':
        toast.success('Funzionalità in arrivo!', { icon: '🚀' });
        break;
      case 'discover':
        toast.success('Funzionalità in arrivo!', { icon: '🚀' });
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mx-5 mb-4"
    >
      <div className={`bg-gradient-to-br ${context.gradient} rounded-3xl p-5 card-shadow relative overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-40">
          {context.decorations.map((dec, i) => (
            <span key={i} className="text-2xl">{dec}</span>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-2xl ${context.iconBg} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${context.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[#1A1A1A] text-lg">{context.title}</h3>
              <p className="text-sm text-[#666666]">{context.subtitle}</p>
            </div>
            <span className="text-4xl">{context.emoji}</span>
          </div>

          {context.details && (
            <p className="text-sm text-[#666666] mb-3">{context.details}</p>
          )}

          <div className="flex gap-2">
            {context.buttons.map((btn, i) => (
              <button
                key={i}
                onClick={() => handleAction(btn.action)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform ${
                  i === 0 
                    ? 'bg-[#3A5A40] text-white' 
                    : 'bg-white/60 text-[#1A1A1A]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}