import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchProductWidget() {
  const navigate = useNavigate();

  const handleSearchClick = () => {
    // Naviga all'inventario passando lo stato per l'autofocus
    navigate('/inventario', { state: { autoFocus: true } });
  };

  return (
    <div className="px-5 mb-2">
      <button 
        onClick={handleSearchClick}
        className="w-full bg-white p-4 rounded-3xl card-shadow flex items-center gap-3 text-left transition-transform active:scale-[0.98]"
      >
        <div className="w-10 h-10 bg-[#F2F0E9] rounded-full flex items-center justify-center shrink-0">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#1A1A1A] text-sm">Cerca prodotto...</p>
          <p className="text-xs text-gray-400">Trova in frigo, dispensa o freezer</p>
        </div>
      </button>
    </div>
  );
}