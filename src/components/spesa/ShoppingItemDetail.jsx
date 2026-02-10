import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';
import { OwnerSelector } from './OwnerSelector';

const departments = [
  { id: 'ortofrutta', name: 'Ortofrutta', icon: '🥗' },
  { id: 'freschi', name: 'Freschi', icon: '🧊' },
  { id: 'dispensa', name: 'Dispensa', icon: '🗄️' },
  { id: 'casa', name: 'Casa', icon: '🏠' },
];

const units = ['g', 'kg', 'ml', 'L', 'pz', 'confezione'];

const commonEmojis = ['🍅', '🍌', '🥬', '🧀', '🥓', '🍞', '🍝', '🫒', '🧴', '🥛', '🍎', '🥚', '🍗', '📦'];

export default function ShoppingItemDetail({ item, isOpen, onClose, onSave, isNewItem = false }) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '📦',
    quantity: 1,
    unit: 'pz',
    department: 'dispensa',
    owners: ['mari'],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        icon: item.icon || '📦',
        quantity: item.quantity || 1,
        unit: item.unit || 'pz',
        department: item.department || 'dispensa',
        owners: item.owners || ['mari'],
      });
    } else {
      setFormData({
        name: '',
        icon: '📦',
        quantity: 1,
        unit: 'pz',
        department: 'dispensa',
        owners: ['mari'],
      });
    }
  }, [item, isOpen]);

  const handleSave = () => {
    if (!formData.name.trim()) return;
    onSave({
      ...item,
      ...formData,
      id: item?.id || Date.now(),
      is_checked: item?.is_checked || false,
    });
    onClose();
  };

  const adjustQuantity = (delta) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto max-w-md mx-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">
            {isNewItem ? 'Aggiungi prodotto' : 'Modifica prodotto'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-5">
          {/* Nome prodotto */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Es. Pomodori"
              className="w-full px-4 py-3 bg-[#F2F0E9] rounded-2xl text-[#1A1A1A] placeholder:text-gray-400"
              autoFocus={isNewItem}
            />
          </div>

          {/* Emoji selector */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Icona</label>
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    formData.icon === emoji 
                      ? 'bg-[#3A5A40] ring-2 ring-[#3A5A40] ring-offset-2' 
                      : 'bg-[#F2F0E9]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Quantità e Unità */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-[#666666] mb-2 block">Quantità</label>
              <div className="flex items-center gap-3 bg-[#F2F0E9] rounded-2xl p-2">
                <button
                  onClick={() => adjustQuantity(-1)}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Minus className="w-4 h-4 text-[#1A1A1A]" />
                </button>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="flex-1 text-center bg-transparent font-semibold text-[#1A1A1A] text-lg"
                />
                <button
                  onClick={() => adjustQuantity(1)}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4 text-[#1A1A1A]" />
                </button>
              </div>
            </div>

            <div className="w-32">
              <label className="text-sm font-medium text-[#666666] mb-2 block">Unità</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 bg-[#F2F0E9] rounded-2xl text-[#1A1A1A] h-[58px]"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reparto */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Reparto</label>
            <div className="grid grid-cols-4 gap-2">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setFormData(prev => ({ ...prev, department: dept.id }))}
                  className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    formData.department === dept.id
                      ? 'bg-[#3A5A40] text-white'
                      : 'bg-[#F2F0E9] text-[#1A1A1A]'
                  }`}
                >
                  <span className="text-lg">{dept.icon}</span>
                  <span className="text-xs font-medium">{dept.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Proprietari */}
          <div>
            <label className="text-sm font-medium text-[#666666] mb-2 block">Di chi è?</label>
            <OwnerSelector
              selectedOwners={formData.owners}
              onChange={(owners) => setFormData(prev => ({ ...prev, owners }))}
              size="md"
            />
          </div>

          {/* Bottoni azione */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-100 rounded-2xl font-semibold text-[#1A1A1A] active:scale-[0.98] transition-transform"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name.trim()}
              className={`flex-1 py-4 rounded-2xl font-semibold text-white active:scale-[0.98] transition-transform ${
                formData.name.trim() ? 'bg-[#3A5A40]' : 'bg-gray-300'
              }`}
            >
              {isNewItem ? 'Aggiungi' : 'Salva'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
