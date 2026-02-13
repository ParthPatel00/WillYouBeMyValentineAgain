import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(true); // Starts playing (muted)
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasUnmutedRef = useRef(false);

  const unmute = () => {
    if (!hasUnmutedRef.current && audioRef.current) {
      const audio = audioRef.current;
      audio.muted = false;
      audio.play().catch(e => console.log("Play on unmute failed:", e));
      hasUnmutedRef.current = true;
      setIsMuted(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  // Unmute on first user interaction
  useEffect(() => {
    const opts = { capture: true, once: true };
    document.addEventListener('click', unmute, opts);
    document.addEventListener('touchstart', unmute, opts);
    document.addEventListener('keydown', unmute, opts);
    return () => {
      document.removeEventListener('click', unmute, opts);
      document.removeEventListener('touchstart', unmute, opts);
      document.removeEventListener('keydown', unmute, opts);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      unmute();
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        src="/background.mp3"
        loop
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full shadow-lg bg-white/80 backdrop-blur border-pink-200 hover:bg-pink-100 text-pink-500 w-12 h-12"
        onClick={togglePlay}
        title={isMuted ? "Click to unmute music" : isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying && !isMuted ? (
          <Volume2 className="w-5 h-5 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
