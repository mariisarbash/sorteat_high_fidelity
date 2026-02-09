import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultWidgets = [
  { id: 'greeting', name: 'Saluto e suggerimento', enabled: true },
  { id: 'search', name: 'Cerca prodotto', enabled: true },
  { id: 'expiring', name: 'Prodotti in scadenza', enabled: true },
  { id: 'activities', name: 'Attività rapide', enabled: true },
  { id: 'antispreco', name: 'Contatore anti-spreco', enabled: true },
];

export default function HomeSettingsModal({ isOpen, onClose }) {
  const [widgets, setWidgets] = useState(defaultWidgets);

  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, enabled: !w.enabled } : w
    ));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white z-50 rounded-3xl max-w-md mx-auto overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Personalizza Home</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-sm text-[#666666] mb-4">Scegli quali widget visualizzare nella tua home</p>
              
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className="w-full flex items-center justify-between p-4 bg-[#F2F0E9] rounded-2xl active:scale-[0.98] transition-transform"
                >
                  <span className="font-medium text-[#1A1A1A]">{widget.name}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    widget.enabled ? 'bg-[#3A5A40]' : 'bg-gray-300'
                  }`}>
                    {widget.enabled && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-5 border-t border-gray-100">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-[#3A5A40] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
              >
                Salva preferenze
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}