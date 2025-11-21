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
      className="flex items-center gap-3 backdrop-blur-xl bg-card/95 rounded-2xl px-5 py-3 border border-primary/20 shadow-[0_8px_32px_rgba(147,51,234,0.15)]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Monitor className="w-5 h-5 text-primary" aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium">Video Source</span>
        <select
          value={currentSourceId}
          onChange={(e) => onSwitch(e.target.value)}
          className="bg-transparent text-sm font-semibold text-foreground border-none outline-none focus:ring-0 cursor-pointer -ml-1 mt-0.5"
          aria-label="Select video source"
        >
          {availableSources.map((source) => (
            <option key={source.id} value={source.id} className="bg-card text-foreground py-2">
              {source.name}
            </option>
          ))}
        </select>
      </div>
    </motion.div>
  );
};
