import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/lib/storage-service";
import { STORAGE_KEYS } from "@/constants";
import { videoSources, getVideoSource, buildVideoUrl, isValidVideoSource } from "@/utils/video";
import { validateMediaId, validateSeasonEpisode, sanitizeText } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, SkipForward, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import InPlayerEpisodeSelector from "@/components/InPlayerEpisodeSelector";
import { SafeVideoPlayer } from "@/components/watch/SafeVideoPlayer";
import { EnhancedSourceSelector } from "@/components/watch/EnhancedSourceSelector";
import { AutoAdvanceOverlay } from "@/components/watch/AutoAdvanceOverlay";
import { useSourceStatus } from "@/hooks/useSourceStatus";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";

interface WatchPageState {
  title: string;
  isLoading: boolean;
  error: string | null;
  videoUrl: string;
  currentSource: typeof videoSources[0];
  controlsVisible: boolean;
  posterPath: string | null;
}

const WatchPage: React.FC = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { showMiniPlayer } = useMiniPlayer();
  const { reportLoadSuccess, reportLoadFailure, getBestSource } = useSourceStatus();
  
  const [state, setState] = useState<WatchPageState>({
    title: "",
    isLoading: true,
    error: null,
    videoUrl: "",
    currentSource: videoSources[0],
    controlsVisible: true,
    posterPath: null
  });
  
  const [showData, setShowData] = useState<any>(null);
  const [animeDub, setAnimeDub] = useState(false);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const loadStartTimeRef = useRef<number>(0);

  // Validate parameters
  const validatedParams = useMemo(() => {
    if (!type || !id) return null;
    
    if (type === 'anime') {
      if (!episode) return null;
      const epNum = parseInt(episode, 10);
      if (!epNum || epNum < 1) return null;
      return { type: 'anime', id, episode: epNum } as const;
    }

    const mediaId = validateMediaId(id);
    if (!mediaId) return null;
    
    if (type === "tv") {
      if (!season || !episode) return null;
      const validatedEpisode = validateSeasonEpisode(season, episode);
      if (!validatedEpisode) return null;
      
      return {
        type,
        id: mediaId,
        season: validatedEpisode.season,
        episode: validatedEpisode.episode
      };
    }
    
    if (type === "movie") {
      return { type, id: mediaId };
    }
    
    return null;
  }, [type, id, season, episode]);

  // Auto-advance hook for TV shows
  const autoAdvance = useAutoAdvance(
    validatedParams?.type === 'tv' ? {
      showId: validatedParams.id,
      currentSeason: validatedParams.season!,
      currentEpisode: validatedParams.episode!,
      totalSeasons: showData?.number_of_seasons,
      enabled: true,
      delaySeconds: 10
    } : null
  );

  // Handle source switching with status tracking
  const switchVideoSource = useCallback((sourceId: string) => {
    if (!validatedParams) return;
    
    let newSource = getVideoSource(sourceId);
    loadStartTimeRef.current = Date.now();

    if (validatedParams.type === 'anime' && !newSource.supportsAnime) {
      const fallbackAnime = videoSources.find(src => src.supportsAnime);
      if (!fallbackAnime) {
        toast.error("No anime-compatible source available");
        return;
      }
      newSource = fallbackAnime;
    }

    const seasonArg = validatedParams.type === 'tv' ? validatedParams.season?.toString() : undefined;
    const episodeArg = validatedParams.type === 'tv'
      ? validatedParams.episode?.toString()
      : validatedParams.type === 'anime'
        ? validatedParams.episode?.toString()
        : undefined;

    const extraParams = validatedParams.type === 'anime'
      ? { dub: animeDub, autoPlay: true, autoSkipIntro: true }
      : {};

    const newUrl = buildVideoUrl(
      newSource,
      validatedParams.type,
      validatedParams.id.toString(),
      seasonArg,
      episodeArg,
      extraParams
    );
    
    if (!newUrl || !isValidVideoSource(newUrl)) {
      toast.error("Invalid video source selected");
      reportLoadFailure(sourceId);
      return;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentSource: newSource,
      videoUrl: newUrl
    }));
    
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('source', newSource.id);
    const newLocation = `${location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newLocation);
    
  }, [validatedParams, location, animeDub, reportLoadFailure]);

  // Handle player load success
  const handlePlayerLoad = useCallback(() => {
    const loadTime = Date.now() - loadStartTimeRef.current;
    reportLoadSuccess(state.currentSource.id, loadTime);
    setState(prev => ({ ...prev, isLoading: false }));
  }, [state.currentSource.id, reportLoadSuccess]);

  // Handle player error with auto-fallback
  const handlePlayerError = useCallback(() => {
    reportLoadFailure(state.currentSource.id);
    
    // Try next best source
    const availableSources = validatedParams?.type === 'anime'
      ? videoSources.filter(s => s.supportsAnime).map(s => s.id)
      : videoSources.filter(s => s.id !== 'vidsrc-anime').map(s => s.id);
    
    const bestSource = getBestSource(availableSources.filter(id => id !== state.currentSource.id));
    
    if (bestSource) {
      toast.info(`Trying ${getVideoSource(bestSource).name}...`);
      setTimeout(() => switchVideoSource(bestSource), 1000);
    }
  }, [state.currentSource.id, validatedParams, reportLoadFailure, getBestSource, switchVideoSource]);

  // Handle back/exit navigation
  const handleBackNavigation = useCallback(() => {
    // Show mini player when leaving watch page
    if (state.videoUrl && state.title && validatedParams) {
      showMiniPlayer({
        videoUrl: state.videoUrl,
        title: state.title,
        posterUrl: state.posterPath ? `https://image.tmdb.org/t/p/w300${state.posterPath}` : undefined,
        mediaType: validatedParams.type as 'movie' | 'tv' | 'anime',
        mediaId: validatedParams.id,
        season: validatedParams.type === 'tv' ? validatedParams.season : undefined,
        episode: validatedParams.type === 'tv' ? validatedParams.episode : validatedParams.type === 'anime' ? validatedParams.episode : undefined
      });
    }

    if (!validatedParams) {
      navigate('/');
      return;
    }
    
    if (location.key !== "default") {
      navigate(-1);
      return;
    }

    if (validatedParams.type === "movie") {
      navigate(`/movie/${validatedParams.id}`);
    } else if (validatedParams.type === "tv") {
      navigate(`/tv/${validatedParams.id}`);
    } else {
      navigate('/');
    }
  }, [validatedParams, location.key, navigate, showMiniPlayer, state]);

  // Controls visibility management
  useEffect(() => {
    const showControls = () => {
      setState(prev => ({ ...prev, controlsVisible: true }));
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, controlsVisible: false }));
      }, 3000);
    };

    const handleMouseMove = () => showControls();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
      }
      if (e.code === 'Escape') {
        handleBackNavigation();
      }
      showControls();
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleBackNavigation]);

  // Fetch media details and setup video
  useEffect(() => {
    if (!validatedParams) {
      setState(prev => ({ ...prev, error: "Invalid media parameters", isLoading: false }));
      return;
    }

    const fetchMediaDetails = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      loadStartTimeRef.current = Date.now();
      
      try {
        // Handle Anime
        if (validatedParams.type === 'anime') {
          const searchParams = new URLSearchParams(location.search);
          const sourceParam = searchParams.get('source');
          let source: typeof videoSources[0];
          
          if (sourceParam) {
            const requestedSource = videoSources.find(s => s.id === sourceParam);
            if (requestedSource?.supportsAnime) {
              source = requestedSource;
            } else {
              source = videoSources.find(s => s.supportsAnime) || videoSources[0];
            }
          } else {
            // Use best known source
            const animeSources = videoSources.filter(s => s.supportsAnime).map(s => s.id);
            const bestSource = getBestSource(animeSources);
            source = bestSource ? getVideoSource(bestSource) : videoSources.find(s => s.supportsAnime) || videoSources[0];
          }
          
          const videoUrl = buildVideoUrl(
            source,
            'anime',
            validatedParams.id.toString(),
            undefined,
            validatedParams.episode?.toString(),
            { dub: animeDub, autoPlay: true, autoSkipIntro: true }
          );
          
          if (!videoUrl || !isValidVideoSource(videoUrl)) {
            throw new Error('Failed to generate anime video URL');
          }
          
          setState(prev => ({
            ...prev,
            title: `Anime - Ep ${validatedParams.episode}`,
            videoUrl,
            currentSource: source,
            isLoading: false
          }));
          return;
        }
        
        // Movies and TV
        let mediaData: any;
        let mediaTitle: string;
        
        if (validatedParams.type === 'movie') {
          mediaData = await getMovieDetails(validatedParams.id);
          mediaTitle = sanitizeText(mediaData?.title || 'Unknown Movie');
        } else if (validatedParams.type === 'tv') {
          mediaData = await getTVShowDetails(validatedParams.id);
          setShowData(mediaData);
          mediaTitle = `${sanitizeText(mediaData?.name || 'Unknown Show')} - S${validatedParams.season} E${validatedParams.episode}`;
        }
        
        if (!mediaData) {
          throw new Error('Failed to load media details');
        }
        
        const searchParams = new URLSearchParams(location.search);
        const sourceParam = searchParams.get('source');
        
        // Use best source if no specific source requested
        let source: typeof videoSources[0];
        if (sourceParam) {
          source = getVideoSource(sourceParam);
        } else {
          const availableSources = videoSources.filter(s => s.id !== 'vidsrc-anime').map(s => s.id);
          const bestSourceId = getBestSource(availableSources);
          source = bestSourceId ? getVideoSource(bestSourceId) : videoSources[0];
        }
        
        const videoUrl = buildVideoUrl(
          source,
          validatedParams.type,
          validatedParams.id.toString(),
          validatedParams.type === 'tv' ? validatedParams.season?.toString() : undefined,
          validatedParams.type === 'tv' ? validatedParams.episode?.toString() : undefined
        );
        
        if (!videoUrl || !isValidVideoSource(videoUrl)) {
          throw new Error('Failed to generate valid video URL');
        }
        
        setState(prev => ({
          ...prev,
          title: mediaTitle,
          videoUrl,
          currentSource: source,
          posterPath: mediaData.poster_path,
          isLoading: false
        }));
        
        // Add to watch history
        if (currentUser) {
          try {
            if (validatedParams.type === 'tv') {
              const seasonDetails = await getTVShowSeasonDetails(validatedParams.id, validatedParams.season!);
              let episodeName = '';
              if (seasonDetails?.success && seasonDetails.episodes) {
                const episodeData = seasonDetails.episodes.find((e: any) => e.episode_number === validatedParams.episode);
                episodeName = episodeData?.name || `Episode ${validatedParams.episode}`;
              }
              await storageService.addToWatchHistory(
                validatedParams.id.toString(),
                'tv',
                sanitizeText(mediaData.name || ''),
                mediaData.poster_path || '',
                0,
                { season: validatedParams.season!, episode: validatedParams.episode!, name: episodeName },
                currentUser
              );
            } else {
              await storageService.addToWatchHistory(
                validatedParams.id.toString(),
                'movie',
                sanitizeText(mediaData.title || ''),
                mediaData.poster_path || '',
                0,
                undefined,
                currentUser
              );
            }
          } catch (error) {
            console.error('Error adding to watch history:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching media details:', error);
        setState(prev => ({ ...prev, error: 'Failed to load media. Please try again.', isLoading: false }));
        setTimeout(() => { handleBackNavigation(); }, 3000);
      }
    };

    fetchMediaDetails();
  }, [validatedParams, currentUser, location.search, handleBackNavigation, getBestSource, animeDub]);

  if (!validatedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Parameters</h1>
          <p className="text-muted-foreground mb-4">The video parameters are not valid.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <Button onClick={handleBackNavigation}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      <div className="h-screen w-screen relative">
        {/* Top Controls Bar */}
        <motion.div 
          className="absolute top-0 left-0 right-0 z-40 p-4 md:p-6 flex items-start justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: state.controlsVisible ? 1 : 0, y: state.controlsVisible ? 0 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Left: Exit Button */}
          <Button 
            variant="ghost"
            size="lg" 
            onClick={handleBackNavigation}
            className="bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-2xl px-4 py-2"
            aria-label="Exit player"
          >
            <ArrowLeft className="mr-2" size={18} />
            <span className="font-medium hidden sm:inline">Exit</span>
          </Button>

          {/* Center: Title */}
          <div className="flex-1 text-center px-4">
            <motion.h1 
              className="text-white text-lg md:text-xl font-semibold line-clamp-1 text-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {state.title}
            </motion.h1>
          </div>

          {/* Right: Source Selector Toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowSourceSelector(!showSourceSelector)}
            className="bg-black/60 hover:bg-black/80 text-white rounded-xl border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-2xl px-4 py-2"
          >
            <Settings2 size={18} />
            <span className="ml-2 font-medium hidden sm:inline">{state.currentSource.name}</span>
          </Button>
        </motion.div>

        {/* Source Selector Panel */}
        <AnimatePresence>
          {showSourceSelector && state.controlsVisible && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-20 right-4 md:right-6 z-40 w-80"
            >
              <EnhancedSourceSelector
                currentSourceId={state.currentSource.id}
                onSwitch={(sourceId) => {
                  switchVideoSource(sourceId);
                  setShowSourceSelector(false);
                }}
                isAnime={validatedParams?.type === 'anime'}
                onTryBest={() => {
                  const sources = validatedParams?.type === 'anime'
                    ? videoSources.filter(s => s.supportsAnime).map(s => s.id)
                    : videoSources.filter(s => s.id !== 'vidsrc-anime').map(s => s.id);
                  const best = getBestSource(sources);
                  if (best && best !== state.currentSource.id) {
                    switchVideoSource(best);
                    setShowSourceSelector(false);
                  }
                }}
              />
              
              {/* Anime Sub/Dub Toggle */}
              {validatedParams?.type === 'anime' && (
                <motion.div 
                  className="mt-3 flex gap-1 bg-black/80 border border-white/10 rounded-xl p-1.5 backdrop-blur-xl shadow-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <button
                    onClick={() => { setAnimeDub(false); switchVideoSource(state.currentSource.id); }}
                    className={
                      `flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ` + 
                      (!animeDub 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                        : 'text-white/80 hover:text-white hover:bg-white/10')
                    }
                  >
                    SUB
                  </button>
                  <button
                    onClick={() => { setAnimeDub(true); switchVideoSource(state.currentSource.id); }}
                    className={
                      `flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ` + 
                      (animeDub 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                        : 'text-white/80 hover:text-white hover:bg-white/10')
                    }
                  >
                    DUB
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Safe Video Player with click shield and error handling */}
        {state.videoUrl && (
          <SafeVideoPlayer
            videoUrl={state.videoUrl}
            title={state.title}
            onLoad={handlePlayerLoad}
            onError={handlePlayerError}
            onSourceChange={() => {
              const sources = validatedParams?.type === 'anime'
                ? videoSources.filter(s => s.supportsAnime).map(s => s.id)
                : videoSources.filter(s => s.id !== 'vidsrc-anime').map(s => s.id);
              const best = getBestSource(sources.filter(id => id !== state.currentSource.id));
              if (best) switchVideoSource(best);
            }}
            className="w-full h-full"
          />
        )}

        {/* Auto Advance Overlay for TV Shows */}
        {validatedParams?.type === "tv" && (
          <AutoAdvanceOverlay
            isVisible={autoAdvance.showCountdown}
            countdown={autoAdvance.countdown}
            nextEpisode={autoAdvance.nextEpisode}
            onSkip={autoAdvance.skipToNext}
            onCancel={autoAdvance.cancelAutoAdvance}
          />
        )}

        {/* Next Episode Button (when available) */}
        {validatedParams?.type === "tv" && autoAdvance.hasNextEpisode && !autoAdvance.showCountdown && (
          <motion.div
            className="absolute bottom-24 right-6 z-40"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: state.controlsVisible ? 1 : 0, x: state.controlsVisible ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={autoAdvance.skipToNext}
              className="gap-2 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
              Next Episode
            </Button>
          </motion.div>
        )}

        {/* In-Player Episode Selector for TV Shows */}
        {validatedParams?.type === "tv" && showData && !state.isLoading && (
          <InPlayerEpisodeSelector
            showId={validatedParams.id}
            currentSeason={validatedParams.season}
            currentEpisode={validatedParams.episode}
            showTitle={showData.name || "TV Show"}
            onEpisodeSelect={(season, episode) => {
              navigate(`/watch/tv/${validatedParams.id}/${season}/${episode}`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WatchPage;
