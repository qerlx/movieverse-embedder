
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails } from "@/lib/api";
import { ArrowLeft, MonitorPlay, RotateCw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';

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
          setTitle(`${tvData.name} - S${season} E${episode}`);
          setPosterPath(tvData.poster_path);
          
          setEmbedUrls({
            server1: `https://www.2embed.cc/embedtv/${itemId}&s=${season}&e=${episode}`,
            server2: `https://vidsrc.to/embed/tv/${itemId}/${season}/${episode}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1&s=${season}&e=${episode}`,
            server4: `https://embed.su/embed/tv/${itemId}/${season}/${episode}`
          });

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
    <div className={cn(
      "min-h-screen",
      isNetflix ? "bg-black" : "bg-background"
    )}>
      <div className="container mx-auto px-4 py-4 flex flex-col h-screen">
        <motion.div 
          className="flex items-center mb-4" 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackNavigation}
            className={cn(
              "flex items-center",
              isNetflix 
                ? "text-white hover:text-red-600 transition-colors" 
                : "text-white hover:text-primary transition-colors"
            )}
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </motion.button>
          <h1 className="text-xl font-medium text-white ml-4 truncate">{title}</h1>
        </motion.div>
        
        <motion.div 
          className="flex space-x-2 mb-4 overflow-x-auto pb-2"
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
                    isNetflix && activeServer === server && "bg-red-600 hover:bg-red-700"
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
                className={cn(
                  "inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em]",
                  isNetflix ? "border-red-600" : "border-primary"
                )}
              ></motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-1 flex flex-col"
            >
              <div className="w-full h-full relative rounded-lg overflow-hidden bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 opacity-0 pointer-events-none" id="loading-overlay">
                  <div className="flex flex-col items-center">
                    <RotateCw className={cn(
                      "h-10 w-10 animate-spin",
                      isNetflix ? "text-red-600" : "text-primary"
                    )} />
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
                className="flex justify-center mt-4 space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "gap-2",
                    isNetflix 
                      ? "bg-black/50 border-white/20 text-white hover:bg-white/20" 
                      : "bg-black/50 border-white/20 text-white hover:bg-white/20"
                  )}
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
                  className={cn(
                    "gap-2",
                    isNetflix 
                      ? "bg-black/50 border-white/20 text-white hover:bg-white/20" 
                      : "bg-black/50 border-white/20 text-white hover:bg-white/20"
                  )}
                  onClick={tryNextServer}
                >
                  <RotateCw size={14} />
                  Try another server
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watch;
