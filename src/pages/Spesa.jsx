import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Edit3,
  Check,
  Filter
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AvatarStack from '../components/spesa/AvatarStack';
import OwnerSelector, { ROOMMATES } from '../components/spesa/OwnerSelector';
import ShoppingItemDetail from '../components/spesa/ShoppingItemDetail';
import DeleteConfirmModal from '../components/spesa/DeleteConfirmModal';
import CheckoutModal from '../components/spesa/CheckoutModal';
import { useProducts } from '../context/ProductsContext';

// Dati mock iniziali
const initialItems = [
  { id: 1, name: 'Pomodori', icon: '🍅', quantity: 500, unit: 'g', department: 'ortofrutta', owners: ['mari', 'gio', 'pile'], is_checked: false },
  { id: 2, name: 'Mozzarella', icon: '🧀', quantity: 2, unit: 'pz', department: 'freschi', owners: ['mari'], is_checked: false },
  { id: 3, name: 'Pasta', icon: '🍝', quantity: 1, unit: 'kg', department: 'dispensa', owners: ['mari', 'gio', 'pile'], is_checked: true },
  { id: 4, name: 'Latte', icon: '🥛', quantity: 1, unit: 'L', department: 'freschi', owners: ['gio'], is_checked: false },
  { id: 5, name: 'Banane', icon: '🍌', quantity: 6, unit: 'pz', department: 'ortofrutta', owners: ['pile'], is_checked: false },
  { id: 6, name: 'Detersivo', icon: '🧴', quantity: 1, unit: 'pz', department: 'casa', owners: ['mari', 'gio', 'pile'], is_checked: false },
  { id: 7, name: 'Pane', icon: '🍞', quantity: 1, unit: 'pz', department: 'freschi', owners: ['mari', 'gio'], is_checked: true },
];

