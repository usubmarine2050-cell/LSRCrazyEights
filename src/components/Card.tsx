import React from 'react';
import { motion } from 'motion/react';
import { Suit, Rank, CardData } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardData;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case Suit.HEARTS: return <Heart size={size} className="text-red-500 fill-red-500" />;
    case Suit.DIAMONDS: return <Diamond size={size} className="text-red-500 fill-red-500" />;
    case Suit.CLUBS: return <Club size={size} className="text-slate-300 fill-slate-300" />;
    case Suit.SPADES: return <Spade size={size} className="text-slate-300 fill-slate-300" />;
  }
};

export const Card: React.FC<CardProps> = ({ card, isFaceUp = true, onClick, isPlayable = false, className = "" }) => {
  const isRed = card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS;

  if (!isFaceUp) {
    return (
      <motion.div
        whileHover={onClick ? { y: -10 } : {}}
        className={`relative w-24 h-36 sm:w-28 sm:h-40 bg-slate-950 rounded-xl border-2 border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden ${className}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent"></div>
        <div className="w-16 h-24 border border-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-slate-700 font-display font-bold text-2xl rotate-45 tracking-tighter">LSR</div>
        </div>
        <div className="absolute top-2 left-2 opacity-20"><SuitIcon suit={Suit.SPADES} size={12} /></div>
        <div className="absolute bottom-2 right-2 opacity-20 rotate-180"><SuitIcon suit={Suit.HEARTS} size={12} /></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`relative w-24 h-36 sm:w-28 sm:h-40 bg-slate-900 rounded-xl border-2 ${isPlayable ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] cursor-pointer' : 'border-slate-800 shadow-lg'} flex flex-col p-2 select-none overflow-hidden ${className}`}
    >
      <div className={`flex flex-col items-start leading-none ${isRed ? 'text-red-500' : 'text-slate-100'}`}>
        <span className="text-xl font-display font-bold">{card.rank}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <SuitIcon suit={card.suit} size={48} />
          {card.rank === Rank.EIGHT && (
            <div className="absolute -inset-2 bg-yellow-400/10 blur-xl rounded-full"></div>
          )}
        </div>
      </div>

      <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-red-500' : 'text-slate-100'}`}>
        <span className="text-xl font-display font-bold">{card.rank}</span>
        <SuitIcon suit={card.suit} size={14} />
      </div>
    </motion.div>
  );
};
