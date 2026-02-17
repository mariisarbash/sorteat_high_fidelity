import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Bell } from 'lucide-react'; // Rimosso Settings
import NotificationsModal from './NotificationsModal';
// Rimosso import HomeSettingsModal

export default function HomeHeader({ 
  hasUnreadNotifications, 
  onNotificationsRead 
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    onNotificationsRead?.();
  };

  return (
    <>
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        {/* SINISTRA: Profile Avatar */}
        <Link 
          to={createPageUrl('Profilo')}
          className="w-10 h-10 rounded-full bg-[#A3B18A] flex items-center justify-center overflow-hidden active:scale-95 transition-transform shadow-sm"
        >
          <span className="text-white font-semibold text-sm">M</span>
        </Link>

        {/* DESTRA: Solo Notifiche */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenNotifications}
            className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5 text-[#1A1A1A]" />
            {hasUnreadNotifications && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>

      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}