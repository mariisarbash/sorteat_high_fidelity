import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Home, Package, ShoppingCart, ChefHat, Plus } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Inventario', icon: Package, page: 'Inventario' },
    { name: 'Add', icon: Plus, page: 'AddAction', isCenter: true },
    { name: 'Spesa', icon: ShoppingCart, page: 'Spesa' },
    { name: 'Cucina', icon: ChefHat, page: 'Cucina' },
  ];

  // Pages where the navigation bar should be hidden
  const hideNavPages = ['Profilo', 'AddAction', 'ScanReceipt', 'VoiceInput', 'EmptyFridge', 'ManualProductEntry'];

  const shouldShowNav = !hideNavPages.includes(currentPageName);

  return (
    // Base background color applied here
    <div className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A] font-sans">
      
      {/* Main Content Area */}
      {/* pb-28 ensures content isn't hidden behind the fixed navbar */}
      <main className={`max-w-md mx-auto min-h-screen ${shouldShowNav ? 'pb-28' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      {shouldShowNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40">
          {/* Navbar Container */}
          <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-end justify-around px-2 pb-2 pt-3 h-16 relative">
              
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                const Icon = item.icon;

                // Center "Floating" Button
                if (item.isCenter) {
                  return (
                    <Link
                      key={item.name}
                      to={createPageUrl(item.page)}
                      className="relative -top-5 group"
                    >
                      <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center
                        bg-[#3A5A40] shadow-lg shadow-[#3A5A40]/40
                        transform transition-all duration-200 ease-out
                        active:scale-95 active:translate-y-1
                      `}>
                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                      </div>
                    </Link>
                  );
                }

                // Standard Navigation Items
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`
                      flex flex-col items-center justify-center w-16 gap-1
                      transition-all duration-200 ease-out active:scale-95
                      ${isActive ? 'text-[#3A5A40]' : 'text-gray-400 hover:text-gray-500'}
                    `}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-all duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} 
                    />
                    <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}