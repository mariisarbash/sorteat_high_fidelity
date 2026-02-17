import React from 'react';
import { ShoppingCart, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';

export default function ShoppingListWidget() {
  const navigate = useNavigate();
  const { shoppingList } = useProducts();

  // Conta gli elementi non spuntati
  const itemsToBuy = shoppingList.filter(item => !item.is_checked);
  const count = itemsToBuy.length;

  // Crea una stringa di anteprima (es. "Latte, Uova, Pane...")
  const previewText = itemsToBuy
    .slice(0, 3)
    .map(item => item.name)
    .join(', ') + (itemsToBuy.length > 3 ? '...' : '');

  return (
    <div className="px-5 mb-2">
      <button 
        onClick={() => navigate('/spesa')}
        // STILE LIGHT: bg-white sempre, identico a SearchProductWidget
        className="w-full bg-white p-4 rounded-3xl card-shadow flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
      >
        {/* ICONA: Identica dimensione (w-10 h-10) del search widget */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            count > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
        }`}>
          {count > 0 ? <ShoppingCart className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          {count > 0 ? (
            <>
              <p className="font-bold text-[#1A1A1A] text-sm leading-tight">
                {count} da comprare
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {previewText}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-[#1A1A1A] text-sm leading-tight">
                Tutto preso!
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                La lista è vuota
              </p>
            </>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-gray-300" />
      </button>
    </div>
  );
}