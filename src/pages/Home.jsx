import React, { useState } from 'react';
import { Toaster } from 'sonner';
import HomeHeader from '../components/home/HomeHeader';
import TimeSensitiveWidget from '../components/home/TimeSensitiveWidget';
import SearchProductWidget from '../components/home/SearchProductWidget';
import ExpiringProductsWidget from '../components/home/ExpiringProductsWidget';
import QuickActionsWidget from '../components/home/QuickActionsWidget';
import AntiWasteWidget from '../components/home/AntiWasteWidget';

export default function Home() {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />
      
      <HomeHeader 
        hasUnreadNotifications={hasUnreadNotifications}
        onNotificationsRead={() => setHasUnreadNotifications(false)}
      />
      
      <div className="pb-4">
        <TimeSensitiveWidget userName="Mari" />
        <SearchProductWidget />
        <ExpiringProductsWidget />
        <QuickActionsWidget />
        <AntiWasteWidget />
      </div>
    </div>
  );
}