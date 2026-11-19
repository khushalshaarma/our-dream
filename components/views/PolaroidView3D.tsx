'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Plus, X, Download, Trash2, Heart, Sparkles } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface PolaroidItem {
  id: string;
  filename: string;
  caption: string;
  date_taken: string;
  movie_id: string | null;
  uploaded_by: string;
  created_at: number;
}

interface PolaroidView3DProps {
  movies: any[];
  activeUser: string;
}

export const PolaroidView3D: React.FC<PolaroidView3DProps> = ({ movies, activeUser }) => {
  const [polaroids, setPolaroids] = useState<PolaroidItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPolaroid, setSelectedPolaroid] = useState<PolaroidItem | null>(null);

  // Upload Form
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [dateTaken, setDateTaken] = useState(() =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  );
  const [associatedMovieId, setAssociatedMovieId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadPolaroids = async () => {
    try {
      const res = await fetch('/api/polaroids');
      if (res.ok) {
        const data = await res.json();
        setPolaroids(data.polaroids || []);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadPolaroids();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      sound.playCameraShutter();
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isUploading) return;

    setIsUploading(true);
    sound.playCameraShutter();

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption.trim());
      formData.append('date_taken', dateTaken);
      if (associatedMovieId) formData.append('movie_id', associatedMovieId);

      const res = await fetch('/api/polaroids', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        sound.playStarChime();
        setIsUploadOpen(false);
        setFile(null);
        setPreviewUrl(null);
        setCaption('');
        loadPolaroids();

        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#F4A9C5', '#C8B3F5', '#FFF0D7'],
        });
      }
    } catch {
      // Ignore
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo memory from our scrapbook? ♡')) return;
    sound.playWrongBoop();
    try {
      await fetch(`/api/polaroids/${id}`, { method: 'DELETE' });
      setSelectedPolaroid(null);
      loadPolaroids();
    } catch {
      // Ignore
    }
  };

  const rotations = [-2.5, 1.8, -1.5, 2.5, -2, 1.2];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-pastel-pink text-sm">📸</span>
            <span className="font-pixel text-xs text-pastel-pink tracking-widest uppercase">
              the polaroid corner
            </span>
          </div>
          <h1 className="font-cormorant italic text-4xl sm:text-5xl text-pastel-cream font-bold leading-tight">
            our photo memories.
          </h1>
          <p className="font-sans text-xs sm:text-sm text-pastel-mauve mt-1">
            selfies, cozy snacks & movie night keepsakes. ({polaroids.length} memories saved)
          </p>
        </div>

        <button
          onClick={() => {
            sound.playHeartPop();
            setIsUploadOpen(true);
          }}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pastel-pink via-pastel-rose to-pastel-lilac text-midnight-plum font-sans font-bold text-sm btn-3d shadow-3d-btn flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Camera className="w-4 h-4 text-midnight-plum" />
          <span>+ add a little memory</span>
        </button>
      </div>

      {/* 3D Polaroid Photo Wall */}
      {polaroids.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-4">
          {polaroids.map((item, idx) => {
            const rot = rotations[idx % rotations.length];
            return (
              <Card3D key={item.id} depth={12}>
                <div
                  style={{ rotate: `${rot}deg` }}
                  onClick={() => {
                    sound.playCameraShutter();
                    setSelectedPolaroid(item);
                  }}
                  className="bg-[#FFF8EE] text-[#24152F] p-3 pb-6 rounded-md shadow-polaroid border border-amber-900/10 cursor-pointer transition-all duration-300 relative group flex flex-col justify-between"
                >
                  {/* Washi tape sticker at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-pastel-pink/60 backdrop-blur-sm -rotate-2 rounded-sm shadow-sm pointer-events-none" />

                  {/* Photo container */}
                  <div className="w-full aspect-square bg-[#1C1126] overflow-hidden rounded-sm relative border border-black/10">
                    <img
                      src={`/api/uploads/${item.filename}`}
                      alt={item.caption || 'Polaroid'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 sepia-[0.25]"
                    />
                  </div>

                  {/* Handwritten caption */}
                  <div className="mt-3 px-1 text-center font-sans space-y-1">
                    <p className="text-xs font-semibold text-[#24152F] line-clamp-2 leading-tight">
                      {item.caption || 'midnight movie memory ♡'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#24152F]/60 font-pixel pt-1">
                      <span>{item.date_taken}</span>
                      <span>by {item.uploaded_by}</span>
                    </div>
                  </div>

                  <span className="absolute bottom-1 right-2 text-xs text-pastel-pink opacity-80">
                    ♡
                  </span>
                </div>
              </Card3D>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl glass-panel-3d border border-pastel-pink/20 max-w-md mx-auto space-y-3">
          <div className="text-4xl animate-bounce">📸</div>
          <h3 className="font-cormorant italic text-3xl text-pastel-cream font-bold">
            the scrapbook is feeling camera shy ♡
          </h3>
          <p className="font-sans text-xs text-pastel-mauve">
            no photos uploaded yet! snap a picture from tonight's movie date and add it here.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-pastel-pink text-midnight-plum font-sans font-bold text-xs shadow-glow-pink"
          >
            + add our first polaroid ♡
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl glass-panel-3d border border-pastel-pink/40 shadow-glow-pink my-8"
          >
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-midnight-surface border border-pastel-pink/20 hover:border-pastel-pink text-pastel-cream"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5">
              <span className="font-pixel text-[10px] text-pastel-pink uppercase tracking-widest block mb-1">
                scrapbook keepsake
              </span>
              <h2 className="font-cormorant italic text-3xl text-pastel-cream font-bold">
                + add a little memory
              </h2>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <label className="block border-2 border-dashed border-pastel-pink/40 hover:border-pastel-pink rounded-2xl p-6 text-center cursor-pointer bg-midnight-aubergine/60 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-44 rounded-xl object-contain border border-pastel-pink/30"
                    />
                    <span className="font-pixel text-[10px] text-pastel-pink">
                      click to choose different photo
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-pastel-pink/15 text-pastel-pink mx-auto flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="font-sans text-xs text-pastel-cream">
                      click to upload tonight's movie picture ♡
                    </p>
                  </div>
                )}
              </label>

              <div>
                <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                  handwritten caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. ramen break halfway through the plot twist ♡"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-aubergine/80 border border-pastel-pink/20 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                    associated movie
                  </label>
                  <select
                    value={associatedMovieId}
                    onChange={(e) => setAssociatedMovieId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-midnight-aubergine/80 border border-pastel-pink/20 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                  >
                    <option value="">General Memory</option>
                    {movies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-pastel-pink uppercase mb-1">
                    date taken
                  </label>
                  <input
                    type="date"
                    value={dateTaken}
                    onChange={(e) => setDateTaken(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-midnight-aubergine/80 border border-pastel-pink/20 text-pastel-cream text-xs font-sans outline-none focus:border-pastel-pink"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-pastel-pink to-pastel-lilac text-midnight-plum font-sans font-bold text-xs btn-3d shadow-3d-btn flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isUploading ? 'saving memory...' : 'save polaroid memory ♡'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="py-3 px-4 rounded-2xl glass-card text-pastel-cream text-xs font-sans"
                >
                  cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Enlarged View Modal */}
      {selectedPolaroid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-md w-full bg-[#FFF8EE] text-[#24152F] p-4 sm:p-6 pb-6 rounded-lg shadow-2xl space-y-4"
          >
            <button
              onClick={() => setSelectedPolaroid(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-midnight-surface text-pastel-cream border border-pastel-pink/40 hover:text-pastel-pink shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-full aspect-square bg-[#1C1126] overflow-hidden rounded border border-black/15 shadow-inner">
              <img
                src={`/api/uploads/${selectedPolaroid.filename}`}
                alt={selectedPolaroid.caption}
                className="w-full h-full object-contain sepia-[0.25]"
              />
            </div>

            <div className="text-center space-y-1 font-sans">
              <h3 className="text-lg font-bold text-[#24152F] leading-tight">
                {selectedPolaroid.caption}
              </h3>
              <p className="text-[11px] text-[#24152F]/70 font-pixel">
                {selectedPolaroid.date_taken} • by {selectedPolaroid.uploaded_by} ♡
              </p>
            </div>

            <div className="pt-2 border-t border-black/10 flex items-center justify-between">
              <a
                href={`/api/uploads/${selectedPolaroid.filename}`}
                download={`polaroid_${selectedPolaroid.filename}`}
                className="px-3 py-1.5 rounded-lg bg-[#24152F] text-pastel-cream text-xs font-sans font-medium hover:bg-midnight-surface transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>download photo</span>
              </a>

              <button
                onClick={() => handleDelete(selectedPolaroid.id)}
                className="p-1.5 text-red-600 hover:text-red-800 text-xs font-sans transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>remove</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
