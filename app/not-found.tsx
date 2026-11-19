'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-midnight-plum stars-bg text-pastel-cream">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-glow-pink text-center space-y-4"
      >
        <div className="text-4xl animate-bounce">🎀</div>
        <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest block">
          404 • lost in the midnight cosmos
        </span>
        <h1 className="font-cormorant italic text-3xl sm:text-4xl font-bold text-pastel-cream">
          oops, wrong universe! ♡
        </h1>
        <p className="font-sans text-xs text-pastel-mauve leading-relaxed">
          this movie or corner doesn't seem to exist in our little cinema sanctuary.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum font-sans font-bold text-xs btn-3d shadow-3d-btn"
          >
            ← back to our cinema sanctuary ♡
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
