import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const categories = [
  { id: 'frigo', label: 'Frigo', icon: '❄️' },
  { id: 'dispensa', label: 'Dispensa', icon: '🗄️' },
  { id: 'freezer', label: 'Freezer', icon: '🧊' },
];

export default function CategoryPills({ activeCategory, onCategoryChange }) {
  const handleAddCategory = () => {
    toast('Funzionalità in arrivo!', {
      icon: '🚀',
      description: 'Presto potrai creare categorie personalizzate'
    });
  };

  return (
    <div className="px-5 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === category.id
                ? 'bg-[#3A5A40] text-white'
                : 'bg-white text-[#1A1A1A] card-shadow'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </motion.button>
        ))}
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAddCategory}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white card-shadow text-[#3A5A40]"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}