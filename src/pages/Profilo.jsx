import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, QrCode, Settings, LogOut, Leaf, Award, Edit2, Plus, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';

const userProfile = {
  name: 'Mari',
  email: 'mari@email.com',
  avatar: null,
  level: 'Eco-Warrior',
  levelIcon: '🌿',
  stats: {
    daysNoWaste: 12,
    savedMoney: 47.50,
    recipes: 28
  },
  foodPassport: {
    diet: 'Onnivoro',
    allergies: [],
    dislikes: ['Funghi', 'Olive']
  }
};

const houses = [
  { id: 1, name: 'Via Bassini, 13', members: ['Mari', 'Gio', 'Pile'], isActive: true, icon: '🏠' },
  { id: 2, name: 'Famiglia Ceccarelli', members: ['Mamma', 'Papà', 'Mari'], isActive: false, icon: '👨‍👩‍👧' },
  { id: 3, name: 'Sanremo', members: ['Nonni'], isActive: false, icon: '🏖️' },
  { id: 4, name: 'Bormio', members: ['Amici'], isActive: false, icon: '⛷️' },
];

const activeHouse = {
  id: 1,
  name: 'Via Bassini, 13',
  members: [
    { name: 'Mari', role: 'Tu', avatar: null },
    { name: 'Gio', role: 'Coinquilino', avatar: null },
    { name: 'Pile', role: 'Coinquilino', avatar: null },
  ],
  settings: {
    budget: 400,
    sharedShopping: true
  }
};

