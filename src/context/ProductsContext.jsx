import React, { createContext, useContext, useState, useMemo } from 'react';
import { getDaysUntilExpiry } from '@/utils/products';

export { getDaysUntilExpiry };

// --- DATI INIZIALI ---
const initialProducts = [
  { id: 1, name: 'Pollo', icon: '🍗', category: 'frigo', quantity: 500, unit: 'g', expiry_date: '2026-02-09', owner: 'mari' },
  { id: 2, name: 'Yogurt', icon: '🥛', category: 'frigo', quantity: 2, unit: 'vasetti', expiry_date: '2026-02-10', owner: 'shared' },
  { id: 3, name: 'Spinaci', icon: '🥬', category: 'frigo', quantity: 200, unit: 'g', expiry_date: '2026-02-11', owner: 'gio' },
  { id: 4, name: 'Latte', icon: '🥛', category: 'frigo', quantity: 1, unit: 'L', expiry_date: '2026-02-15', owner: 'shared' },
  { id: 5, name: 'Uova', icon: '🥚', category: 'frigo', quantity: 6, unit: 'pz', expiry_date: '2026-02-20', owner: 'mari' },
  { id: 6, name: 'Formaggio', icon: '🧀', category: 'frigo', quantity: 150, unit: 'g', expiry_date: '2026-02-18', owner: 'pile' },
  { id: 7, name: 'Burro', icon: '🧈', category: 'frigo', quantity: 250, unit: 'g', expiry_date: '2026-03-01', owner: 'shared' },
  { id: 8, name: 'Mozzarella', icon: '🧀', category: 'frigo', quantity: 125, unit: 'g', expiry_date: '2026-02-12', owner: 'mari' },
  { id: 9, name: 'Pasta', icon: '🍝', category: 'dispensa', quantity: 2, unit: 'kg', expiry_date: '2027-06-01', owner: 'shared' },
  { id: 10, name: 'Riso', icon: '🍚', category: 'dispensa', quantity: 1, unit: 'kg', expiry_date: '2027-03-01', owner: 'shared' },
  { id: 11, name: 'Olio', icon: '🫒', category: 'dispensa', quantity: 750, unit: 'ml', expiry_date: '2027-01-01', owner: 'shared' },
  { id: 12, name: 'Tonno', icon: '🐟', category: 'dispensa', quantity: 3, unit: 'lattine', expiry_date: '2027-12-01', owner: 'mari' },
];

const initialShoppingList = [
  { id: 101, name: 'Detersivo', icon: '🧴', quantity: 1, unit: 'pz', department: 'casa', owners: ['mari', 'gio'], is_checked: false },
  { id: 102, name: 'Banane', icon: '🍌', quantity: 6, unit: 'pz', department: 'ortofrutta', owners: ['pile'], is_checked: false },
];

const initialRecipes = [
  { id: 'r1', name: 'Pasta al Pesto', icon: '🍝', prepTime: 15, servings: 2, ingredients: [{name: 'Pasta', qty: 200, unit: 'g'}, {name: 'Basilico', qty: 50, unit: 'g'}] },
];

const initialMeals = [
  { id: 1, day: 0, type: 'pranzo', name: 'Pasta al pesto', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio', 'Pile'], servings: 3 },
  { id: 2, day: 0, type: 'cena', name: 'Carbonara', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio'], servings: 2 },
  { id: 3, day: 1, type: 'pranzo', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 4, day: 1, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 5, day: 2, type: 'pranzo', name: 'Insalatona', icon: '🥗', chef: 'Gio', participants: ['Gio', 'Pile', 'Mari'], servings: 3 },
  { id: 6, day: 2, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 7, day: 3, type: 'pranzo', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 8, day: 3, type: 'cena', name: 'Pizza fatta in casa', icon: '🍕', chef: 'Pile', participants: ['Mari', 'Gio', 'Pile'], servings: 3 },
];

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [shoppingList, setShoppingList] = useState(initialShoppingList);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [meals, setMeals] = useState(initialMeals);

  // --- LOGICA CONVERSIONE ---
  const convertToBaseUnit = (qty, unit) => {
    const q = parseFloat(qty);
    if (isNaN(q)) return 0;
    const u = unit?.toLowerCase() || '';
    if (u === 'kg') return q * 1000;
    if (u === 'l') return q * 1000;
    return q;
  };

  const areUnitsCompatible = (u1, u2) => {
    const u1Norm = u1?.toLowerCase() || '';
    const u2Norm = u2?.toLowerCase() || '';
    const mass = ['g', 'kg'];
    const volume = ['ml', 'l'];
    
    if (u1Norm === u2Norm) return true;
    if (mass.includes(u1Norm) && mass.includes(u2Norm)) return true;
    if (volume.includes(u1Norm) && volume.includes(u2Norm)) return true;
    return false;
  };

  const consumeIngredients = (ingredients) => {
    let consumedCount = 0;
    setProducts(currentProducts => {
      const newProducts = [...currentProducts];
      ingredients.forEach(ing => {
        const index = newProducts.findIndex(p => p.name.toLowerCase().includes(ing.name.toLowerCase()));
        if (index !== -1) {
          const product = newProducts[index];
          const recipeQty = parseFloat(ing.qty) || 0;
          let qtyToConsume = recipeQty;

          if (product.unit !== ing.unit && areUnitsCompatible(product.unit, ing.unit)) {
             const productBase = convertToBaseUnit(product.quantity, product.unit);
             const recipeBase = convertToBaseUnit(recipeQty, ing.unit);
             qtyToConsume = recipeBase / (product.unit === 'kg' || product.unit === 'L' ? 1000 : 1);
          }

          if (product.quantity <= qtyToConsume) {
             newProducts.splice(index, 1);
          } else {
             newProducts[index] = { ...product, quantity: parseFloat((product.quantity - qtyToConsume).toFixed(2)) };
          }
          consumedCount++;
        }
      });
      return newProducts;
    });
    return consumedCount;
  };

  // --- UPDATE CALENDARIO ---
  const updateMealInCalendar = (slot, newData) => {
    setMeals(prev => prev.map(m => {
        if (m.day === slot.day && m.type === slot.type) {
            return { ...m, isEmpty: false, ...newData };
        }
        return m;
    }));
  };

  const updateProduct = (id, qty) => setProducts(p => p.map(x => x.id === id ? { ...x, quantity: qty } : x));
  const removeProduct = (id) => setProducts(p => p.filter(x => x.id !== id));
  const addProducts = (newP) => setProducts(prev => [...prev, ...newP.map((p, i) => ({...p, id: Date.now()+i, category: 'frigo', expiry_date: '2026-06-01'}))]);
  const addRecipe = (newR) => setRecipes(prev => [...prev, { ...newR, id: Date.now() }]);
  const addToShoppingList = (name) => setShoppingList(prev => [...prev, { id: Date.now(), name, icon: '🛒', quantity: 1, unit: 'pz', owners: ['mari'], is_checked: false }]);

  const expiringProducts = useMemo(() => {
    return products.filter(p => p.expiry_date && getDaysUntilExpiry(p.expiry_date) <= 3).sort((a,b) => new Date(a.expiry_date) - new Date(b.expiry_date));
  }, [products]);

  const value = {
    products, shoppingList, setShoppingList, recipes, 
    meals, updateMealInCalendar,
    updateProduct, removeProduct, addProducts, addRecipe, addToShoppingList, consumeIngredients, 
    expiringProducts, getDaysUntilExpiry, convertToBaseUnit, areUnitsCompatible
  };

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within a ProductsProvider');
  return context;
}