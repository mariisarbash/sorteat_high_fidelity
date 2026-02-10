import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-3xl z-50 p-6 max-w-sm mx-auto"
          >
            {/* Icona */}
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            {/* Testo */}
            <h3 className="text-lg font-bold text-[#1A1A1A] text-center mb-2">
              Eliminare questo prodotto?
            </h3>
            <p className="text-[#666666] text-center mb-6">
              Stai per rimuovere <span className="font-semibold text-[#1A1A1A]">{itemName}</span> dalla lista della spesa.
            </p>

            {/* Bottoni */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 rounded-2xl font-semibold text-[#1A1A1A] active:scale-[0.98] transition-transform"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-3 bg-red-500 rounded-2xl font-semibold text-white active:scale-[0.98] transition-transform"
              >
                Elimina
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
