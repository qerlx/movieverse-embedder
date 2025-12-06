import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TransitionData {
  posterUrl: string;
  title: string;
  type: 'movie' | 'tv';
  id: number;
  destinationPath: string;
}

interface PageTransitionContextType {
  triggerTransition: (data: TransitionData) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within PageTransitionProvider');
  }
  return context;
};

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<TransitionData | null>(null);
  const [phase, setPhase] = useState<'idle' | 'zoomIn' | 'fadeOut' | 'fadeIn'>('idle');
  const navigate = useNavigate();

  const triggerTransition = useCallback((data: TransitionData) => {
    setTransitionData(data);
    setIsTransitioning(true);
    setPhase('zoomIn');

    // Phase 1: Zoom in with blur (800ms)
    setTimeout(() => {
      setPhase('fadeOut');
    }, 800);

    // Phase 2: Fade to black (400ms)
    setTimeout(() => {
      navigate(data.destinationPath);
      setPhase('fadeIn');
    }, 1200);

    // Phase 3: Fade in new page (600ms)
    setTimeout(() => {
      setPhase('idle');
      setIsTransitioning(false);
      setTransitionData(null);
    }, 1800);
  }, [navigate]);

  return (
    <PageTransitionContext.Provider value={{ triggerTransition }}>
      {children}
      
      <AnimatePresence>
        {isTransitioning && transitionData && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Blurred background overlay */}
            <motion.div
              className="absolute inset-0 bg-background"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: phase === 'fadeOut' || phase === 'fadeIn' ? 1 : 0.7,
                backdropFilter: phase === 'zoomIn' ? 'blur(20px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Poster zoom animation */}
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center"
              initial={{ scale: 0.3, opacity: 0, y: 100 }}
              animate={{
                scale: phase === 'zoomIn' ? 1 : phase === 'fadeOut' ? 1.1 : 0,
                opacity: phase === 'fadeOut' ? 0 : 1,
                y: 0,
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {/* Poster with glow effect */}
              <motion.div
                className="relative"
                animate={{
                  boxShadow: phase === 'zoomIn' 
                    ? '0 0 100px 20px hsl(var(--primary) / 0.5)' 
                    : '0 0 0px 0px transparent'
                }}
                transition={{ duration: 0.6 }}
              >
                <motion.img
                  src={transitionData.posterUrl}
                  alt={transitionData.title}
                  className="w-48 md:w-64 lg:w-80 rounded-2xl shadow-2xl object-cover aspect-[2/3]"
                  initial={{ filter: 'brightness(0.5)' }}
                  animate={{ 
                    filter: phase === 'zoomIn' ? 'brightness(1.1)' : 'brightness(0.3)'
                  }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl"
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ 
                    x: phase === 'zoomIn' ? '100%' : '-100%',
                    opacity: phase === 'zoomIn' ? 1 : 0
                  }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </motion.div>

              {/* Title animation */}
              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: phase === 'zoomIn' ? 1 : 0,
                  y: phase === 'zoomIn' ? 0 : 30
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h2
                  className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground drop-shadow-2xl"
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                >
                  {transitionData.title}
                </motion.h2>
                
                <motion.div
                  className="mt-4 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase === 'zoomIn' ? 1 : 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-muted-foreground text-sm uppercase tracking-widest">
                    Loading
                  </span>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Final black overlay for fade out */}
            <motion.div
              className="absolute inset-0 bg-background pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: phase === 'fadeOut' ? 1 : phase === 'fadeIn' ? 0 : 0
              }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransitionContext.Provider>
  );
};
