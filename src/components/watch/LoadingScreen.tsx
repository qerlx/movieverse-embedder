import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Film } from 'lucide-react';

interface LoadingScreenProps {
  title?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ title }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <Film className="w-10 h-10 text-primary" aria-hidden="true" />
        </div>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Loading video player</p>
          {title && (
            <p className="text-sm text-muted-foreground mt-1 max-w-md line-clamp-2">
              {title}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        This may take a few moments...
      </motion.div>
    </motion.div>
  );
};
