'use client';

import React, { useEffect, useRef } from 'react';

interface Sparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  char: string;
  color: string;
  vx: number;
  vy: number;
}

const SPARKLE_CHARS = ['✦', '♡', '⋆', '✧', '｡'];
const SPARKLE_COLORS = ['#F4A9C5', '#C8B3F5', '#FFF0D7', '#B6E7DC'];

export const CustomCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sparkles: Sparkle[] = [];
    let animationFrameId: number | null = null;
    let isLoopRunning = false;
    let lastSparkleTime = 0;

    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const renderLoop = () => {
      const cvs = canvasRef.current;
      if (!cvs || !ctx) {
        isLoopRunning = false;
        return;
      }

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const sp = sparkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.025;

        if (sp.alpha <= 0) {
          sparkles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.alpha);
        ctx.font = `${sp.size}px monospace`;
        ctx.fillStyle = sp.color;
        ctx.fillText(sp.char, sp.x, sp.y);
        ctx.restore();
      }

      if (sparkles.length > 0) {
        animationFrameId = requestAnimationFrame(renderLoop);
      } else {
        isLoopRunning = false;
        animationFrameId = null;
      }
    };

    const startLoopIfNeeded = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      // Spawn gentle dreamy trail behind the bow hand
      if (now - lastSparkleTime > 40) {
        lastSparkleTime = now;
        if (sparkles.length < 14) {
          sparkles.push({
            x: e.clientX + 14 + (Math.random() * 6 - 3),
            y: e.clientY + 18 + (Math.random() * 6 - 3),
            size: Math.random() * 4 + 9,
            alpha: 0.85,
            char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
            color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
            vx: (Math.random() - 0.5) * 0.6,
            vy: Math.random() * 0.6 + 0.3,
          });
          startLoopIfNeeded();
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Adorable mini star & heart burst on click
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + (Math.random() - 0.5) * 0.5;
        const speed = Math.random() * 2.2 + 1.2;
        sparkles.push({
          x: e.clientX + 4,
          y: e.clientY + 4,
          size: Math.random() * 4 + 11,
          alpha: 1.0,
          char: i % 2 === 0 ? '♡' : '✦',
          color: i % 2 === 0 ? '#F4A9C5' : '#FFF0D7',
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
      startLoopIfNeeded();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] select-none"
    />
  );
};
