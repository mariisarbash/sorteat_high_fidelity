import React from 'react';
import { X, Package, ShoppingCart, AlertTriangle, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mockNotifications = [
  {
    id: 1,
    title: 'Pile ha aggiunto Latte',
    message: '2 minuti fa',
    type: 'activity',
    icon: '🥛',
    iconBg: 'bg-blue-100'
  },
  {
    id: 2,
    title: 'Pollo in scadenza',
    message: 'Scade domani - consumare subito',
    type: 'expiry',
    icon: '🍗',
    iconBg: 'bg-[#D4A373]/20'
  },
  {
    id: 3,
    title: 'Gio è al supermercato',
    message: 'Aggiungi qualcosa alla lista!',
    type: 'shopping',
    icon: '🛒',
    iconBg: 'bg-[#A3B18A]/30'
  },
  {
    id: 4,
    title: 'Yogurt greco finito',
    message: 'Aggiunto automaticamente alla spesa',
    type: 'activity',
    icon: '🥄',
    iconBg: 'bg-purple-100'
  }
];

export default function NotificationsModal({ isOpen, onClose }) {
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 rounded-b-3xl max-w-md mx-auto overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Notifiche</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {mockNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-5 py-4 border-b border-gray-50 flex items-start gap-3 active:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full ${notification.iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A1A] text-sm">{notification.title}</p>
                    <p className="text-xs text-[#666666] mt-0.5">{notification.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button className="w-full py-2.5 text-[#3A5A40] font-medium text-sm">
                Segna tutte come lette
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}