import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Using local asset so user can easily replace it
const PUZZLE_IMAGE = "/puzzle.jpg";

const GRID_SIZE = 4; // 4x4 grid = 16 pieces
const PIECE_SIZE = 100; // base size in px (will be responsive)

interface Piece {
  id: number;
  currentPos: number; // 0-8 index
  correctPos: number; // 0-8 index
}

interface PuzzleGameProps {
  onComplete: () => void;
}

export function PuzzleGame({ onComplete }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize puzzle
  useEffect(() => {
    const initialPieces: Piece[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      id: i,
      currentPos: i,
      correctPos: i,
    }));
    
    // Initial shuffle
    shufflePieces(initialPieces);
  }, []);

  const shufflePieces = (currentPieces: Piece[]) => {
    // Create a proper shuffle by randomly assigning positions
    // We'll do multiple random swaps to ensure it's well shuffled
    const shuffled = currentPieces.map(p => ({ ...p }));
    const totalPieces = GRID_SIZE * GRID_SIZE;
    
    // Generate random positions for each piece
    const positions = Array.from({ length: totalPieces }, (_, i) => i);
    
    // Fisher-Yates shuffle for truly random distribution
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    
    // Assign shuffled positions to pieces
    shuffled.forEach((piece, index) => {
      piece.currentPos = positions[index];
    });
    
    // Ensure puzzle is not already solved and has minimum difficulty
    // Check if puzzle is solved or too easy (less than 5 pieces out of place)
    const misplacedCount = shuffled.filter(p => p.currentPos !== p.correctPos).length;
    
    // If puzzle is too easy (less than 8 pieces misplaced), reshuffle
    if (misplacedCount < 8) {
      // Do additional random swaps to increase difficulty
      for (let i = 0; i < 10; i++) {
        const idx1 = Math.floor(Math.random() * totalPieces);
        const idx2 = Math.floor(Math.random() * totalPieces);
        if (idx1 !== idx2) {
          const temp = shuffled[idx1].currentPos;
          shuffled[idx1].currentPos = shuffled[idx2].currentPos;
          shuffled[idx2].currentPos = temp;
        }
      }
    }
    
    setPieces(shuffled);
    setIsComplete(false);
    setMoves(0);
  };

  const handleDragEnd = (pieceId: number, info: any) => {
    // Calculate nearest grid slot based on drag end position
    // This is a simplified "swap" mechanic for better UX than strict sliding
    
    // In a real implementation, we'd calculate the drop target precisely.
    // For this fun meme version, we'll use a simpler "click to swap" or "drag to swap" logic
    // But framer motion drag to swap is tricky without complex layout measurement.
    
    // Let's switch to a "Click two pieces to swap them" mechanic which is mobile friendly
    // and less buggy for a quick fun game.
  };

  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const handlePieceClick = (clickedPieceIndex: number) => {
    if (isComplete) return;

    if (selectedPiece === null) {
      setSelectedPiece(clickedPieceIndex);
    } else {
      // Swap logic
      const newPieces = [...pieces];
      
      const piece1Index = newPieces.findIndex(p => p.currentPos === selectedPiece);
      const piece2Index = newPieces.findIndex(p => p.currentPos === clickedPieceIndex);
      
      if (piece1Index !== -1 && piece2Index !== -1) {
        // Swap positions
        const tempPos = newPieces[piece1Index].currentPos;
        newPieces[piece1Index].currentPos = newPieces[piece2Index].currentPos;
        newPieces[piece2Index].currentPos = tempPos;
        
        setPieces(newPieces);
        setMoves(m => m + 1);
        setSelectedPiece(null);
        
        // Check win condition
        const isNowSolved = newPieces.every(p => p.currentPos === p.correctPos);
        if (isNowSolved) {
          setIsComplete(true);
          setTimeout(onComplete, 1500); // Delay to show full image
        }
      }
    }
  };
  
  // Debug / Skip for testing
  const handleSkip = () => {
    const solved = pieces.map(p => ({ ...p, currentPos: p.correctPos }));
    setPieces(solved);
    setIsComplete(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
      <div className="text-center mb-6 space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border border-pink-200 inline-block"
        >
          <h2 className="text-2xl font-romantic text-primary">Help me fix this picture!</h2>
          <p className="text-muted-foreground text-sm">Click two pieces to swap them 💕</p>
        </motion.div>
      </div>

      <motion.div 
        className="relative bg-white p-2 rounded-xl shadow-2xl shadow-pink-200/50 border-4 border-white"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          className="grid gap-1 bg-pink-50 rounded-lg overflow-hidden"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            width: 'min(90vw, 400px)',
            aspectRatio: '1',
          }}
        >
          {/* We render slots 0-8, and find which piece is currently at that slot */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, slotIndex) => {
            const piece = pieces.find(p => p.currentPos === slotIndex);
            if (!piece) return <div key={slotIndex} className="bg-pink-100/50" />;

            const isSelected = selectedPiece === slotIndex;
            const isCorrect = piece.currentPos === piece.correctPos;
            
            // Calculate which slice of the image this piece should show
            const row = Math.floor(piece.correctPos / GRID_SIZE);
            const col = piece.correctPos % GRID_SIZE;
            
            // For CSS background positioning with oversized backgrounds:
            // background-size: 400% means image is 4x the element size
            // To show the slice at position (col, row), we need to shift the image
            // 
            // The correct formula for an NxN grid:
            // bgX = (col / (N - 1)) * 100%  for col > 0, else 0%
            // bgY = (row / (N - 1)) * 100%  for row > 0, else 0%
            // This positions each slice correctly
            const bgXPercent = col === 0 ? 0 : (col / (GRID_SIZE - 1)) * 100;
            const bgYPercent = row === 0 ? 0 : (row / (GRID_SIZE - 1)) * 100;

            return (
              <motion.div
                key={piece.id}
                layout
                onClick={() => handlePieceClick(slotIndex)}
                className={`relative cursor-pointer overflow-hidden rounded-sm transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-accent z-10 scale-95' : 'hover:opacity-90'
                } ${isComplete ? 'ring-0' : ''}`}
                style={{
                  backgroundImage: `url(${PUZZLE_IMAGE})`,
                  backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
                  backgroundPosition: `${bgXPercent}% ${bgYPercent}%`,
                  backgroundRepeat: 'no-repeat',
                }}
                whileHover={{ scale: isComplete ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            );
          })}
        </div>
        
        {/* Confetti or shine effect overlay when done */}
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white text-primary font-bold text-xl px-6 py-2 rounded-full shadow-xl"
            >
              Perfect!
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-8 flex gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => shufflePieces(pieces)}
          disabled={isComplete}
          className="text-muted-foreground hover:text-primary"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Reshuffle
        </Button>
        
        {/* Developer backdoor to skip for testing */}
        <button 
          onClick={handleSkip}
          className="text-xs text-pink-200 hover:text-pink-300 transition-colors"
        >
          (skip)
        </button>
      </div>
    </div>
  );
}
