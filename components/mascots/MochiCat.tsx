'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MochiCatProps {
  mood?: 'sleeping' | 'sitting' | 'excited';
  size?: number;
  interactive?: boolean;
  className?: string;
}

const CAT_QUOTES = [
  "can you two pick a movie already? it's 2 AM.",
  "Khushal is gonna fall asleep in the first 20 minutes, let's be honest.",
  "Tanushree just added 5 more 3-hour indie films to the list...",
  "I demand fresh tuna and emotional stability.",
  "same two idiots. different movie. every single night.",
  "purrrr... tick off another movie already ♡",
];

export const MochiCat: React.FC<MochiCatProps> = ({
  mood = 'sitting',
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
    const q = CAT_QUOTES[(nextCount - 1) % CAT_QUOTES.length];
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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 min-w-[200px] max-w-[240px] p-2.5 rounded-xl bg-midnight-aubergine/95 border border-pastel-pink/50 text-pastel-cream text-xs font-sans shadow-glow-pink text-center backdrop-blur-md"
          >
            <div className="font-pixel text-[10px] text-pastel-pink mb-0.5">mochi says:</div>
            {quote}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-pastel-pink/50" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={interactive ? { scale: 1.1, y: -3 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onClick={handleClick}
        className={`cursor-pointer ${interactive ? 'hover:drop-shadow-[0_0_8px_rgba(244,169,197,0.6)]' : ''}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full pixel-art">
          <ellipse cx="16" cy="29" rx="10" ry="2.5" fill="rgba(15, 7, 21, 0.45)" />
          <path d="M24 23 C27 23 29 20 28 17 C27 15 25 17 25 19" stroke="#190F22" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="10" y="15" width="12" height="12" rx="5" fill="#1C1126" stroke="#2D1B3E" strokeWidth="1" />
          <circle cx="16" cy="13" r="7" fill="#1C1126" stroke="#2D1B3E" strokeWidth="1" />
          <polygon points="10,9 13,6 14,10" fill="#1C1126" />
          <polygon points="10.5,8.5 12.5,6.5 13.5,9.5" fill="#E89AA7" />
          <polygon points="22,9 19,6 18,10" fill="#1C1126" />
          <polygon points="21.5,8.5 19.5,6.5 18.5,9.5" fill="#E89AA7" />
          <path d="M10 7 C9 6 8 8 10 9 C11 8 12 6 10 7 Z" fill="#F4A9C5" />
          <circle cx="10" cy="7.5" r="1.2" fill="#FFF0D7" />
          {mood === 'sleeping' ? (
            <>
              <path d="M12.5 13 Q14 15 15.5 13" stroke="#F4A9C5" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M16.5 13 Q18 15 19.5 13" stroke="#F4A9C5" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="13.5" cy="13" rx="1.8" ry="2.2" fill="#FFF0D7" />
              <circle cx="13.8" cy="12.8" r="1" fill="#24152F" />
              <circle cx="14.2" cy="12.4" r="0.4" fill="#FFFFFF" />
              <ellipse cx="18.5" cy="13" rx="1.8" ry="2.2" fill="#FFF0D7" />
              <circle cx="18.2" cy="12.8" r="1" fill="#24152F" />
              <circle cx="18.6" cy="12.4" r="0.4" fill="#FFFFFF" />
            </>
          )}
          <polygon points="16,15 15.3,14.4 16.7,14.4" fill="#F4A9C5" />
          <circle cx="11.5" cy="14.8" r="1.4" fill="#F4A9C5" opacity="0.6" />
          <circle cx="20.5" cy="14.8" r="1.4" fill="#F4A9C5" opacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
};
