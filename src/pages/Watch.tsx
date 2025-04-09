
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowEpisodes } from "@/lib/api";
import { ArrowLeft, MonitorPlay, RotateCw, ThumbsUp, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [embedUrls, setEmbedUrls] = useState<{server1: string, server2: string, server3: string, server4: string}>({
    server1: "",
    server2: "",
    server3: "",
    server4: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<"server1" | "server2" | "server3" | "server4">("server1");
  const [lastWorkingServer, setLastWorkingServer] = useState<"server1" | "server2" | "server3" | "server4">("server1");
  const [serverAttempts, setServerAttempts] = useState<Record<string, number>>({});
  const [hasNextEpisode, setHasNextEpisode] = useState(false);
  const [nextEpisodeInfo, setNextEpisodeInfo] = useState<{season: number, episode: number} | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
          
          setEmbedUrls({
            server1: `https://www.2embed.cc/embed/${itemId}`,
            server2: `https://vidsrc.to/embed/movie/${itemId}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1`,
            server4: `https://embed.su/embed/movie/${itemId}`
          });

          // No next episode for movies
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
          
          setEmbedUrls({
            server1: `https://www.2embed.cc/embedtv/${itemId}&s=${season}&e=${episode}`,
            server2: `https://vidsrc.to/embed/tv/${itemId}/${season}/${episode}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1&s=${season}&e=${episode}`,
            server4: `https://embed.su/embed/tv/${itemId}/${season}/${episode}`
          });

          // Check for next episode
          try {
            // Get total episodes in current season
            const seasonData = await getTVShowEpisodes(itemId, seasonNumber);
            const totalEpisodes = seasonData.episodes?.length || 0;
            
            if (episodeNumber < totalEpisodes) {
              // Next episode in same season
              setHasNextEpisode(true);
              setNextEpisodeInfo({
                season: seasonNumber,
                episode: episodeNumber + 1
              });
            } else {
              // Check if there's a next season
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
  }, [id, type, season, episode, navigate, uiToast, currentUser]);

  const goToNextEpisode = () => {
    if (nextEpisodeInfo && type === "tv" && id) {
      navigate(`/watch/tv/${id}/${nextEpisodeInfo.season}/${nextEpisodeInfo.episode}`);
      toast.success("Loading next episode...");
    }
  };

  const tryNextServer = () => {
    const serverOptions: ("server1" | "server2" | "server3" | "server4")[] = ["server1", "server2", "server3", "server4"];
    const currentIndex = serverOptions.indexOf(activeServer);
    
    let nextIndex = (currentIndex + 1) % serverOptions.length;
    const nextServer = serverOptions[nextIndex];
    
    setServerAttempts(prev => ({
      ...prev,
      [activeServer]: (prev[activeServer] || 0) + 1
    }));
    
    const serverNames: Record<string, string> = {
      server1: "1 (2embed)",
      server2: "2 (VidSrc)",
      server3: "3 (MultiEmbed)",
      server4: "4 (Embed.su)"
    };
    
    toast.info(`Switching to Server ${serverNames[nextServer]}`, {
      description: "If video doesn't load, try another server",
      duration: 3000
    });
    
    setActiveServer(nextServer);
  };

  const handleServerSwitch = (server: "server1" | "server2" | "server3" | "server4") => {
    setActiveServer(server);
    setLastWorkingServer(server);
    
    const serverNames: Record<string, string> = {
      server1: "1 (2embed)",
      server2: "2 (VidSrc)",
      server3: "3 (MultiEmbed)",
      server4: "4 (Embed.su)"
    };
    
    toast.info(`Switched to Server ${serverNames[server]}`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-black">
      <div className="container mx-auto px-4 py-4 flex flex-col h-screen">
        <motion.div 
          className="flex items-center justify-between mb-4" 
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
          
          {hasNextEpisode && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNextEpisode}
              className="flex items-center gap-2 bg-primary/90 hover:bg-primary text-white px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="hidden sm:inline">Next Episode</span>
              <SkipForward size={18} />
            </motion.button>
          )}
        </motion.div>
        
        <motion.div 
          className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {["server1", "server2", "server3", "server4"].map((server, index) => {
            const serverNames: Record<string, string> = {
              server1: "Server 1",
              server2: "Server 2",
              server3: "Server 3",
              server4: "Server 4"
            };
            
            return (
              <motion.div key={server} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <Button 
                  size="sm" 
                  variant={activeServer === server ? "default" : "outline"} 
                  className={cn(
                    "gap-2",
                    activeServer === server 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "border-white/10 bg-black/50 hover:bg-black/90"
                  )}
                  onClick={() => handleServerSwitch(server as "server1" | "server2" | "server3" | "server4")}
                >
                  <MonitorPlay size={16} />
                  {serverNames[server]}
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
        
        <AnimatePresence>
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
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col"
            >
              <div className="w-full h-full relative rounded-lg overflow-hidden bg-muted shadow-2xl border border-white/5">
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 opacity-0 pointer-events-none" id="loading-overlay">
                  <div className="flex flex-col items-center">
                    <RotateCw className="h-10 w-10 animate-spin text-primary" />
                    <p className="mt-4 text-sm">Loading video...</p>
                  </div>
                </div>
                
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
              </div>
              
              <motion.div 
                className="flex justify-center items-center gap-4 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-black/40 border-white/10 text-white hover:bg-white/10"
                  onClick={() => {
                    toast.success("Thanks for the feedback!");
                  }}
                >
                  <ThumbsUp size={14} />
                  Working well
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 bg-black/40 border-white/10 text-white hover:bg-white/10"
                  onClick={tryNextServer}
                >
                  <RotateCw size={14} />
                  Try another server
                </Button>
                
                {hasNextEpisode && (
                  <Button 
                    variant="default"
                    size="sm" 
                    className="gap-2 bg-primary hover:bg-primary/90"
                    onClick={goToNextEpisode}
                  >
                    <SkipForward size={14} />
                    Next Episode
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watch;
