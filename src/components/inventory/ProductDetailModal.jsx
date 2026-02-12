import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Pencil, 
  Lock, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Camera, 
  Send,
  Check,
  Calendar,
  DollarSign,
  Package,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useWaste } from '@/context/WasteContext';

// Funzione per calcolare i giorni alla scadenza
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Funzione per ottenere il colore della scadenza
const getExpiryColor = (daysLeft) => {
  if (daysLeft === null) return 'text-[#666666]';
  if (daysLeft <= 0) return 'text-red-600';
  if (daysLeft <= 1) return 'text-red-500';
  if (daysLeft <= 2) return 'text-orange-500';
  if (daysLeft <= 3) return 'text-yellow-600';
  return 'text-[#666666]';
};

// Funzione per ottenere il testo della scadenza
const getExpiryText = (daysLeft) => {
  if (daysLeft === null) return 'Nessuna scadenza';
  if (daysLeft < 0) return 'Scaduto';
  if (daysLeft === 0) return 'Scade oggi!';
  if (daysLeft === 1) return 'Scade domani';
  if (daysLeft <= 3) return `Scade tra ${daysLeft} giorni`;
  return `Scade tra ${daysLeft} giorni`;
};

// Mappa nomi proprietari
const ownerNames = {
  mari: 'Mariia',
  gio: 'Gio',
  pile: 'Pile',
  shared: 'Comune'
};

