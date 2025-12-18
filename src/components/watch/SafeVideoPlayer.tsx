import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RefreshCw, AlertTriangle, Loader2, Shield, 
  Volume2, VolumeX, Maximize, ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SafeVideoPlayerProps {
  videoUrl: string;
  title: string;
  onLoad?: () => void;
  onError?: () => void;
  onSourceChange?: () => void;
  className?: string;
  autoRetry?: boolean;
  loadTimeout?: number;
}

type PlayerState = 'loading' | 'ready' | 'error' | 'timeout';

export const SafeVideoPlayer: React.FC<SafeVideoPlayerProps> = ({
  videoUrl,
  title,
  onLoad,
  onError,
  onSourceChange,
  className,
  autoRetry = true,
  loadTimeout = 15000
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadStartRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [showClickShield, setShowClickShield] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [loadTime, setLoadTime] = useState<number | null>(null);

  // Reset state when URL changes
  useEffect(() => {
    setPlayerState('loading');
    setShowClickShield(true);
    setRetryCount(0);
    loadStartRef.current = Date.now();

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set load timeout
    timeoutRef.current = setTimeout(() => {
      if (playerState === 'loading') {
        setPlayerState('timeout');
        onError?.();
      }
    }, loadTimeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoUrl, loadTimeout]);

  const handleIframeLoad = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const elapsed = Date.now() - loadStartRef.current;
    setLoadTime(elapsed);
    setPlayerState('ready');
    
    // Remove click shield after short delay to prevent accidental clicks
    setTimeout(() => {
      setShowClickShield(false);
    }, 1000);
    
    onLoad?.();
  }, [onLoad]);

  const handleIframeError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setPlayerState('error');
    onError?.();
  }, [onError]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setPlayerState('loading');
    loadStartRef.current = Date.now();
    
    // Force iframe reload by temporarily removing src
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (playerState === 'loading') {
        setPlayerState('timeout');
        onError?.();
      }
    }, loadTimeout);
  }, [loadTimeout, onError]);

  const handleClickShieldClick = useCallback(() => {
    setShowClickShield(false);
  }, []);

  const handleTryBestSource = useCallback(() => {
    onSourceChange?.();
  }, [onSourceChange]);

  if (!videoUrl) return null;

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      {/* Video iframe */}
      <motion.iframe
        ref={iframeRef}
        src={videoUrl}
        title={title}
        className={cn(
          "w-full h-full absolute inset-0 transition-opacity duration-300",
          playerState === 'ready' ? 'opacity-100' : 'opacity-0'
        )}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />

      {/* Click Shield Overlay - prevents malicious redirects */}
      <AnimatePresence>
        {showClickShield && playerState === 'ready' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={handleClickShieldClick}
          >
            {/* Subtle indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-3 bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Play className="w-8 h-8 text-primary fill-primary" />
                </div>
                <p className="text-white/90 font-medium">Click to Start</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Shield className="w-3 h-3" />
                  <span>Protected playback</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {playerState === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background"
          >
            <div className="relative mb-8">
              {/* Animated loading ring */}
              <motion.div
                className="w-20 h-20 rounded-full border-4 border-primary/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <motion.div
              className="text-center space-y-2"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-foreground">Loading Player</h3>
              <p className="text-sm text-muted-foreground max-w-xs line-clamp-1">{title}</p>
              {retryCount > 0 && (
                <p className="text-xs text-warning">Retry attempt {retryCount}</p>
              )}
            </motion.div>

            {/* Loading progress indicator */}
            <motion.div
              className="mt-6 w-48 h-1 bg-muted/30 rounded-full overflow-hidden"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: loadTimeout / 1000, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Timeout State */}
      <AnimatePresence>
        {(playerState === 'error' || playerState === 'timeout') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-background"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center space-y-6 max-w-md px-6"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  {playerState === 'timeout' ? 'Taking too long' : 'Playback Error'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {playerState === 'timeout' 
                    ? 'The video source is slow to respond. Try a different source or retry.'
                    : 'Unable to load the video. The source may be unavailable.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleRetry}
                  className="gap-2"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
                
                {onSourceChange && (
                  <Button
                    onClick={handleTryBestSource}
                    variant="outline"
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Try Best Source
                  </Button>
                )}
              </div>

              {retryCount >= 2 && (
                <p className="text-xs text-muted-foreground">
                  Tip: Try switching to a different source for better results
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load time indicator (dev/debug) */}
      {loadTime !== null && playerState === 'ready' && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-40 text-xs text-white/50 bg-black/50 px-2 py-1 rounded">
          Loaded in {(loadTime / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
};

export default SafeVideoPlayer;