export default function Profilo() {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [showFoodPassport, setShowFoodPassport] = useState(false);

  const handleHouseSwitch = (house) => {
    if (house.isActive) return;
    toast('Funzionalità in arrivo!', {
      icon: '🚀',
      description: 'Presto potrai cambiare casa'
    });
  };

  const handleInvite = () => {
    setShowQR(true);
  };

  const handleLogout = () => {
    toast('Funzionalità in arrivo!', { icon: '🚀' });
  };

  return (
    <div className="min-h-screen bg-[#F2F0E9] pb-24">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="bg-gradient-to-b from-[#3A5A40] to-[#4a6b50] px-5 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Profilo</h1>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-[#A3B18A] flex items-center justify-center text-white text-3xl font-bold">
            M
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
            <p className="text-white/80 text-sm">{userProfile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-[#D4A373] rounded-full text-xs font-semibold text-white flex items-center gap-1">
                {userProfile.levelIcon} {userProfile.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-4">
        <div className="bg-white rounded-3xl p-4 card-shadow grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#3A5A40]/10 flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-6 h-6 text-[#3A5A40]" />
            </div>
            <p className="text-lg font-bold text-[#1A1A1A]">{userProfile.stats.daysNoWaste}</p>
            <p className="text-xs text-[#666666]">Giorni zero spreco</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#D4A373]/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-xl">💰</span>
            </div>
            <p className="text-lg font-bold text-[#1A1A1A]">€{userProfile.stats.savedMoney}</p>
            <p className="text-xs text-[#666666]">Risparmiati</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#A3B18A]/20 flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-[#A3B18A]" />
            </div>
            <p className="text-lg font-bold text-[#1A1A1A]">{userProfile.stats.recipes}</p>
            <p className="text-xs text-[#666666]">Ricette cucinate</p>
          </div>
        </div>
      </div>

      {/* Food Passport */}
      <div className="px-5 mt-4">
        <button
          onClick={() => setShowFoodPassport(true)}
          className="w-full bg-white rounded-2xl p-4 card-shadow flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F0E9] flex items-center justify-center">
              <span className="text-2xl">🍽️</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#1A1A1A]">Passaporto Alimentare</p>
              <p className="text-xs text-[#666666]">{userProfile.foodPassport.diet} • {userProfile.foodPassport.dislikes.length} preferenze</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* House Switcher */}
      <div className="px-5 mt-6">
        <h3 className="font-semibold text-[#1A1A1A] mb-3">Le tue case</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {houses.map((house) => (
            <motion.button
              key={house.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleHouseSwitch(house)}
              className={`flex-shrink-0 w-36 p-4 rounded-2xl text-left transition-all ${
                house.isActive 
                  ? 'bg-[#3A5A40] text-white' 
                  : 'bg-white card-shadow'
              }`}
            >
              <span className="text-2xl">{house.icon}</span>
              <p className={`font-semibold text-sm mt-2 truncate ${house.isActive ? 'text-white' : 'text-[#1A1A1A]'}`}>
                {house.name}
              </p>
              <p className={`text-xs mt-0.5 ${house.isActive ? 'text-white/80' : 'text-[#666666]'}`}>
                {house.members.length} membri
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active House Management */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-3xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#3A5A40]" />
              <h3 className="font-semibold text-[#1A1A1A]">{activeHouse.name}</h3>
            </div>
            <button
              onClick={handleInvite}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#3A5A40] rounded-full text-white text-xs font-medium"
            >
              <Plus className="w-3 h-3" />
              Invita
            </button>
          </div>

          <div className="space-y-2">
            {activeHouse.members.map((member) => (
              <div key={member.name} className="flex items-center gap-3 p-3 bg-[#F2F0E9] rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#A3B18A] flex items-center justify-center text-white font-bold">
                  {member.name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A1A]">{member.name}</p>
                  <p className="text-xs text-[#666666]">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#666666]">Budget mensile</span>
              <span className="font-semibold text-[#1A1A1A]">€{activeHouse.settings.budget}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666666]">Spesa condivisa</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeHouse.settings.sharedShopping 
                  ? 'bg-[#A3B18A]/20 text-[#3A5A40]' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {activeHouse.settings.sharedShopping ? 'Attiva' : 'Disattiva'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mt-6">
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-red-50 rounded-2xl text-red-600 font-semibold flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Esci
        </button>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowQR(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowQR(false)}
            >
              <div 
                className="bg-white rounded-3xl p-6 max-w-sm w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <QrCode className="w-8 h-8 text-[#3A5A40] mx-auto mb-4" />
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Invita coinquilino</h2>
                <p className="text-sm text-[#666666] mb-4">Fai scansionare questo QR code</p>
                
                <div className="w-48 h-48 bg-[#1A1A1A] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <div className="w-40 h-40 bg-white rounded-lg p-2">
                    {/* Mock QR pattern */}
                    <div className="w-full h-full grid grid-cols-7 gap-0.5">
                      {[...Array(49)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`${Math.random() > 0.5 ? 'bg-[#1A1A1A]' : 'bg-white'} rounded-sm`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowQR(false)}
                  className="w-full py-3 bg-[#3A5A40] text-white font-semibold rounded-2xl"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Food Passport Modal */}
      <AnimatePresence>
        {showFoodPassport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFoodPassport(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5 max-w-md mx-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#1A1A1A]">Passaporto Alimentare</h2>
                <button
                  onClick={() => setShowFoodPassport(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 rotate-[270deg]" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F2F0E9] rounded-2xl">
                  <p className="text-xs text-[#666666] mb-1">Dieta</p>
                  <p className="font-semibold text-[#1A1A1A]">{userProfile.foodPassport.diet}</p>
                </div>

                <div className="p-4 bg-[#F2F0E9] rounded-2xl">
                  <p className="text-xs text-[#666666] mb-2">Allergie e intolleranze</p>
                  {userProfile.foodPassport.allergies.length === 0 ? (
                    <p className="text-sm text-[#666666]">Nessuna allergia dichiarata</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile.foodPassport.allergies.map((a) => (
                        <span key={a} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{a}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#F2F0E9] rounded-2xl">
                  <p className="text-xs text-[#666666] mb-2">Non mi piace</p>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.foodPassport.dislikes.map((d) => (
                      <span key={d} className="px-3 py-1 bg-gray-200 text-[#666666] rounded-full text-sm">{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  toast('Funzionalità in arrivo!', { icon: '🚀' });
                }}
                className="w-full py-3 mt-4 bg-[#3A5A40] text-white font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifica preferenze
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}