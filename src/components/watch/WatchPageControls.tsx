import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SourceSwitcher } from './SourceSwitcher';
import { AnimeControls } from './AnimeControls';

interface WatchPageControlsProps {
  title: string;
  currentSourceId: string;
  isAnime: boolean;
  animeDub?: boolean;
  onBack: () => void;
  onSourceSwitch: (sourceId: string) => void;
  onAnimeDubToggle?: (isDub: boolean) => void;
}

export const WatchPageControls: React.FC<WatchPageControlsProps> = ({
  title,
  currentSourceId,
  isAnime,
  animeDub = false,
  onBack,
  onSourceSwitch,
  onAnimeDubToggle,
}) => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={onBack}
          className="backdrop-blur-xl bg-card/90 hover:bg-card border border-border/50 shadow-lg rounded-full h-10 w-10"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      <motion.h1
        className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-foreground drop-shadow-lg line-clamp-1 max-w-md text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h1>

      <div className="flex items-center gap-2">
        <SourceSwitcher
          currentSourceId={currentSourceId}
          onSwitch={onSourceSwitch}
          isAnime={isAnime}
        />
        {isAnime && onAnimeDubToggle && (
          <AnimeControls isDub={animeDub} onToggle={onAnimeDubToggle} />
        )}
      </div>
    </motion.div>
  );
};
