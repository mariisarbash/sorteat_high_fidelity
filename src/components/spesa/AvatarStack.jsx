import React from 'react';

// Definizione coerente dei roommates con colori uniformi
const ROOMMATES = [
  { id: 'mari', label: 'M', color: 'bg-pink-500' },
  { id: 'gio', label: 'G', color: 'bg-blue-500' },
  { id: 'pile', label: 'P', color: 'bg-purple-500' },
];

export default function AvatarStack({ owners = [] }) {
  // Se owners contiene tutti i roommates o è vuoto, mostra icona casa (shared)
  const isShared = owners.length === 0 || 
                   owners.length === ROOMMATES.length ||
                   owners.includes('shared');
  
  if (isShared) {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#A3B18A] text-white text-xs">
        🏠
      </div>
    );
  }

  // Filtra i roommates selezionati
  const selectedRoommates = ROOMMATES.filter(r => owners.includes(r.id));

  if (selectedRoommates.length === 0) {
    return (
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#A3B18A] text-white text-xs">
        🏠
      </div>
    );
  }

  if (selectedRoommates.length === 1) {
    const roommate = selectedRoommates[0];
    return (
      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${roommate.color} text-white text-xs font-medium`}>
        {roommate.label}
      </div>
    );
  }

  // Stack di avatar per più proprietari
  return (
    <div className="flex -space-x-2">
      {selectedRoommates.map((roommate) => (
        <div
          key={roommate.id}
          className={`flex items-center justify-center w-6 h-6 rounded-full ${roommate.color} text-white text-xs font-medium border-2 border-white`}
        >
          {roommate.label}
        </div>
      ))}
    </div>
  );
}
