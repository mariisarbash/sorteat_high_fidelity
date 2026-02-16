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
  
  const [highlightedId, setHighlightedId] = useState(null);
  
  const { products } = useProducts();
  const currentUser = 'mari';

  // FIX 1 & 2: Logica di Ricerca Globale
  const filteredProducts = useMemo(() => {
    let result = products;

    // Se c'è una ricerca attiva, CERCA OVUNQUE (Ignora la categoria)
    if (searchQuery.trim() !== '') {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Se NON c'è ricerca, filtra per la tab attiva (Frigo/Dispensa/ecc)
      result = result.filter(p => p.category === activeCategory);
    }

    return result;
  }, [products, activeCategory, searchQuery]);

  // Calcolo prodotti in scadenza (sui risultati filtrati)
  const expiringProducts = useMemo(() => {
    return filteredProducts
      .filter(p => {
        if (!p.expiry_date) return false;
        const daysLeft = getDaysUntilExpiry(p.expiry_date);
        return daysLeft <= 3;
      })
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [filteredProducts]);

  // Calcolo prodotti regolari (escludendo quelli in scadenza per non duplicarli)
  const regularProducts = useMemo(() => {
    const expiringIds = new Set(expiringProducts.map(p => p.id));
    return filteredProducts.filter(p => !expiringIds.has(p.id));
  }, [filteredProducts, expiringProducts]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = (modifiedProductId = null) => {
    setIsModalOpen(false);
    setSelectedProduct(null);

    if (modifiedProductId) {
      setHighlightedId(modifiedProductId);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      <InventoryHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Nascondi le CategoryPills se l'utente sta cercando, per non confonderlo */}
      <div className={`transition-all duration-300 ${searchQuery ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
        <CategoryPills 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
      
      <ExpiringSection 
        products={expiringProducts} 
        onProductClick={handleProductClick}
        highlightedProductId={highlightedId}
      />
      
      <ProductsGrid 
        products={regularProducts}
        // Se c'è una ricerca, il titolo cambia per far capire che stiamo guardando tutto
        title={searchQuery ? (regularProducts.length > 0 ? 'Risultati della ricerca' : null) : (expiringProducts.length > 0 ? 'Tutti i prodotti' : null)}
        onProductClick={handleProductClick}
        highlightedProductId={highlightedId}
        // FIX 3: Nascondi messaggio "Vuoto" se abbiamo trovato roba in scadenza
        hideEmptyState={expiringProducts.length > 0} 
      />

      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        currentUser={currentUser}
      />
    </div>
  );
}