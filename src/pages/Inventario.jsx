import React, { useState, useMemo, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
import InventoryHeader from '../components/inventory/InventoryHeader';
import CategoryPills from '../components/inventory/CategoryPills';
import ProductsGrid from '../components/inventory/ProductsGrid';
import ProductDetailModal from '../components/inventory/ProductDetailModal';
import { useProducts, getDaysUntilExpiry } from '../context/ProductsContext';

export default function Inventario() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('frigo');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  
  const [sortOption, setSortOption] = useState('name');
  const [filterOwner, setFilterOwner] = useState('all');
  
  const { products } = useProducts();
  const currentUser = 'mari';

  const filteredProducts = useMemo(() => {
    let result = products;
    const isSearching = searchQuery.trim() !== '';
    if (isSearching) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      result = result.filter(p => p.category === activeCategory);
    }

    if (filterOwner !== 'all') {
      result = result.filter(p => {
        const owners = p.owners || (p.owner ? [p.owner] : ['shared']);
        if (filterOwner === 'shared') {
           return owners.includes('shared') || owners.length === 3;
        } else {
           return owners.includes(filterOwner) || owners.includes('shared') || owners.length === 3;
        }
      });
    }
    return result;
  }, [products, activeCategory, searchQuery, filterOwner]);

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
    const regular = filteredProducts.filter(p => !expiringIds.has(p.id));
    return regular.sort((a, b) => {
      switch (sortOption) {
        case 'name': return a.name.localeCompare(b.name);
        case 'expiry': 
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'recent': return b.id - a.id;
        default: return 0;
      }
    });
  }, [filteredProducts, expiringProducts, sortOption]);

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

  const isSearchMode = searchQuery.trim() !== '';

  return (
    <div className="min-h-screen bg-[#F7F6F3] pb-32"> 
      <Toaster position="top-center" richColors />
      
      <InventoryHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        filterOwner={filterOwner}
        onFilterOwnerChange={setFilterOwner}
        shouldAutoFocus={location.state?.autoFocus}
      />
      
      <div className={`transition-all duration-300 ${isSearchMode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
        <CategoryPills 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>
      
      {/* 1. SEZIONE IN SCADENZA */}
      {expiringProducts.length > 0 && (
        <>
          <ProductsGrid 
            products={expiringProducts} 
            title="In scadenza" 
            onProductClick={handleProductClick}
            highlightedProductId={highlightedId}
            hideEmptyState={true}
            isSearchMode={isSearchMode}
            // FIX SPAZIO: pb-1 rimuove quasi tutto lo spazio sotto le card
            className="px-5 pb-1"
          />
          
          {/* Divisore sottile con margini ridotti */}
          {regularProducts.length > 0 && (
             <div className="mx-5 my-3 border-t border-gray-200" />
          )}
        </>
      )}
      
      {/* 2. SEZIONE ALTRI PRODOTTI */}
      <ProductsGrid 
        products={regularProducts}
        title={expiringProducts.length > 0 ? "Altri prodotti" : (isSearchMode ? "Risultati" : null)}
        onProductClick={handleProductClick}
        highlightedProductId={highlightedId}
        hideEmptyState={expiringProducts.length > 0} 
        isSearchMode={isSearchMode}
        // Padding bottom abbondante per lo scroll finale
        className="px-5 pb-24"
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