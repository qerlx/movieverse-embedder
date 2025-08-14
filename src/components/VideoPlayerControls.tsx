import React, { useCallback } from 'react';
import { ArrowLeft, Play, Volume, Volume1, Volume2, VolumeOff, Pause, Settings, Maximize } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface VideoPlayerControlsProps {
  title: string;
  hasNextEpisode?: boolean;
  isPlaying?: boolean;
  volume?: number;
  onTogglePlay?: () => void;
  onGoBack: () => void;
  onVolumeChange?: (value: number) => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  activeSource?: string;
  onFullscreen?: () => void;
  isVisible?: boolean;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  title,
  isPlaying = false,
  volume = 1,
  onTogglePlay,
  onGoBack,
  onToggleMute,
  isMuted = false,
  activeSource = 'vidora',
  onFullscreen,
  isVisible = true
}) => {
  // Volume icon based on current level with memoization
  const getVolumeIcon = useCallback(() => {
    if (isMuted || volume === 0) return <VolumeOff size={16} />;
    if (volume < 0.3) return <Volume size={16} />;
    if (volume < 0.7) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  }, [isMuted, volume]);

  const handleBackClick = useCallback(() => {
    onGoBack();
  }, [onGoBack]);

  const handlePlayToggle = useCallback(() => {
    onTogglePlay?.();
  }, [onTogglePlay]);

  const handleMuteToggle = useCallback(() => {
    onToggleMute?.();
  }, [onToggleMute]);

  const handleFullscreenClick = useCallback(() => {
    onFullscreen?.();
  }, [onFullscreen]);

  return (
    <motion.div 
      className="absolute top-0 left-0 w-full h-full z-30 flex flex-col justify-between pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top controls - Back button and title */}
      <motion.div 
        className="flex justify-start items-center p-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-auto"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost"
          size="sm" 
          onClick={handleBackClick}
          className="text-white hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          <span className="ml-1 font-medium">Back</span>
        </Button>
        
        <div className="ml-3 flex-1 min-w-0">
          <h1 className="text-base font-semibold text-white truncate mb-1">
            {title || 'Loading...'}
          </h1>
          {activeSource && activeSource !== 'vidora' && (
            <p className="text-xs text-white/70">
              Playing on {activeSource}
            </p>
          )}
        </div>
      </motion.div>
      
      {/* Bottom controls - Play/pause and volume */}
      <motion.div 
        className="p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between pointer-events-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          {onTogglePlay && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayToggle}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
          )}
          
          {onToggleMute && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {getVolumeIcon()}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreenClick}
              className="text-white hover:bg-white/20 rounded-full w-8 h-8 border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
              aria-label="Enter fullscreen"
            >
              <Maximize size={16} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full w-8 h-8 border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
            aria-label="Settings"
          >
            <Settings size={16} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPlayerControls;