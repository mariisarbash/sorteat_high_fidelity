import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp,
  Trash2,
  Check,
  Filter,
  CheckCheck,
  Circle,
  X 
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import AvatarStack from '../components/spesa/AvatarStack';
import OwnerSelector, { ROOMMATES } from '../components/spesa/OwnerSelector';
import ShoppingItemDetail from '../components/spesa/ShoppingItemDetail';
import DeleteConfirmModal from '../components/spesa/DeleteConfirmModal';
import CheckoutModal from '../components/spesa/CheckoutModal';
import { useProducts } from '../context/ProductsContext'; // IMPORT CONTEXT

const departments = [
  { id: 'ortofrutta', name: 'Ortofrutta', icon: '🥗' },
  { id: 'freschi', name: 'Freschi', icon: '🧊' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
];

export default function Spesa() {
  // FIX: Leggiamo la lista dal context globale, non locale!
  const { shoppingList, setShoppingList, addProducts } = useProducts(); 
  
  const [filterOwner, setFilterOwner] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDepartments, setExpandedDepartments] = useState(
    departments.reduce((acc, dept) => ({ ...acc, [dept.id]: true }), {})
  );
  
  // Modal states
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filtra items
  const filteredItems = useMemo(() => {
    if (!filterOwner) return shoppingList;
    if (filterOwner === 'shared') {
      return shoppingList.filter(item => 
        item.owners.length === ROOMMATES.length && 
        ROOMMATES.every(r => item.owners.includes(r.id))
      );
    }
    return shoppingList.filter(item => item.owners.includes(filterOwner));
  }, [shoppingList, filterOwner]);

  const allChecked = useMemo(() => {
    return filteredItems.length > 0 && filteredItems.every(item => item.is_checked);
  }, [filteredItems]);

  const toggleAllItems = () => {
    const filteredIds = filteredItems.map(item => item.id);
    setShoppingList(prev => prev.map(item => 
      filteredIds.includes(item.id) 
        ? { ...item, is_checked: !allChecked }
        : item
    ));
  };

  const itemsByDepartment = useMemo(() => {
    // Gestione elementi senza dipartimento (es. aggiunti da ricetta)
    const normalizedItems = filteredItems.map(i => ({
        ...i, 
        department: departments.find(d => d.id === i.department) ? i.department : 'dispensa'
    }));

    return departments.map(dept => ({
      ...dept,
      items: normalizedItems.filter(item => item.department === dept.id && !item.is_checked),
      checkedItems: normalizedItems.filter(item => item.department === dept.id && item.is_checked),
    })).filter(dept => dept.items.length > 0 || dept.checkedItems.length > 0);
  }, [filteredItems]);

  const checkedItems = useMemo(() => {
    return shoppingList.filter(i => i.is_checked);
  }, [shoppingList]);

  const toggleCheck = (itemId) => {
    setShoppingList(prev => prev.map(item => 
      item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
    ));
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepartments(prev => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const handleSaveItem = (savedItem) => {
    if (shoppingList.find(i => i.id === savedItem.id)) {
      setShoppingList(prev => prev.map(item => 
        item.id === savedItem.id ? savedItem : item
      ));
    } else {
      setShoppingList(prev => [...prev, savedItem]);
    }
  };

  const handleDeleteItem = () => {
    if (deleteItem) {
      setShoppingList(prev => prev.filter(item => item.id !== deleteItem.id));
    }
  };

  const handleCheckout = (productsToAdd) => {
    const checkedIds = checkedItems.map(i => i.id);
    // Rimuovi dalla spesa
    setShoppingList(prev => prev.filter(item => !checkedIds.includes(item.id)));
    // Aggiungi all'inventario
    addProducts(productsToAdd);
    toast.success(`${productsToAdd.length} prodotti aggiunti all'inventario!`);
  };

  // Componente Item
  const ShoppingItem = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all border ${
        item.is_checked 
          ? 'bg-[#F2F0E9]/50 border-transparent opacity-60' 
          : 'bg-white border-transparent shadow-sm'
      }`}
    >
      <button
        onClick={() => toggleCheck(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          item.is_checked 
            ? 'bg-[#3A5A40] border-[#3A5A40]' 
            : 'border-gray-300 hover:border-[#3A5A40]'
        }`}
      >
        {item.is_checked && <Check className="w-3.5 h-3.5 text-white" />}
      </button>

      <div 
        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
        onClick={() => setEditingItem(item)}
      >
        <span className={`text-2xl ${item.is_checked ? 'grayscale' : ''}`}>
          {item.icon || '🛒'}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-[15px] ${
            item.is_checked ? 'text-gray-500 line-through' : 'text-[#1A1A1A]'
          }`}>
            {item.name}
          </p>
          <p className="text-xs text-[#666666]">
            {item.quantity} {item.unit}
          </p>
        </div>
      </div>

      <div className="shrink-0">
         <AvatarStack owners={item.owners} size="xs" />
      </div>

      {!item.is_checked && (
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={() => setDeleteItem(item)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className={`min-h-screen bg-[#F7F6F3] transition-all ${checkedItems.length > 0 ? 'pb-40' : 'pb-24'}`}>
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F7F6F3]/95 backdrop-blur-sm px-5 pt-12 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
             <h1 className="text-3xl font-bold text-[#1A1A1A]">Spesa</h1>
             <p className="text-[#666666] text-sm mt-1">
                {shoppingList.length === 0 ? 'Lista vuota' : `${shoppingList.length} prodotti in lista`}
             </p>
          </div>

          <div className="flex items-center gap-2">
            {filteredItems.length > 0 && (
              <button
                onClick={toggleAllItems}
                className={`h-10 px-4 rounded-full flex items-center justify-center transition-all text-xs font-bold tracking-wide active:scale-95 ${
                  allChecked 
                    ? 'bg-gray-200 text-gray-600' 
                    : 'bg-[#3A5A40] text-white shadow-md shadow-[#3A5A40]/20'
                }`}
              >
                {allChecked ? "Deseleziona" : "Seleziona tutto"}
              </button>
            )}
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                showFilters || filterOwner 
                  ? 'bg-[#3A5A40] text-white border-transparent' 
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {filterOwner ? <div className="w-2 h-2 bg-white rounded-full absolute top-2 right-2" /> : null}
              <Filter className="w-5 h-5" />
            </button>

             <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Area */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4"
            >
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setFilterOwner(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                    !filterOwner 
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setFilterOwner('shared')}
                  className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all border ${
                    filterOwner === 'shared' 
                      ? 'bg-[#A3B18A] border-[#A3B18A] text-white' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  🏠
                </button>
                {ROOMMATES.map((roommate) => (
                  <button
                    key={roommate.id}
                    onClick={() => setFilterOwner(roommate.id)}
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${
                      filterOwner === roommate.id 
                        ? 'border-[#3A5A40] scale-110' 
                        : 'border-transparent bg-white'
                    }`}
                    style={{ 
                        backgroundColor: filterOwner === roommate.id ? 'white' : 'white',
                        color: filterOwner === roommate.id ? '#1A1A1A' : '#666'
                    }}
                  >
                     <div className={`w-full h-full rounded-full flex items-center justify-center text-white ${roommate.color}`}>
                        {roommate.initial}
                     </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="px-5 space-y-6 mt-2">
        {itemsByDepartment.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Nessun prodotto trovato</p>
          </div>
        ) : (
          itemsByDepartment.map((dept) => (
            <div key={dept.id}>
              <div 
                className="flex items-center gap-2 mb-3 px-1 cursor-pointer"
                onClick={() => toggleDepartment(dept.id)}
              >
                  <span className="text-lg">{dept.icon}</span>
                  <h3 className="font-bold text-[#1A1A1A]">{dept.name}</h3>
                  <span className="text-xs text-gray-400 font-medium ml-auto">
                    {dept.items.length + dept.checkedItems.length}
                  </span>
                  {expandedDepartments[dept.id] ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
              </div>

              <AnimatePresence>
                {expandedDepartments[dept.id] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                      {dept.items.map(item => <ShoppingItem key={item.id} item={item} />)}
                      {dept.checkedItems.length > 0 && (
                          <>
                            {dept.items.length > 0 && <div className="h-px bg-gray-200/50 mx-4 my-2" />}
                            {dept.checkedItems.map(item => <ShoppingItem key={item.id} item={item} />)}
                          </>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Checkout Bar */}
      <AnimatePresence>
        {checkedItems.length > 0 && (
          <div className="fixed inset-x-0 bottom-[80px] z-30 pointer-events-none px-5">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="pointer-events-auto w-full max-w-md mx-auto bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nel carrello</span>
                    <span className="text-lg font-bold text-[#3A5A40] flex items-center gap-2">
                        {checkedItems.length} prodotti
                    </span>
                </div>

                <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#3A5A40] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#3A5A40]/20 active:scale-95 transition-transform flex items-center gap-2 text-sm"
                >
                    Concludi spesa
                    <ShoppingCart className="w-4 h-4" />
                </button>
              </motion.div>
          </div>
        )}
      </AnimatePresence>

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