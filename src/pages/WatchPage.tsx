import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/lib/storage-service";
import { addToWatchHistory } from "@/lib/firebase-watch";
import { STORAGE_KEYS } from "@/constants";
import { videoSources, getVideoSource, buildVideoUrl, isValidVideoSource } from "@/utils/video";
import { validateMediaId, validateSeasonEpisode, sanitizeText } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InPlayerEpisodeSelector from "@/components/InPlayerEpisodeSelector";

interface WatchPageState {
  title: string;
  isLoading: boolean;
  error: string | null;
  videoUrl: string;
  currentSource: typeof videoSources[0];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  controlsVisible: boolean;
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
  
  const [state, setState] = useState<WatchPageState>({
    title: "",
    isLoading: true,
    error: null,
    videoUrl: "",
    currentSource: videoSources[0],
    isPlaying: false,
    volume: 1,
    isMuted: false,
    controlsVisible: true
  });
  
  const [showData, setShowData] = useState<any>(null);
  const [animeDub, setAnimeDub] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Validate parameters
  const validatedParams = useMemo(() => {
    if (!type || !id) return null;
    
    // Anime supports flexible IDs (prefix sanitized in source builder)
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

  // Handle source switching
  const switchVideoSource = useCallback((sourceId: string) => {
    if (!validatedParams) return;
    
    let newSource = getVideoSource(sourceId);

    // Ensure anime uses an anime-capable source
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
      return;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentSource: newSource,
      videoUrl: newUrl
    }));
    
    // Update URL with source parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('source', newSource.id);
    const newLocation = `${location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, '', newLocation);
    
    setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 1000);
  }, [validatedParams, location, animeDub]);

  // Handle back/exit navigation with validation
  const handleBackNavigation = useCallback(() => {
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
  }, [validatedParams, location.key, navigate]);

  // Media message handling for progress tracking
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: validate origin
      const allowedOrigins = ['https://vidsrc.cc', 'https://vidlink.pro', 'https://player.autoembed.cc'];
      if (!allowedOrigins.some(origin => event.origin === origin)) {
        return;
      }
      
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        if (mediaData?.id && (mediaData.type === 'movie' || mediaData.type === 'tv')) {
          console.log('Progress update received:', mediaData);
          
          // Update local storage
          try {
            const watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS) || '{}');
            watchProgress[mediaData.id] = {
              ...watchProgress[mediaData.id],
              ...mediaData,
              last_updated: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(watchProgress));
            
            // Update Firebase for authenticated users
            if (currentUser && validatedParams) {
              const progress = mediaData.progress?.percent || 0;
              storageService.addToWatchHistory(
                validatedParams.id.toString(),
                validatedParams.type as "movie" | "tv",
                state.title,
                mediaData.poster_path || '',
                progress,
                undefined,
                currentUser
              ).catch(err => console.error("Failed to update watch history:", err));
            }
          } catch (error) {
            console.error("Error updating watch progress:", error);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser, validatedParams, state.title]);

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
        setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
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
  }, []);

  // Fetch media details and setup video
  useEffect(() => {
    if (!validatedParams) {
      setState(prev => ({ ...prev, error: "Invalid media parameters", isLoading: false }));
      return;
    }

    const fetchMediaDetails = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Handle Anime separately (no TMDb fetch required)
        if (validatedParams.type === 'anime') {
          // Determine source from URL or fallback to first anime-capable
          const searchParams = new URLSearchParams(location.search);
          const sourceParam = searchParams.get('source');
          let source: typeof videoSources[0];
          
          if (sourceParam) {
            const requestedSource = videoSources.find(s => s.id === sourceParam);
            if (requestedSource?.supportsAnime) {
              source = requestedSource;
            } else {
              // Requested source doesn't support anime, use fallback
              source = videoSources.find(s => s.supportsAnime) || videoSources[0];
            }
          } else {
            // No source specified, use first anime-capable source
            source = videoSources.find(s => s.supportsAnime) || videoSources[0];
          }
          
          const videoUrl = buildVideoUrl(
            source,
            'anime',
            validatedParams.id.toString(),
            undefined,
            validatedParams.episode?.toString(),
            { dub: animeDub, autoPlay: true, autoSkipIntro: true }
          );
          
          if (!videoUrl) {
            throw new Error('Failed to generate anime video URL');
          }
          
          if (!isValidVideoSource(videoUrl)) {
            throw new Error('Invalid anime video source URL');
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
        const source = getVideoSource(sourceParam || undefined);
        
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
  }, [validatedParams, currentUser, location.search, handleBackNavigation]);

  if (!validatedParams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Parameters</h1>
          <p className="text-muted-foreground mb-4">The video parameters are not valid.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{state.error}</p>
          <button 
            onClick={handleBackNavigation}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black">
      <div className="h-screen w-screen relative">
        {/* Exit Button */}
        <motion.div 
          className="absolute top-6 left-6 z-40"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: state.controlsVisible ? 1 : 0, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            variant="ghost"
            size="lg" 
            onClick={handleBackNavigation}
            className="bg-black/80 hover:bg-black/90 text-white rounded-xl border border-white/30 backdrop-blur-xl transition-all duration-300 hover:scale-105 shadow-2xl px-5 py-3"
            aria-label="Exit player"
          >
            <ArrowLeft className="mr-2" size={20} />
            <span className="font-semibold text-base">Exit</span>
          </Button>
        </motion.div>
        
        {/* Source Switcher + Anime Sub/Dub */}
        <motion.div 
          className="absolute top-6 right-6 z-40 flex flex-col items-end gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: state.controlsVisible ? 1 : 0, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Source buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            {videoSources
              .filter(src => (validatedParams?.type === 'anime' ? src.supportsAnime : src.id !== 'vidsrc-anime'))
              .map((source) => (
                <motion.button
                  key={source.id}
                  onClick={() => switchVideoSource(source.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={
                    `px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-300 backdrop-blur-xl shadow-lg ` +
                    (state.currentSource.id === source.id 
                      ? 'bg-primary/90 text-primary-foreground border-primary shadow-primary/50' 
                      : 'bg-black/80 text-white border-white/30 hover:bg-white/20 hover:border-white/50')
                  }
                >
                  {source.name}
                </motion.button>
              ))}
          </div>
          
          {/* Sub/Dub toggle for anime */}
          {validatedParams?.type === 'anime' && (
            <motion.div 
              className="flex gap-1 bg-black/80 border-2 border-white/30 rounded-xl p-1.5 backdrop-blur-xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => { setAnimeDub(false); switchVideoSource(state.currentSource.id); }}
                className={
                  `px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ` + 
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
                  `px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ` + 
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
        
        {/* Enhanced Loading Screen */}
        <AnimatePresence>
          {state.isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black z-50"
            >
              <div className="relative mb-10">
                <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
                <motion.div 
                  className="absolute inset-0 w-24 h-24 border-4 border-t-primary border-r-primary/50 border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute inset-2 w-20 h-20 border-4 border-t-transparent border-r-transparent border-b-primary/50 border-l-primary rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <div className="text-center max-w-md px-6">
                <motion.h2 
                  className="text-white text-2xl font-bold mb-3"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Loading Video
                </motion.h2>
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-primary text-lg font-semibold mb-2">{state.currentSource.name}</p>
                  <p className="text-white/70 text-base">{state.title}</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video Player iframe - No sandbox restriction */}
        {state.videoUrl && (
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: state.isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            style={{ visibility: state.isLoading ? 'hidden' : 'visible' }}
          >
            <iframe
              ref={iframeRef}
              src={state.videoUrl}
              title={state.title}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full absolute inset-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              style={{ zIndex: 10 }}
              referrerPolicy="no-referrer"
            />
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