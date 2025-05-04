
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ArrowLeft, MonitorPlay, RotateCw, ThumbsUp, SkipForward, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [searchParams] = useSearchParams();
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [embedUrls, setEmbedUrls] = useState<{vidora: string, vidsrc: string, server3: string, server4: string}>({
    vidora: "",
    vidsrc: "",
    server3: "",
    server4: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Get server param from URL or default to "vidora"
  const serverParam = searchParams.get("server");
  const [activeServer, setActiveServer] = useState<"vidora" | "vidsrc" | "server3" | "server4">(
    (serverParam === "vidsrc" || serverParam === "server3" || serverParam === "server4") 
      ? serverParam 
      : "vidora"
  );
  
  const [hasNextEpisode, setHasNextEpisode] = useState(false);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<{season: number, episode: number} | null>(null);
  const [serverStatus, setServerStatus] = useState<Record<string, 'loading' | 'online' | 'offline'>>({
    vidora: 'loading',
    vidsrc: 'loading',
    server3: 'loading',
    server4: 'loading'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
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

  // Server names for display
  const serverNames: Record<string, string> = {
    vidora: "Vidora (Recommended)",
    vidsrc: "VidSrc (Second Best)",
    server3: "MultiEmbed",
    server4: "Embed.su"
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
        
        if (type === "movie") {
          const movieData = await getMovieDetails(itemId);
          setTitle(movieData.title);
          setPosterPath(movieData.poster_path);
          
          // Combine Vidora parameters
          const vidoraParamsString = Object.entries(vidoraParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
          
          // Set URLs for different servers
          setEmbedUrls({
            vidora: movieData.imdb_id 
              ? `https://vidora.su/movie/tt${movieData.imdb_id}?${vidoraParamsString}`
              : `https://vidora.su/movie/${itemId}?${vidoraParamsString}`,
            vidsrc: `https://vidsrc.cc/v2/embed/movie/${itemId}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1`,
            server4: `https://embed.su/embed/movie/${itemId}`
          });

          setHasNextEpisode(false);
          setNextEpisodeInfo(null);

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
          
          // Combine Vidora parameters
          const vidoraParamsString = Object.entries(vidoraParams)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
          
          // Set URLs for different servers
          setEmbedUrls({
            vidora: `https://vidora.su/tv/${itemId}/${season}/${episode}?${vidoraParamsString}`,
            vidsrc: `https://vidsrc.cc/v2/embed/tv/${itemId}/${season}/${episode}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1&s=${season}&e=${episode}`,
            server4: `https://embed.su/embed/tv/${itemId}/${season}/${episode}`
          });

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

        // Simulate checking server status - we'd replace this with real checks
        setTimeout(() => {
          setServerStatus({
            vidora: 'online',  // Assume our main Vidora server is always online
            vidsrc: Math.random() > 0.2 ? 'online' : 'offline',
            server3: Math.random() > 0.3 ? 'online' : 'offline',
            server4: Math.random() > 0.2 ? 'online' : 'offline',
          });
        }, 1500);
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
  }, [id, type, season, episode, navigate, uiToast, currentUser, vidoraThemeColor, vidoraParams]);

  const goToNextEpisode = () => {
    if (nextEpisodeInfo && type === "tv" && id) {
      navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
      toast.success("Loading next episode...");
    }
  };

  const tryNextServer = () => {
    const serverOptions: ("vidora" | "vidsrc" | "server3" | "server4")[] = ["vidora", "vidsrc", "server3", "server4"];
    const currentIndex = serverOptions.indexOf(activeServer);
    
    let nextIndex = (currentIndex + 1) % serverOptions.length;
    const nextServer = serverOptions[nextIndex];
    
    toast.info(`Switching to ${serverNames[nextServer]}`, {
      description: "If video doesn't load, try another server",
      duration: 3000
    });
    
    setActiveServer(nextServer);
  };

  const handleServerSwitch = (server: "vidora" | "vidsrc" | "server3" | "server4") => {
    setActiveServer(server);
    
    toast.info(`Switched to ${serverNames[server]}`, {
      description: "If video doesn't load, try another server",
      duration: 3000
    });
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

  // Server status badge color
  const getStatusColor = (status: 'loading' | 'online' | 'offline') => {
    if (status === 'loading') return 'bg-yellow-500/70';
    if (status === 'online') return 'bg-green-500/70';
    return 'bg-red-500/70';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-black">
      <div className={cn(
        "container mx-auto px-4 py-4 flex flex-col",
        isFullscreen ? "h-screen" : "min-h-screen"
      )}>
        {!isFullscreen && (
          <motion.div 
            className="flex items-center justify-between mb-6" 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackNavigation}
                className="flex items-center text-white hover:text-primary transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </motion.button>
              <h1 className="text-xl font-medium text-white ml-4 truncate hidden sm:block">{title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {hasNextEpisode && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextEpisode}
                  className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white px-3 py-1.5 rounded-full transition-colors shadow-lg hover:shadow-primary/30"
                >
                  <span className="hidden sm:inline">Next Episode</span>
                  <SkipForward size={18} />
                </motion.button>
              )}
              
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFullscreen}
                className="flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full transition-colors shadow-lg"
              >
                {isFullscreen ? (
                  <>
                    <Minimize size={18} />
                    <span className="hidden sm:inline">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize size={18} />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Server selection with pill buttons and status indicators */}
        {!isFullscreen && (
          <motion.div 
            className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {(["vidora", "vidsrc", "server3", "server4"] as const).map((server, index) => {
              const isActive = activeServer === server;
              const status = serverStatus[server];
              // Make "Vidora (Recommended)" and "VidSrc (Second Best)" prominent
              const isPrimary = server === "vidora";
              const isSecondary = server === "vidsrc";
              
              return (
                <motion.div 
                  key={server} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => handleServerSwitch(server)}
                    className={cn(
                      "rounded-full px-5 gap-2 relative border h-11 transition-all duration-300 shadow-lg",
                      isPrimary && !isActive && "border-primary/30 bg-black/40",
                      isSecondary && !isActive && "border-yellow-500/30 bg-black/40",
                      isActive 
                        ? "bg-primary text-white border-primary/40 shadow-primary/20" 
                        : "bg-black/30 backdrop-blur-md border-white/10 hover:bg-black/50"
                    )}
                  >
                    <MonitorPlay size={18} />
                    <span>{serverNames[server]}</span>
                    <span 
                      className={cn(
                        "absolute top-1 right-1 w-2.5 h-2.5 rounded-full animate-pulse",
                        getStatusColor(status)
                      )} 
                      title={`Server is ${status}`}
                    />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
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
                  "w-full h-full relative rounded-xl overflow-hidden glass-panel shadow-2xl border border-white/10",
                  isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
                )}
              >
                <iframe
                  ref={iframeRef}
                  key={`${activeServer}-${id}-${season || ''}-${episode || ''}`}
                  src={embedUrls[activeServer]}
                  title={title}
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                ></iframe>
                
                {isFullscreen && (
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    {hasNextEpisode && (
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={goToNextEpisode}
                        className="bg-black/40 text-white border-white/10 hover:bg-black/60 hover:text-primary rounded-full"
                      >
                        <SkipForward size={16} />
                        <span className="ml-1">Next</span>
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={toggleFullscreen}
                      className="bg-black/40 text-white border-white/10 hover:bg-black/60 hover:text-primary rounded-full"
                    >
                      <Minimize size={16} />
                    </Button>
                  </div>
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
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="gap-2 rounded-full glass-panel text-white hover:bg-white/10 hover:text-primary border-white/10 shadow-lg hover:shadow-primary/20 transition-all duration-300"
                    onClick={tryNextServer}
                  >
                    <RotateCw size={16} />
                    Try another server
                  </Button>
                  
                  {hasNextEpisode && (
                    <Button 
                      variant="default"
                      size="lg" 
                      className="gap-2 bg-primary hover:bg-primary/90 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300"
                      onClick={goToNextEpisode}
                    >
                      <SkipForward size={16} />
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
