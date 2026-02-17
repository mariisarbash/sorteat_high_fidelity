import React from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../context/ProductsContext';

export default function NotificationsModal({ isOpen, onClose }) {
  const { notifications, clearNotifications } = useProducts();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />

          {/* MODAL */}
          <motion.div 
            // STATO INIZIALE
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            
            // ENTRATA (Usa Spring/Molla per l'effetto rimbalzo piacevole)
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              transition: { type: "spring", damping: 25, stiffness: 300 }
            }}
            
            // USCITA (Usa Tween/Lineare per essere VELOCE e non bloccarsi)
            exit={{ 
              y: "100%", 
              opacity: 0, 
              scale: 0.95,
              transition: { duration: 0.2, ease: "easeIn" } // <--- QUESTO RISOLVE IL BLOCCO
            }}
            
            className="bg-white w-[95%] sm:max-w-md rounded-3xl flex flex-col max-h-[85vh] pointer-events-auto relative z-10 mb-5 shadow-2xl overflow-hidden"
          >
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3A5A40]/10 rounded-full flex items-center justify-center text-[#3A5A40]">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#1A1A1A]">Notifiche</h2>
                            <p className="text-xs text-gray-500">
                                {notifications.length > 0 ? `${notifications.length} nuove` : 'Nessuna nuova notifica'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto p-5 bg-white">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                            <Bell className="w-12 h-12 mb-3 opacity-20" />
                            <p>Tutto tranquillo!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <motion.div 
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-2xl border flex items-start gap-4 ${
                                        notification.type === 'expiry' ? 'bg-[#FFF8F0] border-orange-100' : 'bg-white border-gray-100 shadow-sm'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full ${notification.iconBg || 'bg-gray-100'} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                                        {notification.icon}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className="font-bold text-[#1A1A1A] text-sm leading-tight mb-1">{notification.title}</p>
                                        <p className="text-xs text-gray-500 font-medium">{notification.message}</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#3A5A40] mt-3" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* FOOTER */}
                {notifications.length > 0 && (
                    <div className="p-5 border-t border-gray-50 bg-white shrink-0">
                        <button 
                            onClick={clearNotifications}
                            className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Cancella tutto
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}