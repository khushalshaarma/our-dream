'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PuddingBunnyProps {
  mood?: 'idle' | 'celebrating' | 'sleeping';
  size?: number;
  interactive?: boolean;
  className?: string;
}

const BUNNY_QUOTES = [
  "another movie ticked off? you guys are genuinely obsessed ♡",
  "I officially stamp this movie night as 100% pure romance.",
  "sleep schedule? never heard of her.",
  "did someone say strawberry popcorn?",
];

export const PuddingBunny: React.FC<PuddingBunnyProps> = ({
  mood = 'idle',
  size = 56,
  interactive = true,
  className = '',
}) => {
  const [clickCount, setClickCount] = useState(0);
  const [quote, setQuote] = useState<string | null>(null);

  const handleClick = () => {
    if (!interactive) return;
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    const q = BUNNY_QUOTES[(nextCount - 1) % BUNNY_QUOTES.length];
    setQuote(q);
    setTimeout(() => setQuote(null), 3500);
  };

  return (
    <div className={`relative inline-block select-none ${className}`}>
      <AnimatePresence>
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 min-w-[200px] max-w-[240px] p-2.5 rounded-xl bg-midnight-aubergine/95 border border-pastel-lilac/50 text-pastel-cream text-xs font-sans shadow-glow-lilac text-center backdrop-blur-md"
          >
            <div className="font-pixel text-[10px] text-pastel-lilac mb-0.5">pudding says:</div>
            {quote}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-pastel-lilac/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={interactive ? { scale: 1.1, y: -3 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onClick={handleClick}
        className={`cursor-pointer ${interactive ? 'hover:drop-shadow-[0_0_8px_rgba(200,179,245,0.6)]' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full pixel-art">
          <ellipse cx="16" cy="29" rx="10" ry="2.5" fill="rgba(15, 7, 21, 0.45)" />
          <rect x="11" y="4" width="3.5" height="10" rx="2" fill="#FFF0D7" stroke="#E89AA7" strokeWidth="0.8" />
          <rect x="12" y="6" width="1.5" height="6" rx="1" fill="#C8B3F5" opacity="0.8" />
          <rect x="17.5" y="4" width="3.5" height="10" rx="2" fill="#FFF0D7" stroke="#E89AA7" strokeWidth="0.8" />
          <rect x="18.5" y="6" width="1.5" height="6" rx="1" fill="#C8B3F5" opacity="0.8" />
          <rect x="9.5" y="16" width="13" height="12" rx="6" fill="#FFF0D7" stroke="#E89AA7" strokeWidth="0.8" />
          <circle cx="16" cy="15" r="7" fill="#FFF0D7" stroke="#E89AA7" strokeWidth="0.8" />
          <path d="M14.5 10 C13.5 9 13.5 11 14.5 11.5 Z" fill="#C8B3F5" />
          <path d="M17.5 10 C18.5 9 18.5 11 17.5 11.5 Z" fill="#C8B3F5" />
          <circle cx="16" cy="10.5" r="1" fill="#F4A9C5" />
          <circle cx="13.5" cy="14.8" r="1.5" fill="#4B213D" />
          <circle cx="14" cy="14.3" r="0.5" fill="#FFFFFF" />
          <circle cx="18.5" cy="14.8" r="1.5" fill="#4B213D" />
          <circle cx="19" cy="14.3" r="0.5" fill="#FFFFFF" />
          <circle cx="11.5" cy="16.5" r="1.6" fill="#F4A9C5" opacity="0.7" />
          <circle cx="20.5" cy="16.5" r="1.6" fill="#F4A9C5" opacity="0.7" />
          <polygon points="16,16.5 15.3,16 16.7,16" fill="#F4A9C5" />
          <path d="M15.4 17.2 Q16 17.8 16.6 17.2" stroke="#E89AA7" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>
    </div>
  );
};
