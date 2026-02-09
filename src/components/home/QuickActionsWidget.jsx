import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const mockActions = [
  {
    id: 1,
    icon: '💰',
    title: 'Devi 5€ a Gio',
    subtitle: 'per la spesa di ieri',
    action: 'Paga ora',
    type: 'debt'
  },
  {
    id: 2,
    icon: '🍝',
    title: 'Lasagne avanzate',
    subtitle: 'sono in palio!',
    action: 'Prendi',
    type: 'leftover'
  }
];

export default function QuickActionsWidget() {
  const handleAction = (type) => {
    if (type === 'debt') {
      toast.success('Funzionalità pagamento in arrivo!', { icon: '💸' });
    } else if (type === 'leftover') {
      toast.success('Lasagne prenotate per te!', { icon: '🍝' });
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mx-5 mb-4"
    >
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {mockActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.05 }}
            onClick={() => handleAction(action.type)}
            className="flex-shrink-0 bg-white rounded-2xl p-4 card-shadow flex items-center gap-3 min-w-[200px] active:scale-[0.98] transition-transform text-left"
          >
            <span className="text-2xl">{action.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1A1A1A] text-sm">{action.title}</p>
              <p className="text-xs text-[#666666]">{action.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 text-[#3A5A40]">
              <span className="text-xs font-semibold">{action.action}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}