import React, { useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import InventoryHeader from '../components/inventory/InventoryHeader';
import CategoryPills from '../components/inventory/CategoryPills';
import ExpiringSection from '../components/inventory/ExpiringSection';
import ProductsGrid from '../components/inventory/ProductsGrid';
import ProductDetailModal from '../components/inventory/ProductDetailModal';

// Mock data
const mockProducts = [
  // Frigo
  { id: 1, name: 'Pollo', icon: '🍗', category: 'frigo', quantity: 500, unit: 'g', expiry_date: '2026-02-09', owner: 'mari' },
  { id: 2, name: 'Yogurt', icon: '🥛', category: 'frigo', quantity: 2, unit: 'vasetti', expiry_date: '2026-02-10', owner: 'shared' },
  { id: 3, name: 'Spinaci', icon: '🥬', category: 'frigo', quantity: 200, unit: 'g', expiry_date: '2026-02-11', owner: 'gio' },
  { id: 4, name: 'Latte', icon: '🥛', category: 'frigo', quantity: 1, unit: 'L', expiry_date: '2026-02-15', owner: 'shared' },
  { id: 5, name: 'Uova', icon: '🥚', category: 'frigo', quantity: 6, unit: 'pz', expiry_date: '2026-02-20', owner: 'mari' },
  { id: 6, name: 'Formaggio', icon: '🧀', category: 'frigo', quantity: 150, unit: 'g', expiry_date: '2026-02-18', owner: 'pile' },
  { id: 7, name: 'Burro', icon: '🧈', category: 'frigo', quantity: 250, unit: 'g', expiry_date: '2026-03-01', owner: 'shared' },
  { id: 8, name: 'Mozzarella', icon: '🧀', category: 'frigo', quantity: 125, unit: 'g', expiry_date: '2026-02-12', owner: 'mari' },
  
  // Dispensa
  { id: 9, name: 'Pasta', icon: '🍝', category: 'dispensa', quantity: 2, unit: 'kg', expiry_date: '2027-06-01', owner: 'shared' },
  { id: 10, name: 'Riso', icon: '🍚', category: 'dispensa', quantity: 1, unit: 'kg', expiry_date: '2027-03-01', owner: 'shared' },
  { id: 11, name: 'Olio', icon: '🫒', category: 'dispensa', quantity: 750, unit: 'ml', expiry_date: '2027-01-01', owner: 'shared' },
  { id: 12, name: 'Tonno', icon: '🐟', category: 'dispensa', quantity: 3, unit: 'lattine', expiry_date: '2027-12-01', owner: 'mari' },
  { id: 13, name: 'Biscotti', icon: '🍪', category: 'dispensa', quantity: 1, unit: 'pacco', expiry_date: '2026-05-01', owner: 'gio' },
  { id: 14, name: 'Caffè', icon: '☕', category: 'dispensa', quantity: 250, unit: 'g', expiry_date: '2026-08-01', owner: 'shared' },
  { id: 15, name: 'Farina', icon: '🌾', category: 'dispensa', quantity: 1, unit: 'kg', expiry_date: '2026-10-01', owner: 'shared' },
  { id: 16, name: 'Zucchero', icon: '🍬', category: 'dispensa', quantity: 500, unit: 'g', expiry_date: '2027-01-01', owner: 'shared' },
  
  // Freezer
  { id: 17, name: 'Gelato', icon: '🍨', category: 'freezer', quantity: 500, unit: 'ml', expiry_date: '2026-12-01', owner: 'mari' },
  { id: 18, name: 'Piselli', icon: '🟢', category: 'freezer', quantity: 400, unit: 'g', expiry_date: '2026-09-01', owner: 'shared' },
  { id: 19, name: 'Pizza', icon: '🍕', category: 'freezer', quantity: 2, unit: 'pz', expiry_date: '2026-06-01', owner: 'pile' },
  { id: 20, name: 'Spinaci surgelati', icon: '🥬', category: 'freezer', quantity: 450, unit: 'g', expiry_date: '2026-11-01', owner: 'shared' },
];

export default function Inventario() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('frigo');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Utente corrente (mock)
  const currentUser = 'mari';

  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter(p => p.category === activeCategory)
      .filter(p => 
        searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [activeCategory, searchQuery]);

  const expiringProducts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return filteredProducts
      .filter(p => {
        if (!p.expiry_date) return false;
        const expiry = new Date(p.expiry_date);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      })
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [filteredProducts]);

  const regularProducts = useMemo(() => {
    const expiringIds = new Set(expiringProducts.map(p => p.id));
    return filteredProducts.filter(p => !expiringIds.has(p.id));
  }, [filteredProducts, expiringProducts]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    console.log('Nuova notifica aggiunta:', notification);
  };

  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      <InventoryHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <CategoryPills 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <ExpiringSection 
        products={expiringProducts} 
        onProductClick={handleProductClick}
      />
      
      <ProductsGrid 
        products={regularProducts}
        title={expiringProducts.length > 0 ? 'Tutti i prodotti' : null}
        onProductClick={handleProductClick}
      />

      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        currentUser={currentUser}
        onAddNotification={handleAddNotification}
      />
    </div>
  );
}