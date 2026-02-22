import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { Heart, Diamond, Club, Spade, X } from 'lucide-react';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits = [
    { type: Suit.HEARTS, icon: Heart, color: 'text-red-500', label: 'Hearts' },
    { type: Suit.DIAMONDS, icon: Diamond, color: 'text-red-500', label: 'Diamonds' },
    { type: Suit.CLUBS, icon: Club, color: 'text-slate-900', label: 'Clubs' },
    { type: Suit.SPADES, icon: Spade, color: 'text-slate-900', label: 'Spades' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-slate-900">
        <h2 className="text-2xl font-display font-bold mb-6 text-center">Choose a Suit</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map(({ type, icon: Icon, color, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
            >
              <Icon size={48} className={`${color} group-hover:scale-110 transition-transform`} />
              <span className="mt-2 font-medium text-slate-600">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
