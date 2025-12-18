import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MiniPlayerProps {
  isVisible: boolean;
  videoUrl: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv' | 'anime';
  mediaId: string | number;
  season?: number;
  episode?: number;
  onClose: () => void;
  onMaximize?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isVisible,
  videoUrl,
  title,
  posterUrl,
  mediaType,
  mediaId,
  season,
  episode,
  onClose,
  onMaximize
}) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handleMaximize = useCallback(() => {
    if (onMaximize) {
      onMaximize();
    } else {
      // Navigate to watch page
      if (mediaType === 'tv' && season && episode) {
        navigate(`/watch/tv/${mediaId}/${season}/${episode}`);
      } else if (mediaType === 'anime' && episode) {
        navigate(`/watch/anime/${mediaId}/${episode}`);
      } else {
        navigate(`/watch/movie/${mediaId}`);
      }
    }
    onClose();
  }, [mediaType, mediaId, season, episode, navigate, onMaximize, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-4 z-50 w-80 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Video Container */}
          <div className="relative w-full h-full bg-black">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={false}
                referrerPolicy="no-referrer"
              />
            ) : posterUrl ? (
              <img
                src={posterUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            {/* Controls Overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60"
                >
                  {/* Top controls */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white"
                      onClick={handleMaximize}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 bg-black/40 hover:bg-black/60 text-white"
                      onClick={onClose}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {title}
                    </p>
                    {mediaType === 'tv' && season && episode && (
                      <p className="text-white/60 text-xs">
                        Season {season} • Episode {episode}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drag handle indicator */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniPlayer;
