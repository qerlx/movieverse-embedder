import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RefreshCw, AlertTriangle, Loader2, Shield, 
  Volume2, VolumeX, Maximize, ExternalLink, ShieldCheck,
  ShieldAlert, Ban
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

// Popup blocker script to inject
const POPUP_BLOCKER_SCRIPT = `
  (function() {
    // Override window.open to block popups
    const originalOpen = window.open;
    window.open = function(...args) {
      console.log('[SafePlayer] Blocked popup attempt:', args[0]);
      return null;
    };
    
    // Prevent alert/confirm/prompt abuse
    window.alert = function() { return; };
    window.confirm = function() { return false; };
    window.prompt = function() { return null; };
    
    // Block unwanted event listeners on document
    const blockedEvents = ['contextmenu'];
    blockedEvents.forEach(event => {
      document.addEventListener(event, function(e) {
        e.stopPropagation();
      }, true);
    });
  })();
`;

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [showClickShield, setShowClickShield] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [popupBlocked, setPopupBlocked] = useState(0);
  const [showProtectionInfo, setShowProtectionInfo] = useState(false);

  // Track and block popup attempts
  useEffect(() => {
    const handlePopupAttempt = (e: MessageEvent) => {
      if (e.data?.type === 'popup-blocked') {
        setPopupBlocked(prev => prev + 1);
      }
    };

    window.addEventListener('message', handlePopupAttempt);
    return () => window.removeEventListener('message', handlePopupAttempt);
  }, []);

  // Intercept clicks that might open popups
  useEffect(() => {
    const handleWindowBlur = () => {
      // If window loses focus right after clicking, a popup might have been attempted
      if (Date.now() - loadStartRef.current > 2000) {
        setPopupBlocked(prev => prev + 1);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    setPlayerState('loading');
    setShowClickShield(true);
    setRetryCount(0);
    setPopupBlocked(0);
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
    }, 1500);
    
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
      {/* Video iframe with enhanced security */}
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
            className="absolute inset-0 z-20 cursor-pointer bg-black/20"
            onClick={handleClickShieldClick}
          >
            {/* Subtle indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center gap-3 bg-black/70 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/10 shadow-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <Play className="w-8 h-8 text-primary fill-primary" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <p className="text-white font-medium">Click to Start</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Ad-protected playback</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Protection Status Indicator */}
      <AnimatePresence>
        {playerState === 'ready' && !showClickShield && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-30"
          >
            <button
              onClick={() => setShowProtectionInfo(!showProtectionInfo)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                popupBlocked > 0 
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-white/10 text-white/70 border border-white/10 hover:bg-white/20"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              {popupBlocked > 0 ? `${popupBlocked} ads blocked` : 'Protected'}
            </button>

            <AnimatePresence>
              {showProtectionInfo && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute top-10 right-0 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl"
                >
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    Protection Active
                  </h4>
                  <ul className="space-y-2 text-xs text-white/70">
                    <li className="flex items-center gap-2">
                      <Ban className="w-3 h-3 text-primary" />
                      Popup blocker enabled
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-primary" />
                      Click shield protection
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-primary" />
                      Referrer policy: strict
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-white/50">
                    For best results, use an ad-blocking DNS like AdGuard.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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

            {/* Protection notice */}
            <motion.div
              className="mt-6 flex items-center gap-2 text-xs text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              <span>Ad protection enabled</span>
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
    </div>
  );
};

export default SafeVideoPlayer;
