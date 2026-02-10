import React from 'react';
import { Leaf, Trophy, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWaste } from '@/context/WasteContext';

export default function AntiWasteWidget() {
  const { daysWithoutWaste, goal, progress, isInWasteAlert } = useWaste();

  // Colori dinamici basati sullo stato
  const bgGradient = isInWasteAlert 
    ? 'from-[#DC7D7D] to-[#C46B6B]' // Rosso chiaro/soft
    : 'from-[#3A5A40] to-[#2d4832]'; // Verde normale
  
  const progressBarBg = isInWasteAlert ? 'bg-white/30' : 'bg-white/20';
  const progressBarFill = isInWasteAlert ? 'bg-white' : 'bg-[#A3B18A]';
  const iconBg = isInWasteAlert ? 'bg-white/30' : 'bg-white/20';
  const trophyBg = isInWasteAlert ? 'bg-[#B85C5C]' : 'bg-[#D4A373]';

  // Testo dinamico
  const statusText = isInWasteAlert ? 'Spreco registrato oggi' : 'Nessun spreco da';
  const badgeText = isInWasteAlert 
    ? '💪 Riparti da qui! Ogni giorno conta.' 
    : `🏆 Badge "${goal} giorni senza sprechi" in arrivo!`;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="mx-5 mb-4"
    >
      <motion.div 
        className={`bg-gradient-to-br ${bgGradient} rounded-3xl p-5 card-shadow relative overflow-hidden`}
        animate={isInWasteAlert ? { scale: [1, 1.01, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
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
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                {isInWasteAlert ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Leaf className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium">{statusText}</p>
                <p className="text-white text-2xl font-bold">{daysWithoutWaste} giorni</p>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-full ${trophyBg} flex items-center justify-center`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Obiettivo: {goal} giorni</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={`h-2 ${progressBarBg} rounded-full overflow-hidden`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${progressBarFill} rounded-full`}
              />
            </div>
          </div>
          
          <p className="text-white/70 text-xs mt-3">
            {badgeText}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}