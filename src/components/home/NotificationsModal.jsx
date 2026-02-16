import React, { useState, useEffect } from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Notifiche di base (mock)
const initialMockNotifications = [
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
  }
];

export default function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  // 1. CARICAMENTO INIZIALE E ASCOLTO EVENTI
  useEffect(() => {
    // Funzione per caricare da LocalStorage
    const loadNotifications = () => {
        const saved = localStorage.getItem('sorteat_notifications');
        if (saved) {
            setNotifications(JSON.parse(saved));
        } else {
            setNotifications(initialMockNotifications);
        }
    };

    // Carica subito quando apri la modale
    if (isOpen) {
        loadNotifications();
    }

    // Listener per aggiornamenti in tempo reale (mentre la modale è aperta)
    const handleNewNotification = (event) => {
        // Ricarica tutto dal storage per essere sicuri
        loadNotifications();
    };

    window.addEventListener('storage', loadNotifications); // Ascolta cambi storage
    window.addEventListener('add-notification', handleNewNotification); // Ascolta evento custom

    return () => {
        window.removeEventListener('storage', loadNotifications);
        window.removeEventListener('add-notification', handleNewNotification);
    };
  }, [isOpen]);

  // Funzione per pulire
  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('sorteat_notifications', JSON.stringify([]));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* BACKDROP SCURO */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* CONTENUTO MODALE (Centrato/Basso) */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white w-full sm:max-w-md h-[80vh] sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl flex flex-col relative z-10 overflow-hidden"
            >
                {/* HEADER */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#3A5A40]/10 rounded-full">
                            <Bell className="w-5 h-5 text-[#3A5A40]" />
                        </div>
                        <h3 className="font-bold text-lg text-[#1A1A1A]">Notifiche</h3>
                        {notifications.length > 0 && (
                            <span className="bg-[#3A5A40] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                {/* LISTA NOTIFICHE */}
                <div className="flex-1 overflow-y-auto p-0">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <Bell className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-medium">Nessuna nuova notifica</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="px-6 py-4 flex items-start gap-4 active:bg-gray-50 transition-colors"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${notification.iconBg || 'bg-gray-100'} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
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
                    <div className="p-5 border-t border-gray-50 bg-white">
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