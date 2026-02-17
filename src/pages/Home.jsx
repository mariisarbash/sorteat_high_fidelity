import React, { useState } from 'react';
import { Toaster } from 'sonner';
import HomeHeader from '../components/home/HomeHeader';
import TimeSensitiveWidget from '../components/home/TimeSensitiveWidget';
import SearchProductWidget from '../components/home/SearchProductWidget';
import ShoppingListWidget from '../components/home/ShoppingListWidget';
import ExpiringProductsWidget from '../components/home/ExpiringProductsWidget';
import QuickActionsWidget from '../components/home/QuickActionsWidget';
import AntiWasteWidget from '../components/home/AntiWasteWidget';

import ProductDetailModal from '../components/inventory/ProductDetailModal';
import RecipeDetailModal from '../components/cucina/RecipeDetailModal';

export default function Home() {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    setIsMealModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseMealModal = () => {
    setIsMealModalOpen(false);
    setSelectedMeal(null);
  };

  return (
    // FIX LAYOUT: Aumentato pb-24 per evitare che la navbar copra l'ultimo widget
    <div className="min-h-screen bg-[#F7F6F3] pb-32">
      <Toaster position="top-center" richColors />
      
      <HomeHeader 
        hasUnreadNotifications={hasUnreadNotifications}
        onNotificationsRead={() => setHasUnreadNotifications(false)}
      />
      
      {/* FIX LAYOUT: space-y-6 per dare molto respiro tra le sezioni */}
      <div className="pb-4 space-y-6">
        <TimeSensitiveWidget 
            userName="Mari" 
            onMealClick={handleMealClick}
        />
        
        <SearchProductWidget />

        <ShoppingListWidget />
        
        <ExpiringProductsWidget 
            onProductClick={handleProductClick}
        />
        
        <QuickActionsWidget />
        
        <AntiWasteWidget />
      </div>

      <ProductDetailModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={selectedProduct}
        currentUser="mari"
      />

      <RecipeDetailModal 
        isOpen={isMealModalOpen}
        onClose={handleCloseMealModal}
        recipe={selectedMeal}
      />
    </div>
  );
}