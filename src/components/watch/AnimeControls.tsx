import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

interface AnimeControlsProps {
  isDub: boolean;
  onToggle: (isDub: boolean) => void;
}

export const AnimeControls: React.FC<AnimeControlsProps> = ({ isDub, onToggle }) => {
  return (
    <motion.div
      className="flex items-center gap-3 backdrop-blur-xl bg-card/90 rounded-full px-4 py-2 border border-border/50 shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Languages className="w-4 h-4 text-primary" aria-hidden="true" />
      <div className="flex gap-1 bg-muted/30 rounded-full p-1">
        <button
          onClick={() => onToggle(false)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            !isDub
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={!isDub}
          aria-label="Switch to subtitle version"
        >
          SUB
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
            isDub
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={isDub}
          aria-label="Switch to dubbed version"
        >
          DUB
        </button>
      </div>
    </motion.div>
  );
};
