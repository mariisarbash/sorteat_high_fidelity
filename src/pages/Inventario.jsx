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

  // NUOVI STATI PER FILTRO E ORDINAMENTO
  const [sortOption, setSortOption] = useState('name'); // 'name', 'expiry', 'recent'
  const [filterOwner, setFilterOwner] = useState('all'); // 'all', 'mari', 'gio', 'pile', 'shared'
  
  const { products } = useProducts();
  const currentUser = 'mari';

  // 1. FILTRAGGIO (Ricerca Globale + Categoria + Proprietario)
  const filteredProducts = useMemo(() => {
    let result = products;

    // A) RICERCA TESTUALE
    const isSearching = searchQuery.trim() !== '';
    if (isSearching) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Se non cerco, filtro per categoria
      result = result.filter(p => p.category === activeCategory);
    }

    // B) FILTRO PROPRIETARIO
    if (filterOwner !== 'all') {
      result = result.filter(p => {
        // Normalizzo gli owners (gestione compatibilità vecchi dati)
        const owners = p.owners || (p.owner ? [p.owner] : ['shared']);
        
        // Logica richiesta: Se filtro "Mari", voglio vedere "Mari" E "Shared".
        // Se filtro "Shared" (casa), voglio vedere solo quelli puramente condivisi.
        
        if (filterOwner === 'shared') {
           // Mostra se è esplicitamente shared o se appartiene a tutti
           return owners.includes('shared') || owners.length === 3;
        } else {
           // Mostra se il proprietario è incluso OPPURE se è un prodotto condiviso
           return owners.includes(filterOwner) || owners.includes('shared') || owners.length === 3;
        }
      });
    }

    return result;
  }, [products, activeCategory, searchQuery, filterOwner]);

  // 2. CALCOLO SEZIONI (In Scadenza vs Regolari)
  
  // "Da consumare subito" -> Mantiene SEMPRE l'ordinamento per scadenza (URGENZA)
  const expiringProducts = useMemo(() => {
    return filteredProducts
      .filter(p => {
        if (!p.expiry_date) return false;
        const daysLeft = getDaysUntilExpiry(p.expiry_date);
        return daysLeft <= 3;
      })
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [filteredProducts]);

  // "Tutti i prodotti" -> Applica l'ordinamento scelto dall'utente
  const regularProducts = useMemo(() => {
    const expiringIds = new Set(expiringProducts.map(p => p.id));
    const regular = filteredProducts.filter(p => !expiringIds.has(p.id));

    // C) APPLICAZIONE ORDINAMENTO
    return regular.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          // Chi non ha scadenza va in fondo
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'recent':
          // Assumendo che ID più alto = più recente (timestamp)
          return b.id - a.id;
        default:
          return 0;
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
    <div className="min-h-screen bg-[#F7F6F3] pb-24">
      <Toaster position="top-center" richColors />
      
      <InventoryHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        // Props per filtri e ordinamento
        sortOption={sortOption}
        onSortChange={setSortOption}
        filterOwner={filterOwner}
        onFilterOwnerChange={setFilterOwner}
      />
      
      <div className={`transition-all duration-300 ${isSearchMode ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
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
        title={isSearchMode ? (regularProducts.length > 0 ? 'Risultati della ricerca' : null) : (expiringProducts.length > 0 ? 'Tutti i prodotti' : null)}
        onProductClick={handleProductClick}
        highlightedProductId={highlightedId}
        hideEmptyState={expiringProducts.length > 0} 
        isSearchMode={isSearchMode}
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