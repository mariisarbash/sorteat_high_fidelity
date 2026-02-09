import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ChevronLeft, Clock, Users, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';

const mockRecipes = [
  {
    id: 1,
    name: 'Frittata di Spinaci',
    icon: '🍳',
    time: 15,
    servings: 2,
    ingredients: ['Uova', 'Spinaci', 'Formaggio'],
    difficulty: 'Facile',
    image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400'
  },
  {
    id: 2,
    name: 'Pasta Burro e Parmigiano',
    icon: '🍝',
    time: 12,
    servings: 2,
    ingredients: ['Pasta', 'Burro', 'Formaggio'],
    difficulty: 'Facile',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'
  },
  {
    id: 3,
    name: 'Pollo al Limone',
    icon: '🍗',
    time: 25,
    servings: 2,
    ingredients: ['Pollo', 'Olio', 'Limone'],
    difficulty: 'Media',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400'
  }
];

export default function EmptyFridge() {
  const navigate = useNavigate();
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    toast.success(`${recipe.name} selezionata!`, {
      description: 'Tocca "Inizia a cucinare" per procedere',
      icon: recipe.icon
    });
  };

  const handleStartCooking = () => {
    toast.success('Funzionalità in arrivo!', {
      icon: '🚀',
      description: 'Presto potrai seguire la ricetta passo passo'
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9]">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 card-shadow">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Svuota Frigo</h1>
          <p className="text-xs text-[#666666]">Ricette con quello che hai</p>
        </div>
      </div>

      <div className="p-5">
        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#A3B18A]/30 to-[#A3B18A]/10 rounded-3xl p-5 mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3A5A40] flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1A1A1A]">3 ricette trovate</p>
              <p className="text-sm text-[#666666]">basate sul tuo inventario</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#1A1A1A]">🥚 Uova</span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#1A1A1A]">🥬 Spinaci</span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#1A1A1A]">🍗 Pollo</span>
            <span className="px-3 py-1 bg-white/60 rounded-full text-xs text-[#1A1A1A]">🧀 Formaggio</span>
          </div>
        </motion.div>

        {/* Recipes */}
        <h2 className="font-semibold text-[#1A1A1A] mb-3">Ricette suggerite</h2>
        
        <div className="space-y-3">
          {mockRecipes.map((recipe, index) => (
            <motion.button
              key={recipe.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectRecipe(recipe)}
              className={`w-full bg-white rounded-2xl overflow-hidden card-shadow text-left active:scale-[0.98] transition-all ${
                selectedRecipe?.id === recipe.id ? 'ring-2 ring-[#3A5A40]' : ''
              }`}
            >
              <div className="flex">
                <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#1A1A1A]">{recipe.name}</p>
                      <p className="text-xs text-[#666666] mt-0.5">{recipe.difficulty}</p>
                    </div>
                    <span className="text-2xl">{recipe.icon}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#666666]">
                      <Clock className="w-3 h-3" />
                      {recipe.time} min
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#666666]">
                      <Users className="w-3 h-3" />
                      {recipe.servings} persone
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action button */}
        {selectedRecipe && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-6"
          >
            <button
              onClick={handleStartCooking}
              className="w-full py-4 bg-[#3A5A40] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
            >
              Inizia a cucinare {selectedRecipe.icon}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}