
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ThumbsUp, Play, Pause, Volume2, VolumeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VideoPlayerControls from "@/components/VideoPlayerControls";

// Storage key for watch progress
const STORAGE_KEY = 'watch_progress';

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();
  
  // Content info
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [vidoraUrl, setVidoraUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Player state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasNextEpisode, setHasNextEpisode] = useState(false);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<{season: number, episode: number} | null>(null);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Custom theme color for Vidora player - vibrant teal that matches theme
  const vidoraThemeColor = "00ff9d";

  // Vidora parameters
  const vidoraParams = {
    autoplay: true,
    colour: vidoraThemeColor,
    autonextepisode: true,
    pausescreen: true,
    backbutton: window.location.origin,
    idlecheck: 20, // Check if user is still watching after 20 minutes
  };

  // Full-screen toggle function
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        toast.error("Could not enter fullscreen mode", {
          description: err.message
        });
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Toggle play/pause (this would need to communicate with iframe)
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // This would need a postMessage implementation to control the embedded player
  };

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // This would need a postMessage implementation to control the embedded player
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    // This would need a postMessage implementation to control the embedded player
  };

  // Setup watch progress syncing using Vidora's built-in functionality
  useEffect(() => {
    // Initialize watch progress from localStorage
    let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    // Handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        if (mediaData.id && (mediaData.type === 'movie' || mediaData.type === 'tv')) {
          console.log('Progress update received:', mediaData);
          
          // If we receive play state info from Vidora, update our local state
          if (mediaData.playState) {
            if (mediaData.playState === 'playing') {
              setIsPlaying(true);
            } else if (mediaData.playState === 'paused') {
              setIsPlaying(false);
            }
          }
          
          // Update local storage with watch progress
          watchProgress[mediaData.id] = {
            ...watchProgress[mediaData.id],
            ...mediaData,
            last_updated: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
          
          if (currentUser) {
            // Update watch progress in user profile if logged in
            const progress = mediaData.progress?.percent || 0;
            try {
              console.log(`Updating watch progress for ${mediaData.type} ${mediaData.id}: ${progress}%`);
              // We could call a function to update this in the database if needed
            } catch (error) {
              console.error("Error updating watch progress:", error);
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id || !type) return;
      
      try {
        setIsLoading(true);
        const itemId = parseInt(id);
        
        // Combine Vidora parameters
        const vidoraParamsString = Object.entries(vidoraParams)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
        
        if (type === "movie") {
          const movieData = await getMovieDetails(itemId);
          setTitle(movieData.title);
          setPosterPath(movieData.poster_path);
          
          // Set URLs for Vidora
          setVidoraUrl(movieData.imdb_id 
            ? `https://vidora.su/movie/tt${movieData.imdb_id}?${vidoraParamsString}`
            : `https://vidora.su/movie/${itemId}?${vidoraParamsString}`);

          setHasNextEpisode(false);
          setNextEpisodeInfo(null);
          
          // Auto set isPlaying to true since we're using autoplay
          setIsPlaying(true);

          if (currentUser) {
            try {
              await addToWatchHistory(currentUser, {
                id: itemId,
                type: "movie",
                title: movieData.title,
                posterPath: movieData.poster_path,
                progress: 0,
                genres: movieData.genres?.map((g: any) => g.id)
              });
            } catch (error) {
              console.error("Error adding to watch history:", error);
            }
          }
        } else if (type === "tv" && season && episode) {
          const tvData = await getTVShowDetails(itemId);
          const seasonNumber = parseInt(season);
          const episodeNumber = parseInt(episode);
          
          setTitle(`${tvData.name} - S${season} E${episode}`);
          setPosterPath(tvData.poster_path);
          
          // Set URL for Vidora
          setVidoraUrl(`https://vidora.su/tv/${itemId}/${season}/${episode}?${vidoraParamsString}`);
          
          // Auto set isPlaying to true since we're using autoplay
          setIsPlaying(true);

          try {
            const seasonData = await getTVShowSeasonDetails(itemId, seasonNumber);
            const totalEpisodes = seasonData.episodes?.length || 0;
            
            if (episodeNumber < totalEpisodes) {
              setHasNextEpisode(true);
              setNextEpisodeInfo({
                season: seasonNumber,
                episode: episodeNumber + 1
              });
            } else {
              if (seasonNumber < tvData.number_of_seasons) {
                setHasNextEpisode(true);
                setNextEpisodeInfo({
                  season: seasonNumber + 1,
                  episode: 1
                });
              } else {
                setHasNextEpisode(false);
              }
            }
          } catch (error) {
            console.error("Error checking for next episode:", error);
            setHasNextEpisode(false);
          }

          let episodeName = "";
          if (tvData.seasons) {
            const seasonData = tvData.seasons.find((s: any) => s.season_number === parseInt(season));
            if (seasonData && seasonData.episodes) {
              const episodeData = seasonData.episodes.find((e: any) => e.episode_number === parseInt(episode));
              if (episodeData) {
                episodeName = episodeData.name;
              }
            }
          }

          if (currentUser) {
            try {
              await addToWatchHistory(currentUser, {
                id: itemId,
                type: "tv",
                title: tvData.name,
                posterPath: tvData.poster_path,
                lastEpisode: {
                  season: parseInt(season),
                  episode: parseInt(episode),
                  name: episodeName || "Episode " + episode
                },
                genres: tvData.genres?.map((g: any) => g.id)
              });
            } catch (error) {
              console.error("Error adding to watch history:", error);
            }
          }
        } else {
          throw new Error("Invalid parameters for TV show");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        uiToast({
          title: "Error",
          description: "Failed to load media. Please try again later.",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, type, season, episode, navigate, uiToast, currentUser, vidoraParams]);

  const goToNextEpisode = () => {
    if (nextEpisodeInfo && type === "tv" && id) {
      navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
      toast.success("Loading next episode...");
    }
  };

  const handleBackNavigation = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      if (type === "movie") {
        navigate(`/movie/${id}`);
      } else if (type === "tv" && season && episode) {
        navigate(`/tv/${id}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-black">
      <div className={cn(
        "container mx-auto px-4 py-4 flex flex-col",
        isFullscreen ? "h-screen" : "min-h-[calc(100vh-8rem)]"
      )}>
        {!isFullscreen && (
          <VideoPlayerControls 
            title={title}
            isFullscreen={isFullscreen}
            hasNextEpisode={hasNextEpisode}
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            onTogglePlay={togglePlay}
            onToggleFullscreen={toggleFullscreen}
            onGoBack={handleBackNavigation}
            onNextEpisode={goToNextEpisode}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
          />
        )}
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/10"
              />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col"
            >
              <div 
                ref={playerContainerRef}
                className={cn(
                  "w-full aspect-video relative rounded-xl overflow-hidden glass-panel shadow-2xl border border-white/10",
                  isFullscreen ? "fixed inset-0 z-50 aspect-auto rounded-none" : "h-auto"
                )}
              >
                <iframe
                  ref={iframeRef}
                  src={vidoraUrl}
                  title={title}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
                
                {isFullscreen && (
                  <VideoPlayerControls 
                    title={title}
                    isFullscreen={isFullscreen}
                    hasNextEpisode={hasNextEpisode}
                    isPlaying={isPlaying}
                    volume={volume}
                    isMuted={isMuted}
                    onTogglePlay={togglePlay}
                    onToggleFullscreen={toggleFullscreen}
                    onGoBack={handleBackNavigation}
                    onNextEpisode={goToNextEpisode}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                  />
                )}
              </div>
              
              {!isFullscreen && (
                <motion.div 
                  className="flex flex-wrap justify-center sm:justify-between items-center gap-3 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="gap-2 rounded-full glass-panel text-white hover:bg-white/10 hover:text-primary border-white/10 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    onClick={() => {
                      toast.success("Thanks for your feedback!");
                    }}
                  >
                    <ThumbsUp size={16} />
                    Working well
                  </Button>
                  
                  {hasNextEpisode && (
                    <Button 
                      variant="default"
                      size="lg" 
                      className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300"
                      onClick={goToNextEpisode}
                    >
                      <Play size={16} className="ml-0.5" />
                      Next Episode
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watch;
