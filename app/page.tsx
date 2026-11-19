'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SecretEntrance } from '@/components/SecretEntrance';
import { Navigation3D, ActiveTab } from '@/components/Navigation3D';
import { MainDashboard3D } from '@/components/views/MainDashboard3D';
import { CalendarView3D } from '@/components/views/CalendarView3D';
import { PolaroidView3D } from '@/components/views/PolaroidView3D';
import { sound } from '@/lib/audio';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeUser, setActiveUser] = useState<string>('Tanushree');
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [movies, setMovies] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());

    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setActiveUser(data.userName || 'Tanushree');
          loadMovies();
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const loadMovies = async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch {
      // Ignore
    }
  };

  const handleUnlockSuccess = (user: string) => {
    setIsAuthenticated(true);
    setActiveUser(user || 'Tanushree');
    setCurrentTab('dashboard'); // Immediate landing on the 3D Movie Checklist Dashboard!
    loadMovies();
  };

  const handleLockUniverse = async () => {
    sound.playHeartPop();
    try {
      await fetch('/api/auth/lock', { method: 'POST' });
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setCurrentTab('dashboard');
  };

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-midnight-plum stars-bg">
        <div className="text-center space-y-3">
          <div className="text-4xl animate-bounce">🎀</div>
          <p className="font-cormorant italic text-2xl text-pastel-cream">
            romanticizing our buffering era...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SecretEntrance onUnlock={handleUnlockSuccess} />;
  }

  return (
    <div className="min-h-screen bg-midnight-plum text-pastel-cream stars-bg relative flex flex-col justify-between selection:bg-pastel-pink/30">


      {/* 3D Navigation Header */}
      <Navigation3D
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeUser={activeUser}
        onLockUniverse={handleLockUniverse}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main 3D Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {currentTab === 'dashboard' && (
              <MainDashboard3D
                movies={movies}
                onRefresh={loadMovies}
                activeUser={activeUser}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView3D onRefresh={loadMovies} />
            )}

            {currentTab === 'polaroids' && (
              <PolaroidView3D movies={movies} activeUser={activeUser} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-pastel-pink/10 text-xs font-sans text-pastel-mauve select-none">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span>🎀</span>
          <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest">
            oops, midnight!
          </span>
          <span>🎀</span>
        </div>
        <p className="italic">
          same two idiots. different movie. every night.
        </p>
        <p className="text-[10px] opacity-70 mt-1">
          made with love, caffeine & a severely questionable sleep schedule. ♡
        </p>
      </footer>
    </div>
  );
}
