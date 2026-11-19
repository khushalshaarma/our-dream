'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MochiCat } from './mascots/MochiCat';
import { PuddingBunny } from './mascots/PuddingBunny';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface SecretEntranceProps {
  onUnlock: (userName: string) => void;
}

export const SecretEntrance: React.FC<SecretEntranceProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [shake, setShake] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setCode(e.target.value);
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsUnlocked(true);
        sound.playSecretUnlock();

        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F4A9C5', '#C8B3F5', '#FFF0D7', '#B6E7DC'],
        });

        setTimeout(() => {
          onUnlock(data.user || 'Tanushree');
        }, 1100);
      } else {
        sound.playWrongBoop();
        setShake(true);
        setErrorMsg(data.error || 'wrong universe, bestie. try again ♡');
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setErrorMsg('oopsie, network glitch. please try again ♡');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-midnight-plum stars-bg">
      {/* 3D Glowing Crescent Moon */}
      <div className="absolute top-8 right-12 select-none pointer-events-none opacity-85">
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-pastel-pink/30 to-pastel-cream/80 shadow-[0_0_50px_rgba(255,240,215,0.4)] animate-pulse-subtle flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-midnight-plum translate-x-2 -translate-y-1" />
        </div>
        <div className="text-center font-pixel text-[10px] text-pastel-pink/70 mt-1 tracking-widest">
          2:00 AM
        </div>
      </div>

      {/* Floating 3D stars & hearts background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pastel-pink/30 text-sm select-none"
            initial={{
              x: `${(i * 7.5 + 4) % 94}vw`,
              y: `${(i * 13 + 6) % 90}vh`,
            }}
            animate={{
              y: ['0px', '-14px', '0px'],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          >
            {i % 2 === 0 ? '♡' : '✦'}
          </motion.div>
        ))}
      </div>

      {/* 3D Glass Unlock Card */}
      <motion.div
        animate={
          shake
            ? { x: [-10, 10, -8, 8, -4, 4, 0] }
            : isUnlocked
            ? { scale: [1, 1.04, 0.98], opacity: [1, 1, 0.9] }
            : {}
        }
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-md p-8 sm:p-10 rounded-3xl glass-panel-3d transition-all duration-700 ${
          isUnlocked
            ? 'shadow-[0_0_60px_rgba(244,169,197,0.7)] border-pastel-pink'
            : 'border-pastel-pink/30 hover:border-pastel-pink/50'
        }`}
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 rounded-full bg-midnight-surface border border-pastel-pink/40 shadow-glow-pink">
          <span className="text-pastel-pink text-xs">🎀</span>
          <span className="font-pixel text-[11px] text-pastel-pink tracking-wider uppercase">
            private sanctuary
          </span>
          <span className="text-pastel-pink text-xs">🎀</span>
        </div>

        <div className="flex items-end justify-center gap-6 mb-6 pt-2">
          <MochiCat mood={isUnlocked ? 'excited' : 'sleeping'} size={56} />
          <div className="relative mb-2 text-2xl">
            {isUnlocked ? '💖' : '🗝️'}
          </div>
          <PuddingBunny mood={isUnlocked ? 'celebrating' : 'sleeping'} size={56} />
        </div>

        <div className="text-center mb-7">
          <h1 className="font-cormorant italic text-3xl sm:text-4xl text-pastel-cream font-semibold tracking-wide">
            psst... this little universe is private ♡
          </h1>
          <p className="font-sans text-xs sm:text-sm text-pastel-blue/80 mt-2">
            two idiots live here. outsiders, respectfully no.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block font-pixel text-xs text-pastel-pink/90 mb-1.5 tracking-wider">
              enter our secret little code
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={handleInputChange}
                placeholder="our special date ♡"
                disabled={isSubmitting || isUnlocked}
                autoFocus
                className="w-full px-4 py-3 rounded-2xl bg-midnight-aubergine/80 border border-pastel-pink/30 focus:border-pastel-pink focus:ring-2 focus:ring-pastel-pink/30 text-pastel-cream placeholder-pastel-mauve text-center text-base sm:text-lg tracking-widest outline-none transition-all duration-200"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-pastel-pink/50">
                ♡
              </span>
            </div>
            <p className="font-sans text-[11px] text-pastel-mauve mt-1.5 text-center">
              hint: the day our lore officially began.
            </p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-midnight-surface/80 border border-pastel-rose/40 text-pastel-rose text-xs text-center font-sans flex items-center justify-center gap-2"
              >
                <span>😿</span>
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting || isUnlocked}
            className={`w-full py-3.5 px-6 rounded-2xl font-sans font-medium text-sm sm:text-base tracking-wide btn-3d shadow-3d-btn flex items-center justify-center gap-2 transition-all duration-300 ${
              isUnlocked
                ? 'bg-pastel-pink text-midnight-plum'
                : 'bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum'
            }`}
          >
            {isSubmitting ? (
              <span>checking with the stars...</span>
            ) : isUnlocked ? (
              <span>welcome home, lovebugs ♡ ✨</span>
            ) : (
              <>
                <span>unlock our universe ♡</span>
                <span className="font-pixel text-xs">→</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-pastel-pink/15 text-center">
          <p className="font-pixel text-[10px] text-pastel-mauve/70 uppercase tracking-widest">
            oops, midnight! • established in love
          </p>
        </div>
      </motion.div>
    </div>
  );
};
