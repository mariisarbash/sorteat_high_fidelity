import { cn } from "@/lib/utils";

// Definizione coerente dei roommates - SENZA shared (shared = tutti selezionati)
const ROOMMATES = [
  { id: "mari", name: "Mari", color: "bg-pink-500", initial: "M" },
  { id: "gio", name: "Gio", color: "bg-blue-500", initial: "G" },
  { id: "pile", name: "Pile", color: "bg-purple-500", initial: "P" },
];

export function OwnerSelector({ selectedOwners = [], onChange, size = "md" }) {
  // "allSelected" significa che tutti i 3 roommates sono selezionati = shared
  const allSelected = selectedOwners.length === ROOMMATES.length && 
                      ROOMMATES.every(r => selectedOwners.includes(r.id));

  const toggleOwner = (ownerId) => {
    if (selectedOwners.includes(ownerId)) {
      // Rimuovi owner (ma almeno uno deve rimanere)
      const newOwners = selectedOwners.filter((id) => id !== ownerId);
      if (newOwners.length > 0) {
        onChange(newOwners);
      }
    } else {
      // Aggiungi owner
      onChange([...selectedOwners, ownerId]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      // Se tutti sono selezionati, torna al solo utente corrente
      onChange(["mari"]);
    } else {
      // Seleziona tutti (= shared)
      onChange(ROOMMATES.map((r) => r.id));
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Bottone "Tutti/Condiviso" con icona casa */}
      <button
        type="button"
        onClick={toggleAll}
        className={cn(
          "rounded-full flex items-center justify-center font-medium transition-all border-2",
          sizeClasses[size],
          allSelected
            ? "bg-[#A3B18A] text-white border-[#A3B18A]"
            : "bg-gray-100 text-gray-500 border-gray-200 hover:border-[#A3B18A]"
        )}
      >
        🏠
      </button>

      {/* Avatar singoli coinquilini */}
      {ROOMMATES.map((roommate) => {
        const isSelected = selectedOwners.includes(roommate.id);
        return (
          <button
            key={roommate.id}
            type="button"
            onClick={() => toggleOwner(roommate.id)}
            className={cn(
              "rounded-full flex items-center justify-center font-medium transition-all border-2",
              sizeClasses[size],
              isSelected
                ? `${roommate.color} text-white border-transparent`
                : "bg-gray-100 text-gray-400 border-gray-200 hover:border-gray-300"
            )}
          >
            {roommate.initial}
          </button>
        );
      })}
    </div>
  );
}

export { ROOMMATES };
export default OwnerSelector;
