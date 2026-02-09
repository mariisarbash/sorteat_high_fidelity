import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Bell, Settings, Search } from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import HomeSettingsModal from './HomeSettingsModal';

export default function HomeHeader({ hasUnreadNotifications, onNotificationsRead }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    onNotificationsRead?.();
  };

  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          <Link 
            to={createPageUrl('Profilo')}
            className="w-10 h-10 rounded-full bg-[#A3B18A] flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
          >
            <span className="text-white font-semibold text-sm">M</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca in Sorteat..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A5A40]/20 card-shadow"
            />
          </div>

          {/* Notifications */}
          <button 
            onClick={handleOpenNotifications}
            className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5 text-[#1A1A1A]" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          {/* Settings */}
          <button 
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <Settings className="w-5 h-5 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      <HomeSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}