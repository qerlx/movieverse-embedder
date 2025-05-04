
import React from 'react';
import { ArrowLeft, Maximize, Minimize, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface VideoPlayerControlsProps {
  title: string;
  isFullscreen: boolean;
  hasNextEpisode: boolean;
  onToggleFullscreen: () => void;
  onGoBack: () => void;
  onNextEpisode: () => void;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  title,
  isFullscreen,
  hasNextEpisode,
  onToggleFullscreen,
  onGoBack,
  onNextEpisode,
}) => {
  if (isFullscreen) {
    return (
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {hasNextEpisode && (
          <Button 
            variant="outline"
            size="sm" 
            onClick={onNextEpisode}
            className="bg-black/40 text-white border-white/10 hover:bg-black/60 hover:text-primary rounded-full"
          >
            <SkipForward size={16} />
            <span className="ml-1">Next</span>
          </Button>
        )}
        <Button 
          variant="outline"
          size="sm" 
          onClick={onToggleFullscreen}
          className="bg-black/40 text-white border-white/10 hover:bg-black/60 hover:text-primary rounded-full"
        >
          <Minimize size={16} />
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex items-center justify-between mb-6" 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoBack}
          className="flex items-center text-white hover:text-primary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </motion.button>
        <h1 className="text-xl font-medium text-white ml-4 truncate hidden sm:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {hasNextEpisode && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextEpisode}
            className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white px-3 py-1.5 rounded-full transition-colors shadow-lg hover:shadow-primary/30"
          >
            <span className="hidden sm:inline">Next Episode</span>
            <SkipForward size={18} />
          </motion.button>
        )}
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleFullscreen}
          className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full transition-colors shadow-lg"
        >
          {isFullscreen ? (
            <>
              <Minimize size={18} />
              <span className="hidden sm:inline">Exit Full Screen</span>
            </>
          ) : (
            <>
              <Maximize size={18} />
              <span className="hidden sm:inline">Full Screen</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default VideoPlayerControls;
