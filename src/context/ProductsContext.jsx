import React, { createContext, useContext, useState, useMemo } from 'react';
import { getDaysUntilExpiry } from '@/utils/products';

// Re-export per retrocompatibilità
export { getDaysUntilExpiry };

// Dati prodotti iniziali
const initialProducts = [
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

// Crea il contesto
const ProductsContext = createContext(null);

// Provider component
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);

  // Aggiorna la quantità di un prodotto
  const updateProduct = (productId, newQuantity) => {
    setProducts(prev => 
      prev.map(p => 
        p.id === productId 
          ? { ...p, quantity: newQuantity }
          : p
      )
    );
  };

  // Rimuovi un prodotto dall'inventario
  const removeProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Aggiungi nuovi prodotti all'inventario (dalla spesa)
  const addProducts = (newProducts) => {
    setProducts(prev => {
      // Genera nuovi ID per i prodotti
      const maxId = Math.max(...prev.map(p => p.id), 0);
      const productsWithIds = newProducts.map((product, index) => ({
        ...product,
        id: maxId + index + 1,
        // Mappa il department della spesa alla category dell'inventario
        category: mapDepartmentToCategory(product.department),
        // Converti owners array a owner singolo o 'shared'
        owner: product.owners?.length === 3 ? 'shared' : (product.owners?.[0] || 'shared'),
        // Aggiungi una data di scadenza di default se non presente (7 giorni)
        expiry_date: product.expiry_date || getDefaultExpiryDate(product.department),
      }));
      return [...prev, ...productsWithIds];
    });
  };

  // Funzione helper per mappare department -> category
  const mapDepartmentToCategory = (department) => {
    const mapping = {
      'ortofrutta': 'frigo',
      'freschi': 'frigo',
      'dispensa': 'dispensa',
      'casa': 'dispensa', // prodotti casa vanno in dispensa
      'surgelati': 'freezer',
    };
    return mapping[department] || 'frigo';
  };

  // Funzione helper per generare data scadenza di default
  const getDefaultExpiryDate = (department) => {
    const today = new Date();
    let daysToAdd = 7; // default
    
    if (department === 'freschi' || department === 'ortofrutta') {
      daysToAdd = 7;
    } else if (department === 'dispensa' || department === 'casa') {
      daysToAdd = 365;
    } else if (department === 'surgelati') {
      daysToAdd = 180;
    }
    
    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split('T')[0];
  };

  // Ottieni i prodotti in scadenza (entro 3 giorni)
  const expiringProducts = useMemo(() => {
    return products
      .filter(p => {
        if (!p.expiry_date) return false;
        const daysLeft = getDaysUntilExpiry(p.expiry_date);
        return daysLeft <= 3;
      })
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [products]);

  const value = {
    products,
    setProducts,
    updateProduct,
    removeProduct,
    addProducts,
    expiringProducts,
    getDaysUntilExpiry
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

// Hook per usare il contesto
export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
