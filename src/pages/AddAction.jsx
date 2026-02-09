import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { X, Camera, Mic, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddAction() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'scan',
      icon: Camera,
      label: 'Scansiona Scontrino',
      description: 'Aggiungi prodotti automaticamente',
      color: 'bg-blue-500',
      page: 'ScanReceipt'
    },
    {
      id: 'voice',
      icon: Mic,
      label: 'Input Vocale',
      description: 'Parla per aggiungere o rimuovere',
      color: 'bg-purple-500',
      page: 'VoiceInput'
    },
    {
      id: 'cook',
      icon: ChefHat,
      label: 'Svuota Frigo',
      description: 'Cucina con quello che hai',
      color: 'bg-[#3A5A40]',
      page: 'EmptyFridge'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Azione rapida</h2>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={createPageUrl(action.page)}
                  className="flex items-center gap-4 p-4 bg-[#F2F0E9] rounded-2xl active:scale-[0.98] transition-transform"
                >
                  <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1A1A]">{action.label}</p>
                    <p className="text-sm text-[#666666]">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}