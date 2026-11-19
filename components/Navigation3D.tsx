'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Film, CalendarDays, Camera, Volume2, VolumeX, Lock } from 'lucide-react';
import { sound } from '@/lib/audio';

export type ActiveTab = 'dashboard' | 'calendar' | 'polaroids';

interface Navigation3DProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeUser: string;
  onLockUniverse: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const TABS: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: '🎬 Checklist & Cinema', icon: Film },
  { id: 'calendar', label: '📅 Midnight Calendar', icon: CalendarDays },
  { id: 'polaroids', label: '📸 Polaroid Scrapbook', icon: Camera },
];

export const Navigation3D: React.FC<Navigation3DProps> = ({
  currentTab,
  onSelectTab,
  activeUser,
  onLockUniverse,
  soundEnabled,
  onToggleSound,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    sound.playHeartPop();
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full px-4 py-3 bg-midnight-plum/85 backdrop-blur-md border-b border-pastel-pink/20 flex items-center justify-between">
      {/* Brand */}
      <div
        onClick={() => handleTabClick('dashboard')}
        className="flex items-center gap-2.5 cursor-pointer group select-none"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">🎀</span>
        <div>
          <div className="font-cormorant italic text-xl font-bold text-pastel-cream group-hover:text-pastel-pink transition-colors leading-tight">
            oops, midnight!
          </div>
          <div className="font-pixel text-[9px] text-pastel-mauve tracking-wider hidden sm:block">
            same two idiots. different movie. every night.
          </div>
        </div>
      </div>

      {/* 3D Glass Navigation Pill */}
      <nav className="flex items-center gap-1.5 p-1.5 rounded-full bg-midnight-surface/90 border border-pastel-pink/30 shadow-3d-card">
        {TABS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative px-4 py-1.5 rounded-full font-sans text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 select-none ${
                isActive
                  ? 'text-midnight-plum font-bold'
                  : 'text-pastel-cream/80 hover:text-pastel-pink hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac shadow-glow-pink -z-10"
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right controls: Sound & Lock */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Cute Sounds'}
          className="p-2 rounded-full bg-midnight-surface/90 border border-pastel-pink/25 hover:border-pastel-pink text-pastel-cream/80 hover:text-pastel-pink transition-all shadow-sm"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-pastel-pink" />
          ) : (
            <VolumeX className="w-4 h-4 text-pastel-mauve" />
          )}
        </button>

        <button
          onClick={onLockUniverse}
          title="Lock our universe ♡"
          className="p-2 rounded-full bg-midnight-surface/90 border border-pastel-pink/25 hover:border-pastel-rose text-pastel-cream/80 hover:text-pastel-rose transition-all shadow-sm"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
