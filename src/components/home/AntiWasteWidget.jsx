import React from 'react';
import { Leaf, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AntiWasteWidget() {
  const daysWithoutWaste = 12;
  const goal = 30;
  const progress = (daysWithoutWaste / goal) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="mx-5 mb-4"
    >
      <div className="bg-gradient-to-br from-[#3A5A40] to-[#2d4832] rounded-3xl p-5 card-shadow relative overflow-hidden">
        {/* Decorative leaves */}
        <div className="absolute -right-4 -top-4 opacity-10">
          <Leaf className="w-24 h-24 text-white rotate-45" />
        </div>
        <div className="absolute -left-2 -bottom-2 opacity-10">
          <Leaf className="w-16 h-16 text-white -rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">Nessun spreco da</p>
                <p className="text-white text-2xl font-bold">{daysWithoutWaste} giorni</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#D4A373] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Obiettivo: {goal} giorni</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#A3B18A] rounded-full"
              />
            </div>
          </div>
          
          <p className="text-white/70 text-xs mt-3">
            🏆 Badge "30 giorni senza sprechi" in arrivo!
          </p>
        </div>
      </div>
    </motion.div>
  );
}