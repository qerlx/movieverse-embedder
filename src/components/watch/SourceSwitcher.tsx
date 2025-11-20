import React from 'react';
import { motion } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { videoSources } from '@/utils/video';

interface SourceSwitcherProps {
  currentSourceId: string;
  onSwitch: (sourceId: string) => void;
  isAnime?: boolean;
}

export const SourceSwitcher: React.FC<SourceSwitcherProps> = ({
  currentSourceId,
  onSwitch,
  isAnime = false,
}) => {
  const availableSources = isAnime
    ? videoSources.filter(s => s.supportsAnime)
    : videoSources;

  return (
    <motion.div
      className="flex items-center gap-2 backdrop-blur-xl bg-card/90 rounded-full px-4 py-2 border border-border/50 shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Monitor className="w-4 h-4 text-primary" aria-hidden="true" />
      <select
        value={currentSourceId}
        onChange={(e) => onSwitch(e.target.value)}
        className="bg-transparent text-sm font-medium text-foreground border-none outline-none focus:ring-0 cursor-pointer"
        aria-label="Select video source"
      >
        {availableSources.map((source) => (
          <option key={source.id} value={source.id} className="bg-card text-foreground">
            {source.name}
          </option>
        ))}
      </select>
    </motion.div>
  );
};
