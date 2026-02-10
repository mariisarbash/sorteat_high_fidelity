import React, { useState, useMemo } from 'react';
import { Toaster } from 'sonner';
import InventoryHeader from '../components/inventory/InventoryHeader';
import CategoryPills from '../components/inventory/CategoryPills';
import ExpiringSection from '../components/inventory/ExpiringSection';
import ProductsGrid from '../components/inventory/ProductsGrid';
import ProductDetailModal from '../components/inventory/ProductDetailModal';
import { useProducts, getDaysUntilExpiry } from '../context/ProductsContext';

export default function Inventario() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('frigo');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Usa il contesto globale dei prodotti
  const { products, updateProduct, removeProduct } = useProducts();

  // Utente corrente (mock)
  const currentUser = 'mari';

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.category === activeCategory)
      .filter(p => 
        searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [products, activeCategory, searchQuery]);

  const expiringProducts = useMemo(() => {
    return filteredProducts
      .filter(p => {
        if (!p.expiry_date) return false;
        const daysLeft = getDaysUntilExpiry(p.expiry_date);
        return daysLeft <= 3;
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

  // Callback per aggiornare la quantità di un prodotto
  const handleUpdateProduct = (productId, newQuantity) => {
    updateProduct(productId, newQuantity);
    // Aggiorna anche il prodotto selezionato se è lo stesso
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => ({ ...prev, quantity: newQuantity }));
    }
  };

  // Callback per rimuovere un prodotto dall'inventario
  const handleRemoveProduct = (productId) => {
    removeProduct(productId);
    // Chiudi il modale se il prodotto rimosso è quello selezionato
    if (selectedProduct && selectedProduct.id === productId) {
      handleCloseModal();
    }
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
        onUpdateProduct={handleUpdateProduct}
        onRemoveProduct={handleRemoveProduct}
      />
    </div>
  );
}