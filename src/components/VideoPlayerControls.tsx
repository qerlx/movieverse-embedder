
import React from 'react';
import { ArrowLeft, Maximize, Minimize, SkipForward, Play, Volume, Volume1, Volume2, VolumeOff, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface VideoPlayerControlsProps {
  title: string;
  isFullscreen: boolean;
  hasNextEpisode: boolean;
  isPlaying?: boolean;
  volume?: number;
  onTogglePlay?: () => void;
  onToggleFullscreen: () => void;
  onGoBack: () => void;
  onNextEpisode: () => void;
  onVolumeChange?: (value: number) => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  title,
  isFullscreen,
  hasNextEpisode,
  isPlaying = false,
  volume = 1,
  onTogglePlay,
  onToggleFullscreen,
  onGoBack,
  onNextEpisode,
  onVolumeChange,
  onToggleMute,
  isMuted = false,
}) => {
  // Volume icon based on current level
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeOff size={16} />;
    if (volume < 0.3) return <Volume size={16} />;
    if (volume < 0.7) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  if (isFullscreen) {
    return (
      <div className="absolute top-0 left-0 w-full h-full z-30 flex flex-col justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
        {/* Top controls - visible when in fullscreen */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onGoBack}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft size={18} />
            <span className="ml-1">Back</span>
          </Button>
          
          <h1 className="text-lg font-medium text-white truncate">{title}</h1>
          
          <div className="flex gap-2">
            {hasNextEpisode && (
              <Button 
                variant="ghost"
                size="sm" 
                onClick={onNextEpisode}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <SkipForward size={16} />
                <span className="ml-1">Next</span>
              </Button>
            )}
            <Button 
              variant="ghost"
              size="sm" 
              onClick={onToggleFullscreen}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Minimize size={16} />
            </Button>
          </div>
        </div>
        
        {/* Bottom controls for fullscreen */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
          {onTogglePlay && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePlay}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {onToggleMute && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMute}
                className="text-white hover:bg-white/20 rounded-full w-8 h-8"
              >
                {getVolumeIcon()}
              </Button>
            )}
          </div>
        </div>
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
