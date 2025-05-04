
import React from 'react';
import { ArrowLeft, SkipForward, Play, Volume, Volume1, Volume2, VolumeOff, Pause } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface VideoPlayerControlsProps {
  title: string;
  hasNextEpisode: boolean;
  isPlaying?: boolean;
  volume?: number;
  onTogglePlay?: () => void;
  onGoBack: () => void;
  onNextEpisode: () => void;
  onVolumeChange?: (value: number) => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  title,
  hasNextEpisode,
  isPlaying = false,
  volume = 1,
  onTogglePlay,
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

  return (
    <div className="absolute top-0 left-0 w-full h-full z-30 flex flex-col justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
      {/* Top controls */}
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
      </div>
      
      {/* Bottom controls */}
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
};

export default VideoPlayerControls;