export default function ProductDetailModal({ 
  isOpen, 
  onClose, 
  product, 
  currentUser = 'mari',
  onAddNotification,
  onUpdateProduct,
  onRemoveProduct,
  onAddProduct
}) {
  const { registerWaste } = useWaste();
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(0);

  // update quantity when product changes
  React.useEffect(() => {
    if (product) {
      setQuantity(product.quantity || 0);
    }
  }, [product]);

  const [showAddToShoppingModal, setShowAddToShoppingModal] = useState(false);
  const [shoppingQuantity, setShoppingQuantity] = useState(1);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('un po\'');
  const [isAIScanning, setIsAIScanning] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  
  // Stati per il modal "Consuma"
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [consumeAmount, setConsumeAmount] = useState(1);
  const [consumeAll, setConsumeAll] = useState(false);
  
  // Stato per il modal "Spreco/Rifiuto"
  const [showWasteModal, setShowWasteModal] = useState(false);

  if (!product) return null;

  // Determina lo stato di proprietà
  const isOwner = product.owner === currentUser;
  const isShared = product.owner === 'shared';
  const canEdit = isOwner || isShared;
  const ownerName = ownerNames[product.owner] || product.owner;

  const daysLeft = getDaysUntilExpiry(product.expiry_date);
  const expiryColor = getExpiryColor(daysLeft);

  // Calcola la quantità rimanente per il modal consuma
  const remainingAfterConsume = consumeAll ? 0 : Math.max(0, quantity - consumeAmount);

  // Handler per aprire il modal consuma
  const handleOpenConsumeModal = () => {
    setConsumeAmount(1);
    setConsumeAll(false);
    setShowConsumeModal(true);
  };


  // Handler per confermare il consumo
  const handleConfirmConsume = () => {
    const originalQuantity = quantity;
    const newQuantity = consumeAll ? 0 : Math.max(0, quantity - consumeAmount);

    const undoAction = () => {
      if (newQuantity === 0) {
        // Se il prodotto è stato rimosso, riaggiungilo
        if (onAddProduct) {
          onAddProduct(product);
        }
      } else {
        // Altrimenti, ripristina la quantità originale
        if (onUpdateProduct) {
          onUpdateProduct(product.id, originalQuantity);
        }
        setQuantity(originalQuantity);
      }
      toast.success(`Azione annullata!`, {
        description: `${product.name} è stato ripristinato.`,
        icon: '↩️'
      });
    };
    
    if (newQuantity === 0) {
      // Rimuovi il prodotto
      if (onRemoveProduct) {
        onRemoveProduct(product.id);
      }
      toast.success(`${product.name} terminato!`, {
        description: 'Prodotto rimosso dall\'inventario',
        icon: '✅',
        action: {
          label: 'Annulla',
          onClick: undoAction
        },
      });
    } else {
      // Aggiorna la quantità
      if (onUpdateProduct) {
        onUpdateProduct(product.id, newQuantity);
      }
      setQuantity(newQuantity);
      toast.success(`${product.name} consumato!`, {
        description: `Rimangono ${newQuantity} ${product.unit}`,
        icon: '✅',
        action: {
          label: 'Annulla',
          onClick: undoAction
        },
      });
    }
    
    setShowConsumeModal(false);
  };

  // Handler per aggiungere alla spesa
  const handleAddToShopping = () => {
    setShowAddToShoppingModal(false);
    toast.success('Aggiunto alla spesa!', {
      description: `${shoppingQuantity} ${product.unit} di ${product.name}`,
      icon: '🛒'
    });
  };

  // Handler per richiesta prodotto
  const handleRequestProduct = () => {
    const notification = {
      id: Date.now(),
      title: `${ownerNames[currentUser]} chiede di usare il tuo ${product.name}`,
      message: `Vorrebbe usare ${requestAmount} del prodotto`,
      type: 'request',
      icon: product.icon || '📦',
      iconBg: 'bg-blue-100',
      relatedUser: product.owner,
      timestamp: new Date().toISOString()
    };
    
    if (onAddNotification) {
      onAddNotification(notification);
    }
    
    setShowRequestModal(false);
    toast.success('Richiesta inviata!', {
      description: `${ownerName} riceverà la tua richiesta`,
      icon: '✉️'
    });
  };

  // Handler AI Mock per aggiornamento quantità
  const handleAIScan = () => {
    setShowAIOverlay(true);
    setIsAIScanning(true);
    
    // Simula scansione AI
    setTimeout(() => {
      setIsAIScanning(false);
      setTimeout(() => {
        setShowAIOverlay(false);
        const newQuantity = Math.round(quantity * 0.5);
        
        // Aggiorna nell'inventario principale
        if (onUpdateProduct) {
          onUpdateProduct(product.id, newQuantity);
        }
        setQuantity(newQuantity);
        
        toast.success('Quantità aggiornata con AI!', {
          description: `${product.name}: rilevato 50% rimanente. Nuova quantità: ${newQuantity} ${product.unit}`,
          icon: '🤖'
        });
      }, 500);
    }, 2500);
  };

  // Handler per confermare lo spreco
  const handleConfirmWaste = () => {
    // Calcola il valore sprecato (usa prezzo se disponibile, altrimenti stima)
    const wastedValue = product.price || 2.50; // Valore stimato di default €2.50
    
    // Registra lo spreco nel contesto (resetta i giorni a 0)
    registerWaste(product.name, wastedValue);
    
    // Rimuovi il prodotto
    if (onRemoveProduct) {
      onRemoveProduct(product.id);
    }
    
    setShowWasteModal(false);
    
    toast('Prodotto spostato nei rifiuti 🗑️', {
      description: `${product.name} - Spreco: €${wastedValue.toFixed(2)}`,
      style: {
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        color: '#92400E'
      }
    });
  };

  const requestAmountOptions = ['Un po\'', 'Metà', 'Tutto'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          
          {/* Modal principale */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 bottom-4 top-auto bg-white z-50 rounded-3xl max-w-md mx-auto overflow-hidden max-h-[85vh]"
          >
            {/* Header con immagine prodotto */}
            <div className="relative bg-[#F2F0E9] pt-6 pb-4 px-5">
              {/* Bottoni header in alto a destra */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {/* Bottone Cestino (solo per prodotti propri/condivisi) */}
                {canEdit && (
                  <button
                    onClick={() => setShowWasteModal(true)}
                    className="w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
                
                {/* Bottone chiudi */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* Badge proprietario per prodotti altrui */}
              {!canEdit && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full">
                  <Lock className="w-3 h-3 text-[#666666]" />
                  <span className="text-xs font-medium text-[#666666]">
                    Prodotto di {ownerName}
                  </span>
                </div>
              )}
              
              {/* Icona/Emoji grande del prodotto */}
              <div className="flex flex-col items-center">
                <div className="text-7xl mb-3">{product.icon || '📦'}</div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">{product.name}</h2>
                  {canEdit && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#3A5A40]" />
                    </button>
                  )}
                </div>
                
                {/* Badge proprietario inline per prodotti propri/condivisi */}
                {canEdit && (
                  <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    isShared ? 'bg-[#A3B18A]/30 text-[#3A5A40]' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isShared ? '🏠 Prodotto comune' : '👤 Prodotto tuo'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Contenuto scrollabile */}
            <div className="overflow-y-auto max-h-[50vh] px-5 py-4">
              {/* Info prodotto */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Quantità */}
                <div className={`bg-[#F2F0E9] rounded-2xl p-4 ${!canEdit ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-[#666666]" />
                    <span className="text-xs text-[#666666]">Quantità</span>
                  </div>
                  <p className="text-lg font-bold text-[#1A1A1A]">
                    {quantity} {product.unit}
                  </p>
                </div>
                
                {/* Scadenza */}
                <div className={`bg-[#F2F0E9] rounded-2xl p-4 ${!canEdit ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#666666]" />
                    <span className="text-xs text-[#666666]">Scadenza</span>
                  </div>
                  <p className={`text-sm font-bold ${expiryColor}`}>
                    {getExpiryText(daysLeft)}
                  </p>
                </div>
                
                {/* Prezzo (se disponibile) */}
                {product.price && (
                  <div className={`bg-[#F2F0E9] rounded-2xl p-4 ${!canEdit ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#666666]" />
                      <span className="text-xs text-[#666666]">Prezzo</span>
                    </div>
                    <p className="text-lg font-bold text-[#1A1A1A]">
                      €{product.price.toFixed(2)}
                    </p>
                  </div>
                )}
                
                {/* Data aggiunta */}
                {product.purchase_date && (
                  <div className={`bg-[#F2F0E9] rounded-2xl p-4 ${!canEdit ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-[#666666]" />
                      <span className="text-xs text-[#666666]">Aggiunto</span>
                    </div>
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {new Date(product.purchase_date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )}
              </div>
              
              {/* STATO A: Azioni per proprietario/prodotto condiviso */}
              {canEdit && (
                <div className="space-y-3">
                  {/* Bottone AI Scan */}
                  <button
                    onClick={handleAIScan}
                    className="w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-[#A3B18A]/20 to-[#3A5A40]/10 border-2 border-dashed border-[#A3B18A] rounded-2xl active:scale-[0.98] transition-transform"
                  >
                    <Camera className="w-5 h-5 text-[#3A5A40]" />
                    <span className="font-medium text-[#3A5A40]">Aggiorna quantità con AI</span>
                  </button>
                  
                  {/* Bottoni azione principali */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleOpenConsumeModal}
                      className="flex items-center justify-center gap-2 py-4 bg-[#D4A373] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                    >
                      <Minus className="w-5 h-5" />
                      <span>Consuma</span>
                    </button>
                    
                    <button
                      onClick={() => setShowAddToShoppingModal(true)}
                      className="flex items-center justify-center gap-2 py-4 bg-[#3A5A40] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Aggiungi a spesa</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* STATO B: Azione per prodotto altrui */}
              {!canEdit && (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-2xl p-4 text-center">
                    <p className="text-sm text-[#666666]">
                      Questo prodotto appartiene a <strong>{ownerName}</strong>. 
                      Puoi chiedere il permesso per usarlo.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-[#3A5A40] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                  >
                    <Send className="w-5 h-5" />
                    <span>Chiedi a {ownerName} di usarlo</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Sub-modal: Conferma Spreco */}
          <AnimatePresence>
            {showWasteModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60]"
                  onClick={() => setShowWasteModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                  onClick={() => setShowWasteModal(false)}
                >
                  <div 
                    className="bg-white rounded-3xl p-5 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center mb-4">
                      <span className="text-5xl">🗑️</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">
                      Peccato!
                    </h3>
                    <p className="text-sm text-[#666666] text-center mb-5">
                      Stai buttando via <strong>{product.name}</strong>?
                    </p>
                    
                    {/* Info spreco */}
                    <div className="bg-orange-50 rounded-2xl p-4 mb-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-700">Quantità sprecata:</span>
                        <span className="font-semibold text-orange-800">{quantity} {product.unit}</span>
                      </div>
                      {product.price && (
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-orange-700">Valore stimato:</span>
                          <span className="font-semibold text-orange-800">€{product.price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowWasteModal(false)}
                        className="py-3 bg-[#F2F0E9] text-[#1A1A1A] font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleConfirmWaste}
                        className="py-3 bg-red-500 text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Conferma
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Sub-modal: Consuma prodotto */}
          <AnimatePresence>
            {showConsumeModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60]"
                  onClick={() => setShowConsumeModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                  onClick={() => setShowConsumeModal(false)}
                >
                  <div 
                    className="bg-white rounded-3xl p-5 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">
                      Quanto ne hai consumato?
                    </h3>
                    <p className="text-sm text-[#666666] text-center mb-5">
                      {product.name} - Disponibile: {quantity} {product.unit}
                    </p>
                    
                    {/* Checkbox "Consumato tutto" */}
                    <label className="flex items-center gap-3 mb-5 p-3 bg-[#F2F0E9] rounded-2xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consumeAll}
                        onChange={(e) => setConsumeAll(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[#3A5A40] focus:ring-[#3A5A40]"
                      />
                      <span className="font-medium text-[#1A1A1A]">Ho consumato tutto</span>
                    </label>
                    
                    {/* Input quantità (disabilitato se "consumato tutto") */}
                    <div className={`transition-opacity ${consumeAll ? 'opacity-40 pointer-events-none' : ''}`}>
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <button
                          onClick={() => setConsumeAmount(Math.max(1, consumeAmount - 1))}
                          disabled={consumeAll}
                          className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <Minus className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={consumeAmount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setConsumeAmount(Math.min(Math.max(0, val), quantity));
                            }}
                            disabled={consumeAll}
                            className="w-20 text-center text-2xl font-bold text-[#1A1A1A] bg-transparent border-b-2 border-[#3A5A40] focus:outline-none"
                          />
                          <span className="text-lg text-[#666666]">{product.unit}</span>
                        </div>
                        
                        <button
                          onClick={() => setConsumeAmount(Math.min(quantity, consumeAmount + 1))}
                          disabled={consumeAll}
                          className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center active:scale-95 transition-transform"
                        >
                          <Plus className="w-5 h-5 text-[#1A1A1A]" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview quantità rimanente */}
                    <div className={`text-center p-3 rounded-2xl mb-5 ${
                      remainingAfterConsume === 0 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-[#A3B18A]/20 text-[#3A5A40]'
                    }`}>
                      <span className="text-sm font-medium">
                        {remainingAfterConsume === 0 
                          ? `⚠️ Il prodotto verrà rimosso dall'inventario`
                          : `Quantità rimanente: ${remainingAfterConsume} ${product.unit}`
                        }
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowConsumeModal(false)}
                        className="py-3 bg-[#F2F0E9] text-[#1A1A1A] font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleConfirmConsume}
                        className="py-3 bg-[#D4A373] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        Conferma
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Sub-modal: Aggiungi alla spesa */}
          <AnimatePresence>
            {showAddToShoppingModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60]"
                  onClick={() => setShowAddToShoppingModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                  onClick={() => setShowAddToShoppingModal(false)}
                >
                  <div 
                    className="bg-white rounded-3xl p-5 max-w-sm w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4 text-center">
                      Quanto ne aggiungo?
                    </h3>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <button
                        onClick={() => setShoppingQuantity(Math.max(1, shoppingQuantity - 1))}
                        className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Minus className="w-5 h-5 text-[#1A1A1A]" />
                      </button>
                      
                      <div className="text-center">
                        <span className="text-3xl font-bold text-[#1A1A1A]">{shoppingQuantity}</span>
                        <span className="text-lg text-[#666666] ml-1">{product.unit}</span>
                      </div>
                      
                      <button
                        onClick={() => setShoppingQuantity(shoppingQuantity + 1)}
                        className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5 text-[#1A1A1A]" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowAddToShoppingModal(false)}
                        className="py-3 bg-[#F2F0E9] text-[#1A1A1A] font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        Annulla
                      </button>
                      <button
                        onClick={handleAddToShopping}
                        className="py-3 bg-[#3A5A40] text-white font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        Conferma
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Sub-modal: Richiesta prodotto */}
          <AnimatePresence>
            {showRequestModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 z-[60]"
                  onClick={() => setShowRequestModal(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="fixed inset-x-4 bottom-24 bg-white z-[60] rounded-3xl p-5 max-w-md mx-auto"
                >
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 text-center">
                    Quanto vorresti usare?
                  </h3>
                  <p className="text-sm text-[#666666] text-center mb-5">
                    {ownerName} riceverà una notifica con la tua richiesta
                  </p>
                  
                  {/* Pillole selezione quantità */}
                  <div className="flex gap-2 mb-6">
                    {requestAmountOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setRequestAmount(option.toLowerCase())}
                        className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all active:scale-95 ${
                          requestAmount === option.toLowerCase()
                            ? 'bg-[#3A5A40] text-white'
                            : 'bg-[#F2F0E9] text-[#1A1A1A]'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="py-3 bg-[#F2F0E9] text-[#1A1A1A] font-semibold rounded-2xl active:scale-[0.98] transition-transform"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleRequestProduct}
                      className="py-3 bg-[#3A5A40] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Send className="w-4 h-4" />
                      Invia richiesta
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {/* Overlay AI Scanning */}
          <AnimatePresence>
            {showAIOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center"
              >
                <div className="relative w-64 h-64 mb-8">
                  {/* Simulazione camera view */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl overflow-hidden flex items-center justify-center">
                    <span className="text-8xl">{product.icon || '📦'}</span>
                  </div>
                  
                  {/* Scanning animation */}
                  {isAIScanning && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-[#A3B18A] shadow-lg shadow-[#A3B18A]/50"
                      style={{ top: 0 }}
                    />
                  )}
                  
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-[#A3B18A] rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-[#A3B18A] rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-[#A3B18A] rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-[#A3B18A] rounded-br-lg" />
                </div>
                
                <div className="text-center">
                  {isAIScanning ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-[#A3B18A] rounded-full animate-pulse" />
                        <span className="text-white font-medium">Analisi AI in corso...</span>
                      </div>
                      <p className="text-gray-400 text-sm">Sto analizzando la quantità rimanente</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-6 h-6 text-[#A3B18A]" />
                      <span className="text-white font-medium">Analisi completata!</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
