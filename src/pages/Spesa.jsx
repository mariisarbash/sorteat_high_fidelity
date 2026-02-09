import React, { useState } from 'react';
import { Plus, ShoppingCart, AlertTriangle, Check, Trash2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';

const mockShoppingList = [
  // Ortofrutta
  { id: 1, name: 'Pomodori', icon: '🍅', quantity: 500, unit: 'g', department: 'ortofrutta', added_by: 'Mari', is_checked: false },
  { id: 2, name: 'Banane', icon: '🍌', quantity: 1, unit: 'kg', department: 'ortofrutta', added_by: 'Gio', is_checked: false },
  { id: 3, name: 'Insalata', icon: '🥬', quantity: 1, unit: 'cespo', department: 'ortofrutta', added_by: 'Mari', is_checked: true },
  
  // Freschi
  { id: 4, name: 'Mozzarella', icon: '🧀', quantity: 250, unit: 'g', department: 'freschi', added_by: 'Pile', is_checked: false },
  { id: 5, name: 'Prosciutto', icon: '🥓', quantity: 150, unit: 'g', department: 'freschi', added_by: 'Mari', is_checked: false },
  { id: 6, name: 'Pane', icon: '🍞', quantity: 1, unit: 'pz', department: 'freschi', added_by: 'Mari', is_checked: false, has_warning: true },
  
  // Dispensa
  { id: 7, name: 'Pasta', icon: '🍝', quantity: 500, unit: 'g', department: 'dispensa', added_by: 'Mari', is_checked: false },
  { id: 8, name: 'Olio EVO', icon: '🫒', quantity: 1, unit: 'L', department: 'dispensa', added_by: 'Shared', is_checked: false },
  
  // Casa
  { id: 9, name: 'Detersivo', icon: '🧴', quantity: 1, unit: 'pz', department: 'casa', added_by: 'Pile', is_checked: false },
];

const departments = [
  { id: 'ortofrutta', name: 'Ortofrutta', icon: '🥗' },
  { id: 'freschi', name: 'Freschi', icon: '🧊' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
];

export default function Spesa() {
  const [items, setItems] = useState(mockShoppingList);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [liveShopperActive, setLiveShopperActive] = useState(true);

  const handleToggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, is_checked: !item.is_checked } : item
    ));
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    // Check if item already in inventory (mock check)
    const existingItems = ['Pasta', 'Riso', 'Olio', 'Sale'];
    if (existingItems.some(item => item.toLowerCase() === newItemName.toLowerCase())) {
      toast('Aspetta!', {
        description: `In dispensa risultano già 2 pacchi di ${newItemName}. Aggiungo lo stesso?`,
        icon: '⚠️',
        action: {
          label: 'Aggiungi',
          onClick: () => addItemToList()
        }
      });
      return;
    }
    
    addItemToList();
  };

  const addItemToList = () => {
    const newItem = {
      id: Date.now(),
      name: newItemName,
      icon: '📦',
      quantity: 1,
      unit: 'pz',
      department: 'dispensa',
      added_by: 'Mari',
      is_checked: false
    };
    setItems([...items, newItem]);
    setNewItemName('');
    setShowAddModal(false);
    toast.success(`${newItemName} aggiunto alla lista!`);
  };

  const handleShoppingMode = () => {
    toast('Funzionalità in arrivo!', {
      icon: '🚀',
      description: 'Presto potrai attivare la modalità shopping'
    });
  };

  const getItemsByDepartment = (departmentId) => {
    return items.filter(item => item.department === departmentId);
  };

  const checkedCount = items.filter(i => i.is_checked).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen pb-4">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lista della spesa</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-10 h-10 bg-[#3A5A40] rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Live Ticker */}
        {liveShopperActive && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-[#3A5A40] to-[#4a6b50] rounded-2xl p-4 mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Gio è al supermercato!</p>
                <p className="text-white/80 text-sm">Vuoi aggiungere qualcosa?</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#666666]">Progresso</span>
            <span className="text-sm font-semibold text-[#1A1A1A]">{checkedCount}/{totalCount}</span>
          </div>
          <div className="h-2 bg-[#F2F0E9] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
              className="h-full bg-[#3A5A40] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Shopping Mode Button */}
      <div className="px-5 mb-4">
        <button
          onClick={handleShoppingMode}
          className="w-full py-3 bg-white rounded-2xl card-shadow flex items-center justify-center gap-2 text-[#3A5A40] font-semibold active:scale-[0.98] transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
          Avvia Shopping Mode
        </button>
      </div>

      {/* Departments */}
      <div className="px-5 space-y-4">
        {departments.map(dept => {
          const deptItems = getItemsByDepartment(dept.id);
          if (deptItems.length === 0) return null;

          return (
            <div key={dept.id} className="bg-white rounded-3xl p-4 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{dept.icon}</span>
                <h3 className="font-semibold text-[#1A1A1A]">{dept.name}</h3>
                <span className="text-xs text-[#666666] ml-auto">
                  {deptItems.filter(i => i.is_checked).length}/{deptItems.length}
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {deptItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        item.is_checked ? 'bg-[#A3B18A]/20' : 'bg-[#F2F0E9]'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.is_checked 
                            ? 'bg-[#3A5A40] border-[#3A5A40]' 
                            : 'border-gray-300'
                        }`}
                      >
                        {item.is_checked && <Check className="w-4 h-4 text-white" />}
                      </button>

                      <span className="text-xl">{item.icon}</span>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${item.is_checked ? 'line-through text-gray-400' : 'text-[#1A1A1A]'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {item.quantity} {item.unit} • {item.added_by}
                        </p>
                      </div>

                      {item.has_warning && (
                        <div className="w-6 h-6 rounded-full bg-[#D4A373]/20 flex items-center justify-center" title="Contiene glutine">
                          <AlertTriangle className="w-3 h-3 text-[#D4A373]" />
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-w-md mx-auto"
            >
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Aggiungi prodotto</h2>
              
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Nome prodotto..."
                className="w-full px-4 py-3 bg-[#F2F0E9] rounded-2xl text-[#1A1A1A] placeholder:text-gray-400 mb-4"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-2xl font-semibold text-[#1A1A1A]"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 py-3 bg-[#3A5A40] rounded-2xl font-semibold text-white"
                >
                  Aggiungi
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}