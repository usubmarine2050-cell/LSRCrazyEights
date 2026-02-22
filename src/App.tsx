/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit, Rank, CardData, GameState, GameStatus } from './types';
import { createDeck, shuffleDeck, INITIAL_HAND_SIZE } from './constants';
import { Card } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { GameOver } from './components/GameOver';
import { Info, HelpCircle, ChevronRight, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState<string>("Welcome to Crazy Eights!");

  const initGame = useCallback((autoStart = false) => {
    const deck = shuffleDeck(createDeck());
    const playerHand = deck.splice(0, INITIAL_HAND_SIZE);
    const aiHand = deck.splice(0, INITIAL_HAND_SIZE);
    
    let firstDiscard = deck.pop()!;
    while (firstDiscard.rank === Rank.EIGHT) {
      deck.unshift(firstDiscard);
      firstDiscard = deck.pop()!;
    }

    setGame({
      deck,
      playerHand,
      aiHand,
      discardPile: [firstDiscard],
      currentSuit: firstDiscard.suit,
      turn: 'player',
      status: autoStart ? 'playing' : 'starting',
      winner: null,
    });
    if (autoStart) {
      setMessage("Your turn! Match the suit or rank.");
    }
  }, []);

  useEffect(() => {
    initGame(false);
  }, [initGame]);

  const startGame = () => {
    setGame(prev => prev ? ({ ...prev, status: 'playing' }) : null);
    setMessage("Game started! Your turn.");
  };

  const isPlayable = (card: CardData) => {
    if (!game) return false;
    const topCard = game.discardPile[game.discardPile.length - 1];
    return (
      card.rank === Rank.EIGHT ||
      card.suit === game.currentSuit ||
      card.rank === topCard.rank
    );
  };

  const playCard = (card: CardData, isPlayer: boolean) => {
    if (!game) return;

    const newHand = (isPlayer ? game.playerHand : game.aiHand).filter(c => c.id !== card.id);
    const newDiscardPile = [...game.discardPile, card];
    
    if (card.rank === Rank.EIGHT) {
      setGame(prev => prev ? ({
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        status: isPlayer ? 'choosing_suit' : 'playing',
        // If AI plays 8, we'll handle suit selection in the AI logic
      }) : null);
      
      if (isPlayer) {
        setMessage("Crazy 8! Choose a new suit.");
      }
    } else {
      const nextTurn = isPlayer ? 'ai' : 'player';
      const checkWin = newHand.length === 0;

      setGame(prev => prev ? ({
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        currentSuit: card.suit,
        turn: nextTurn,
        status: checkWin ? (isPlayer ? 'won' : 'lost') : 'playing',
        winner: checkWin ? (isPlayer ? 'player' : 'ai') : null,
      }) : null);

      if (!checkWin) {
        setMessage(isPlayer ? "AI is thinking..." : "Your turn!");
      }
    }
  };

  const drawCard = (isPlayer: boolean) => {
    if (!game || game.deck.length === 0) {
      if (game?.deck.length === 0) {
        // Skip turn if deck empty
        setGame(prev => prev ? ({ ...prev, turn: isPlayer ? 'ai' : 'player' }) : null);
        setMessage("Deck empty! Turn skipped.");
      }
      return;
    }

    const newDeck = [...game.deck];
    const drawnCard = newDeck.pop()!;
    const newHand = [...(isPlayer ? game.playerHand : game.aiHand), drawnCard];

    setGame(prev => prev ? ({
      ...prev,
      deck: newDeck,
      [isPlayer ? 'playerHand' : 'aiHand']: newHand,
    }) : null);

    setMessage(isPlayer ? `You drew a ${drawnCard.rank} of ${drawnCard.suit}.` : "AI drew a card.");
  };

  const handleSuitSelect = (suit: Suit) => {
    if (!game) return;
    setGame(prev => prev ? ({
      ...prev,
      currentSuit: suit,
      status: 'playing',
      turn: 'ai',
    }) : null);
    setMessage(`Suit changed to ${suit}. AI's turn.`);
  };

  // AI Logic
  useEffect(() => {
    if (game?.turn === 'ai' && game.status === 'playing' && !game.winner) {
      const timer = setTimeout(() => {
        const playableCards = game.aiHand.filter(isPlayable);
        
        if (playableCards.length > 0) {
          // Simple AI strategy: play first playable card, prefer non-8s
          const nonEight = playableCards.find(c => c.rank !== Rank.EIGHT);
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === Rank.EIGHT) {
            // AI plays 8, picks most common suit in its hand
            const suitCounts: Record<string, number> = {};
            game.aiHand.forEach(c => {
              suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
            });
            const bestSuit = (Object.keys(suitCounts).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b, Suit.HEARTS)) as Suit;
            
            const newHand = game.aiHand.filter(c => c.id !== cardToPlay.id);
            const checkWin = newHand.length === 0;

            setGame(prev => prev ? ({
              ...prev,
              aiHand: newHand,
              discardPile: [...prev.discardPile, cardToPlay],
              currentSuit: bestSuit,
              turn: 'player',
              status: checkWin ? 'lost' : 'playing',
              winner: checkWin ? 'ai' : null,
            }) : null);
            setMessage(`AI played an 8 and changed suit to ${bestSuit}. Your turn!`);
          } else {
            playCard(cardToPlay, false);
          }
        } else if (game.deck.length > 0) {
          drawCard(false);
          // The effect will re-run because game.aiHand.length or game.deck.length changes
        } else {
          // Skip
          setGame(prev => prev ? ({ ...prev, turn: 'player' }) : null);
          setMessage("AI has no playable cards and deck is empty. AI skipped! Your turn.");
        }
      }, 1000); // Slightly faster for multiple draws
      return () => clearTimeout(timer);
    }
  }, [game?.turn, game?.status, game?.aiHand.length, game?.deck.length]);

  if (!game) return null;

  const topDiscard = game.discardPile[game.discardPile.length - 1];

  return (
    <div className="h-screen w-full flex flex-col felt-texture overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-emerald-900 font-display font-bold text-xl shadow-lg">8</div>
          <h1 className="text-xl font-display font-bold tracking-tight">CRAZY EIGHTS</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
            <Layers size={16} className="text-blue-300" />
            <span className="text-sm font-medium">{game.deck.length} cards left</span>
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <HelpCircle size={24} />
          </button>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 py-8">
        
        {/* AI Hand */}
        <div className="w-full flex justify-center">
          <div className="relative flex -space-x-12 sm:-space-x-16">
            {game.aiHand.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card card={card} isFaceUp={false} className="scale-90 sm:scale-100" />
              </motion.div>
            ))}
            {game.aiHand.length === 0 && <div className="h-40" />}
          </div>
        </div>

        {/* Center Area: Deck & Discard */}
        <div className="flex items-center gap-8 sm:gap-16 my-4">
          {/* Draw Pile */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-blue-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Card 
              card={game.deck[0] || { id: 'empty', suit: Suit.SPADES, rank: Rank.ACE }} 
              isFaceUp={false} 
              onClick={game.turn === 'player' && game.status === 'playing' ? () => drawCard(true) : undefined}
              className={`${game.turn === 'player' && game.status === 'playing' ? 'cursor-pointer ring-2 ring-white/20' : 'opacity-50'}`}
            />
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-bold text-white/60 uppercase tracking-widest">Draw</div>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={topDiscard.id}
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="relative z-10"
              >
                <Card card={topDiscard} />
              </motion.div>
            </AnimatePresence>
            {/* Visual stack effect */}
            {game.discardPile.length > 1 && (
              <div className="absolute inset-0 -z-10 translate-x-1 translate-y-1 rotate-3">
                <Card card={game.discardPile[game.discardPile.length - 2]} className="opacity-40" />
              </div>
            )}
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-bold text-white/60 uppercase tracking-widest">
              Suit: <span className="text-yellow-400">{game.currentSuit.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex justify-center pb-4">
          <div className="relative flex -space-x-12 sm:-space-x-16 max-w-full overflow-x-auto px-12 py-4 no-scrollbar">
            {game.playerHand.map((card, i) => (
              <motion.div
                key={card.id}
                layoutId={card.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  card={card} 
                  isPlayable={game.turn === 'player' && game.status === 'playing' && isPlayable(card)}
                  onClick={() => playCard(card, true)}
                  className="scale-90 sm:scale-100"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Message Banner - Moved to bottom absolute */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none z-30">
        <motion.div 
          key={message}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/90 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto mx-4 text-center"
        >
          <p className="text-sm sm:text-base font-medium text-yellow-100 flex items-center justify-center gap-2">
            <Info size={16} className="text-yellow-400" />
            {message}
          </p>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {game.status === 'starting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center max-w-md w-full"
            >
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-8"
              >
                <div className="w-24 h-36 bg-slate-900 rounded-xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-yellow-400">8</span>
                </div>
              </motion.div>
              
              <h1 className="text-5xl font-display font-bold mb-4 tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                CRAZY EIGHTS
              </h1>
              <p className="text-slate-400 mb-10 text-lg">
                The ultimate strategic card battle.<br/>Are you ready to outsmart the AI?
              </p>

              <div className="space-y-4">
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-2xl font-bold text-xl transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
                >
                  Start Game
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg border border-white/10 transition-all"
                >
                  Rules
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {game.status === 'choosing_suit' && (
          <SuitPicker onSelect={handleSuitSelect} />
        )}
        
        {game.winner && (
          <GameOver winner={game.winner} onRestart={initGame} />
        )}

        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-slate-900 p-8 rounded-3xl max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold">How to Play</h2>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <ChevronRight className="rotate-90" />
                </button>
              </div>
              
              <div className="space-y-4 text-slate-600">
                <section>
                  <h3 className="font-bold text-slate-900 mb-1">Objective</h3>
                  <p>Be the first player to get rid of all your cards.</p>
                </section>
                <section>
                  <h3 className="font-bold text-slate-900 mb-1">Matching</h3>
                  <p>On your turn, play a card that matches the <strong>Suit</strong> or <strong>Rank</strong> of the top card in the discard pile.</p>
                </section>
                <section>
                  <h3 className="font-bold text-slate-900 mb-1">Crazy Eights</h3>
                  <p><strong>8s are wild!</strong> You can play an 8 at any time and choose a new suit for the next player.</p>
                </section>
                <section>
                  <h3 className="font-bold text-slate-900 mb-1">Drawing</h3>
                  <p>If you can't play, you must draw a card from the deck. If the deck is empty, your turn is skipped.</p>
                </section>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
