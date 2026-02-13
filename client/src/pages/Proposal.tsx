import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSubmitResponse } from '@/hooks/use-response';
import { PuzzleGame } from '@/components/PuzzleGame';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/ui/button';
import { Heart, Stars } from 'lucide-react';

// STAGES
type Stage = 'puzzle' | 'proposal' | 'success';

// Asset URLs
// Cute cat holding flowers
const SUCCESS_IMAGE = "/success.jpg";

export default function Proposal() {
  const [stage, setStage] = useState<Stage>('puzzle');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  
  const submitResponse = useSubmitResponse();
  const controls = useAnimation();

  // Handlers
  const handlePuzzleComplete = () => {
    setStage('proposal');
  };

  const handleYesClick = () => {
    submitResponse.mutate(true);
    setStage('success');
    fireConfetti();
  };

  const handleNoHover = () => {
    // Run away logic
    // We want it to stay within the viewport but jump away from cursor
    const x = (Math.random() - 0.5) * 400; // Random jump -200 to 200px
    const y = (Math.random() - 0.5) * 400;
    
    // Increment attempts to make it "harder" or show funny text later
    setAttempts(p => p + 1);
    
    setNoButtonPos({ x, y });
  };

  const fireConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 via-red-50 to-pink-100 flex flex-col items-center justify-center overflow-hidden relative cursor-heart">
      <AudioPlayer />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-pink-200"
        >
          <Heart size={120} fill="currentColor" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }} 
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 right-20 text-red-100"
        >
          <Heart size={180} fill="currentColor" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* === STAGE 1: PUZZLE === */}
        {stage === 'puzzle' && (
          <motion.div
            key="puzzle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="z-10 w-full"
          >
            <PuzzleGame onComplete={handlePuzzleComplete} />
          </motion.div>
        )}

        {/* === STAGE 2: PROPOSAL === */}
        {stage === 'proposal' && (
          <motion.div
            key="proposal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="z-10 text-center max-w-lg mx-auto p-8"
          >
            <motion.div 
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-pink-200"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-romantic text-primary mb-8 leading-tight">
                Will you be my Valentine? 
                <span className="inline-block ml-2 animate-bounce">🥺</span>
              </h1>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-10 h-32 relative">
                {/* YES BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleYesClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg shadow-green-200/50 transition-colors z-20"
                >
                  YES! 💖
                </motion.button>

                {/* NO BUTTON (RUNAWAY) */}
                <motion.button
                  ref={noBtnRef}
                  animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onMouseEnter={handleNoHover}
                  onClick={handleNoHover} // Just in case mobile user taps it
                  className="bg-red-400 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg z-10"
                >
                  {attempts === 0 ? "No" : 
                   attempts < 3 ? "Are you sure?" : 
                   attempts < 6 ? "Really??" : "STOP CHASING ME!"}
                </motion.button>
              </div>
              
              <p className="mt-8 text-sm text-muted-foreground font-display">
                (The puzzle proved we're a perfect match!)
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* === STAGE 3: SUCCESS === */}
        {stage === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 text-center p-4 max-w-2xl mx-auto"
          >
            <motion.div 
              className="glass-panel p-8 rounded-3xl"
              animate={{ 
                boxShadow: ["0px 10px 30px rgba(255, 105, 180, 0.3)", "0px 10px 50px rgba(255, 105, 180, 0.6)", "0px 10px 30px rgba(255, 105, 180, 0.3)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h1 className="text-5xl md:text-7xl font-romantic text-primary mb-6 text-shadow-pop">
                YAYYYY!!! 🎉
              </h1>
              
              <motion.div 
                className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl mx-auto mb-8 max-w-md aspect-video bg-pink-100"
                initial={{ rotate: -5 }}
                animate={{ rotate: 5 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              >
                {/* Meme Image */}
                <img 
                  src={SUCCESS_IMAGE} 
                  alt="Happy Cat" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/50 text-white font-meme text-2xl px-4 py-1 rounded">
                    BEST DAY EVER
                  </span>
                </div>
              </motion.div>
              
              <div className="space-y-4">
                <p className="text-2xl font-display text-foreground">
                  See you on Feb 14th! ❤️
                </p>
                
                <div className="flex justify-center gap-2 text-pink-400">
                  <Stars className="animate-spin-slow" />
                  <Heart className="animate-pulse" fill="currentColor" />
                  <Stars className="animate-spin-slow" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
