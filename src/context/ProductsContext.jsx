import React, { createContext, useContext, useState, useMemo } from 'react';
import { getDaysUntilExpiry } from '../utils/products'; 

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
  { 
    id: 1, day: 0, type: 'pranzo', name: 'Pasta al pesto', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio', 'Pile'], servings: 3,
    ingredients: [ { name: 'Pasta', qty: 300, unit: 'g' }, { name: 'Basilico', qty: 50, unit: 'g' }, { name: 'Olio', qty: 30, unit: 'ml' }, { name: 'Parmigiano', qty: 50, unit: 'g' } ]
  },
  { 
    id: 2, day: 0, type: 'cena', name: 'Carbonara', icon: '🍝', chef: 'Mari', participants: ['Mari', 'Gio'], servings: 2,
    ingredients: [ { name: 'Pasta', qty: 200, unit: 'g' }, { name: 'Uova', qty: 3, unit: 'pz' }, { name: 'Guanciale', qty: 100, unit: 'g' }, { name: 'Pepe', qty: 5, unit: 'g' } ]
  },
  { id: 3, day: 1, type: 'pranzo', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 4, day: 1, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { 
    id: 5, day: 2, type: 'pranzo', name: 'Insalatona', icon: '🥗', chef: 'Gio', participants: ['Gio', 'Pile', 'Mari'], servings: 3,
    ingredients: [ { name: 'Lattuga', qty: 1, unit: 'cespo' }, { name: 'Pomodori', qty: 300, unit: 'g' }, { name: 'Mozzarella', qty: 250, unit: 'g' }, { name: 'Tonno', qty: 2, unit: 'scatolette' }, { name: 'Mais', qty: 150, unit: 'g' } ] 
  },
  { id: 6, day: 2, type: 'cena', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { id: 7, day: 3, type: 'pranzo', name: null, icon: null, chef: null, participants: [], servings: 0, isEmpty: true },
  { 
    id: 8, day: 3, type: 'cena', name: 'Pizza fatta in casa', icon: '🍕', chef: 'Pile', participants: ['Mari', 'Gio', 'Pile'], servings: 3,
    ingredients: [ { name: 'Farina', qty: 500, unit: 'g' }, { name: 'Lievito', qty: 1, unit: 'cubetto' }, { name: 'Passata di pomodoro', qty: 400, unit: 'g' }, { name: 'Mozzarella', qty: 400, unit: 'g' }, { name: 'Olio', qty: 20, unit: 'ml' } ]
  },
];

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [shoppingList, setShoppingList] = useState(initialShoppingList);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [meals, setMeals] = useState(initialMeals);

  // --- LOGICHE CONVERSIONE E CONSUMO ---
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

  // FIX 1: Funzione per controllare la disponibilità convertendo le unità
  const checkIngredientAvailability = (ingName, requiredQty, requiredUnit) => {
    const product = products.find(p => p.name.toLowerCase().includes(ingName.toLowerCase()));
    
    if (!product) return { status: 'buy', productOwner: null }; 

    // Se le unità non sono le stesse (es. kg vs g), convertiamo entrambi alla base
    let availableQty = parseFloat(product.quantity);
    let neededQty = parseFloat(requiredQty);

    if (product.unit !== requiredUnit && areUnitsCompatible(product.unit, requiredUnit)) {
        availableQty = convertToBaseUnit(product.quantity, product.unit);
        neededQty = convertToBaseUnit(requiredQty, requiredUnit);
    }

    if (availableQty < neededQty) return { status: 'buy', productOwner: product.owner }; 
    
    if (product.owner !== 'mari' && product.owner !== 'shared') {
        return { status: 'ask', productOwner: product.owner };
    }

    return { status: 'ok', productOwner: product.owner }; 
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

  const updateMealInCalendar = (slot, newData) => {
    setMeals(prev => prev.map(m => {
        if (m.day === slot.day && m.type === slot.type) {
            return { ...m, isEmpty: false, ...newData };
        }
        return m;
    }));
  };
  
  const removeMealFromCalendar = (slot) => {
    setMeals(prev => prev.map(m => {
        if (m.day === slot.day && m.type === slot.type) {
            return { 
                ...m, 
                name: null, icon: null, chef: null, participants: [], 
                servings: 0, isEmpty: true, ingredients: [] 
            };
        }
        return m;
    }));
  };

  const addRecipe = (newRecipe) => {
    setRecipes(prev => [...prev, { ...newRecipe, id: `r${Date.now()}` }]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const removeProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addProducts = (newProducts) => {
    const productsToAdd = Array.isArray(newProducts) ? newProducts : [newProducts];
    const formattedProducts = productsToAdd.map(p => ({
        id: Date.now() + Math.random(),
        name: p.name,
        icon: p.icon || '📦',
        category: p.category || 'dispensa',
        quantity: parseFloat(p.quantity) || 1,
        unit: p.unit || 'pz',
        expiry_date: p.expiry_date || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        owner: p.owner || 'shared'
    }));
    
    setProducts(prev => [...prev, ...formattedProducts]);
  };

  const addToShoppingList = (items) => {
    const itemsToAdd = Array.isArray(items) ? items : [items];
    const formattedItems = itemsToAdd.map(item => ({
        id: Date.now() + Math.random(),
        name: item.name,
        icon: item.icon || '🛒',
        quantity: item.qty || 1,
        unit: item.unit || 'pz',
        department: 'dispensa',
        // FIX 3: Usa gli owner passati (se ci sono), altrimenti shared
        owners: item.owners && item.owners.length > 0 ? item.owners : ['shared'],
        is_checked: false
    }));
    setShoppingList(prev => [...prev, ...formattedItems]);
  };

  const restoreData = (prevProducts, prevShoppingList) => {
    if (prevProducts) setProducts(prevProducts);
    if (prevShoppingList) setShoppingList(prevShoppingList);
  };

  const value = {
    products,
    shoppingList,
    setShoppingList,
    recipes,
    meals,
    addRecipe,
    updateProduct,
    removeProduct,
    addProducts,
    addToShoppingList,
    consumeIngredients,
    updateMealInCalendar,
    removeMealFromCalendar,
    checkIngredientAvailability, // Esposto per i modali
    restoreData,
    expiringProducts: useMemo(() => {
        return products
          .filter(p => getDaysUntilExpiry(p.expiry_date) <= 3)
          .sort((a, b) => getDaysUntilExpiry(a.expiry_date) - getDaysUntilExpiry(b.expiry_date));
    }, [products])
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export const useProducts = () => useContext(ProductsContext);