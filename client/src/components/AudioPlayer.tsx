import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Try background.mp3 first, fallback to background.mps if user named it that way
    const audioSrc = "/background.mp3";
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.3; // Gentle volume
    audioRef.current = audio;

    // Attempt to auto-play immediately when component mounts
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch((error) => {
          // Auto-play was prevented by browser policy
          // Will wait for user interaction
          console.log("Auto-play prevented, waiting for user interaction");
        });
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
    setHasInteracted(true);
  };

  // Attempt auto-play on first interaction with the document if not already playing
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted && audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            // Auto-play prevented, waiting for explicit click
          });
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted, isPlaying]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg bg-white/80 backdrop-blur border-pink-200 hover:bg-pink-100 text-pink-500 w-12 h-12"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