const departments = [
  { id: 'ortofrutta', name: 'Ortofrutta', icon: '🥗' },
  { id: 'freschi', name: 'Freschi', icon: '🧊' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
];

export default function Spesa() {
  const [items, setItems] = useState(initialItems);
  const [filterOwner, setFilterOwner] = useState(null); // null = tutti
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState(
    departments.reduce((acc, dept) => ({ ...acc, [dept.id]: true }), {})
  );
  
  // Modal states
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Usa il contesto dei prodotti per aggiungere all'inventario
  const { addProducts } = useProducts();

  // Filtra items per proprietario
  const filteredItems = useMemo(() => {
    if (!filterOwner) return items;
    // 'shared' = prodotti condivisi tra TUTTI i coinquilini
    if (filterOwner === 'shared') {
      return items.filter(item => 
        item.owners.length === ROOMMATES.length && 
        ROOMMATES.every(r => item.owners.includes(r.id))
      );
    }
    return items.filter(item => item.owners.includes(filterOwner));
  }, [items, filterOwner]);

  // Raggruppa per reparto
  const itemsByDepartment = useMemo(() => {
    return departments.map(dept => ({
      ...dept,
      items: filteredItems.filter(item => item.department === dept.id && !item.is_checked),
      checkedItems: filteredItems.filter(item => item.department === dept.id && item.is_checked),
    })).filter(dept => dept.items.length > 0 || dept.checkedItems.length > 0);
  }, [filteredItems]);

  // Statistiche
  const stats = useMemo(() => {
    const unchecked = filteredItems.filter(i => !i.is_checked);
    const checked = filteredItems.filter(i => i.is_checked);
    return { unchecked: unchecked.length, checked: checked.length, total: filteredItems.length };
  }, [filteredItems]);

  const checkedItems = useMemo(() => {
    return items.filter(i => i.is_checked);
  }, [items]);

  // Handlers
  const toggleCheck = (itemId) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
    ));
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepartments(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const handleSaveItem = (savedItem) => {
    if (items.find(i => i.id === savedItem.id)) {
      setItems(prev => prev.map(item => 
        item.id === savedItem.id ? savedItem : item
      ));
    } else {
      setItems(prev => [...prev, savedItem]);
    }
  };

  const handleDeleteItem = () => {
    if (deleteItem) {
      setItems(prev => prev.filter(item => item.id !== deleteItem.id));
    }
  };

  const handleCheckout = (productsToAdd) => {
    // Rimuovi i prodotti dalla lista della spesa
    const checkedIds = checkedItems.map(i => i.id);
    setItems(prev => prev.filter(item => !checkedIds.includes(item.id)));
    
    // Aggiungi i prodotti all'inventario
    addProducts(productsToAdd);
    
    // Mostra conferma
    toast.success(`${productsToAdd.length} prodotti aggiunti all'inventario!`, {
      description: 'Puoi vederli nella sezione Inventario'
    });
  };

  // Componente Item
  const ShoppingItem = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
        item.is_checked ? 'bg-[#3A5A40]/5' : 'bg-white'
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleCheck(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.is_checked 
            ? 'bg-[#3A5A40] border-[#3A5A40]' 
            : 'border-gray-300'
        }`}
      >
        {item.is_checked && <Check className="w-3.5 h-3.5 text-white" />}
      </button>

      {/* Icon & Info */}
      <div 
        className="flex-1 flex items-center gap-3 min-w-0"
        onClick={() => setEditingItem(item)}
      >
        <span className={`text-xl ${item.is_checked ? 'grayscale opacity-50' : ''}`}>
          {item.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${
            item.is_checked ? 'text-gray-400 line-through' : 'text-[#1A1A1A]'
          }`}>
            {item.name}
          </p>
          <p className="text-xs text-[#666666]">
            {item.quantity} {item.unit}
          </p>
        </div>
      </div>

      {/* Avatar */}
      <AvatarStack owners={item.owners} size="xs" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditingItem(item)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setDeleteItem(item)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F7F6F3] pb-32">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-[#3A5A40] text-white px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lista della spesa</h1>
          <div className="flex items-center gap-2">
            {/* Add Button - spostato nell'header */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20"
            >
              <Plus className="w-5 h-5" />
            </button>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                showFilters || filterOwner ? 'bg-white/20' : 'bg-white/10'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-white/70 text-xs">Da comprare</p>
            <p className="text-2xl font-bold">{stats.unchecked}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-white/70 text-xs">Nel carrello</p>
            <p className="text-2xl font-bold">{stats.checked}</p>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/70 text-sm mb-2">Filtra per persona</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterOwner(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      !filterOwner 
                        ? 'bg-white text-[#3A5A40]' 
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    Vedi tutto
                  </button>
                  {/* Filtro Condivisi (tutti i coinquilini) */}
                  <button
                    onClick={() => setFilterOwner('shared')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      filterOwner === 'shared' 
                        ? 'bg-[#A3B18A] ring-2 ring-offset-2 ring-offset-[#3A5A40] ring-white' 
                        : 'bg-white/10'
                    }`}
                  >
                    🏠
                  </button>
                  {ROOMMATES.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => setFilterOwner(roommate.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                        filterOwner === roommate.id 
                          ? `${roommate.color} ring-2 ring-offset-2 ring-offset-[#3A5A40] ring-white text-white` 
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {roommate.initial}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {itemsByDepartment.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-[#3A5A40]/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10 text-[#3A5A40]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Lista vuota</h3>
            <p className="text-[#666666]">Aggiungi prodotti alla lista della spesa</p>
          </div>
        ) : (
          itemsByDepartment.map((dept) => (
            <div key={dept.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {/* Department Header */}
              <button
                onClick={() => toggleDepartment(dept.id)}
                className="w-full flex items-center justify-between p-4 bg-[#F2F0E9]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{dept.icon}</span>
                  <span className="font-semibold text-[#1A1A1A]">{dept.name}</span>
                  <span className="text-sm text-[#666666]">
                    ({dept.items.length + dept.checkedItems.length})
                  </span>
                </div>
                {expandedDepartments[dept.id] ? (
                  <ChevronUp className="w-5 h-5 text-[#666666]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#666666]" />
                )}
              </button>

              {/* Items */}
              <AnimatePresence>
                {expandedDepartments[dept.id] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {/* Unchecked items first */}
                      {dept.items.map((item) => (
                        <ShoppingItem key={item.id} item={item} />
                      ))}
                      
                      {/* Checked items */}
                      {dept.checkedItems.length > 0 && dept.items.length > 0 && (
                        <div className="h-px bg-gray-100 my-2" />
                      )}
                      {dept.checkedItems.map((item) => (
                        <ShoppingItem key={item.id} item={item} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Checkout Bar */}
      <AnimatePresence>
        {stats.checked > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-20 left-5 right-5 max-w-md mx-auto z-30"
          >
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 bg-[#3A5A40] rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="font-semibold text-white">
                Concludi spesa ({stats.checked} prodotti)
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {(editingItem || isAddModalOpen) && (
          <ShoppingItemDetail
            item={editingItem}
            isOpen={!!editingItem || isAddModalOpen}
            onClose={() => {
              setEditingItem(null);
              setIsAddModalOpen(false);
            }}
            onSave={handleSaveItem}
            isNewItem={isAddModalOpen}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteItem}
        itemName={deleteItem?.name}
      />

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            checkedItems={checkedItems}
            onConfirm={handleCheckout}
          />
        )}
      </AnimatePresence>
    </div>
  );
}