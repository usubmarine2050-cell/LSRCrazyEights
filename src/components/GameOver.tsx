import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Frown, RotateCcw } from 'lucide-react';

interface GameOverProps {
  winner: 'player' | 'ai';
  onRestart: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ winner, onRestart }) => {
  const isPlayer = winner === 'player';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ y: 50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-slate-900 text-center"
      >
        <div className="flex justify-center mb-6">
          {isPlayer ? (
            <div className="bg-yellow-100 p-6 rounded-full">
              <Trophy size={80} className="text-yellow-500" />
            </div>
          ) : (
            <div className="bg-slate-100 p-6 rounded-full">
              <Frown size={80} className="text-slate-500" />
            </div>
          )}
        </div>

        <h2 className="text-4xl font-display font-bold mb-2">
          {isPlayer ? 'Victory!' : 'Defeat!'}
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          {isPlayer ? 'You cleared all your cards first. Well played!' : 'The AI outplayed you this time. Try again?'}
        </p>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-emerald-900/20"
        >
          <RotateCcw size={24} />
          Play Again
        </button>
      </motion.div>
    </motion.div>
  );
};
