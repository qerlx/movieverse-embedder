import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AutoAdvanceOverlayProps {
  isVisible: boolean;
  countdown: number;
  nextEpisode: {
    season: number;
    episode: number;
    name?: string;
  } | null;
  onSkip: () => void;
  onCancel: () => void;
}

export const AutoAdvanceOverlay: React.FC<AutoAdvanceOverlayProps> = ({
  isVisible,
  countdown,
  nextEpisode,
  onSkip,
  onCancel
}) => {
  if (!nextEpisode) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-24 right-6 z-40 max-w-sm"
        >
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Up Next</h4>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8 text-white/60 hover:text-white"
                  onClick={onCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-primary font-medium">
                  Season {nextEpisode.season} • Episode {nextEpisode.episode}
                </p>
                {nextEpisode.name && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-2">
                    {nextEpisode.name}
                  </p>
                )}
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 126, strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: (countdown / 10) * 126 }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
                    {countdown}
                  </span>
                </div>
                
                <p className="text-white/60 text-sm">
                  Starting in {countdown} seconds...
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={onSkip}
                  className="flex-1 gap-2"
                >
                  <Play className="w-4 h-4" />
                  Play Now
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutoAdvanceOverlay;
