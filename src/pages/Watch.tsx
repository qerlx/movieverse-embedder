
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails } from "@/lib/api";
import { ArrowLeft, MonitorPlay, RotateCw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";

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
          
          // Updated URLs with more reliable streaming sources
          setEmbedUrls({
            server1: `https://vidsrc.to/embed/movie/${itemId}`,
            server2: `https://www.2embed.cc/embed/${itemId}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1`,
            server4: `https://embed.su/embed/movie/${itemId}`
          });

          // Add to watch history
          if (currentUser) {
            await addToWatchHistory(currentUser, {
              id: itemId,
              type: "movie",
              title: movieData.title,
              posterPath: movieData.poster_path,
              progress: 0,
              genres: movieData.genres?.map((g: any) => g.id)
            });
          }
        } else if (type === "tv" && season && episode) {
          const tvData = await getTVShowDetails(itemId);
          setTitle(`${tvData.name} - S${season} E${episode}`);
          setPosterPath(tvData.poster_path);
          
          // Updated URLs with more reliable streaming sources
          setEmbedUrls({
            server1: `https://vidsrc.to/embed/tv/${itemId}/${season}/${episode}`,
            server2: `https://www.2embed.cc/embedtv/${itemId}&s=${season}&e=${episode}`,
            server3: `https://multiembed.mov/directstream.php?video_id=${itemId}&tmdb=1&s=${season}&e=${episode}`,
            server4: `https://embed.su/embed/tv/${itemId}/${season}/${episode}`
          });

          // Find episode name if available
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

          // Add to watch history
          if (currentUser) {
            await addToWatchHistory(currentUser, {
              id: itemId,
              type: "tv",
              title: tvData.name,
              posterPath: tvData.poster_path,
              lastEpisode: {
                season: parseInt(season),
                episode: parseInt(episode),
                name: episodeName
              },
              genres: tvData.genres?.map((g: any) => g.id)
            });
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

  // Helper function to try the next server
  const tryNextServer = () => {
    const serverOptions: ("server1" | "server2" | "server3" | "server4")[] = ["server1", "server2", "server3", "server4"];
    const currentIndex = serverOptions.indexOf(activeServer);
    
    // Try each server in order, but don't try the same one twice in a row
    let nextIndex = (currentIndex + 1) % serverOptions.length;
    const nextServer = serverOptions[nextIndex];
    
    // Track server attempts
    setServerAttempts(prev => ({
      ...prev,
      [activeServer]: (prev[activeServer] || 0) + 1
    }));
    
    toast.info(`Switching to Server ${nextIndex + 1}`, {
      description: "If video doesn't load, try another server",
      duration: 3000
    });
    
    setActiveServer(nextServer);
  };

  const handleServerSwitch = (server: "server1" | "server2" | "server3" | "server4") => {
    setActiveServer(server);
    setLastWorkingServer(server);
    const serverNames = {
      server1: "1 (VidSrc)",
      server2: "2 (2embed)",
      server3: "3 (MultiEmbed)",
      server4: "4 (Embed.su)"
    };
    toast.info(`Switched to Server ${serverNames[server]}`, {
      description: "If video doesn't load, try another server",
      duration: 3000
    });
  };

  // Don't use handleIframeError as it can cause false positives
  // Instead we'll rely on manual server switching

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
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4 flex flex-col h-screen">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackNavigation}
            className="text-white hover:text-primary transition-colors flex items-center"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-xl font-medium text-white ml-4 truncate">{title}</h1>
        </div>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <Button 
            size="sm" 
            variant={activeServer === "server1" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => handleServerSwitch("server1")}
          >
            <MonitorPlay size={16} />
            Server 1
          </Button>
          <Button 
            size="sm" 
            variant={activeServer === "server2" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => handleServerSwitch("server2")}
          >
            <MonitorPlay size={16} />
            Server 2
          </Button>
          <Button 
            size="sm" 
            variant={activeServer === "server3" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => handleServerSwitch("server3")}
          >
            <MonitorPlay size={16} />
            Server 3
          </Button>
          <Button 
            size="sm" 
            variant={activeServer === "server4" ? "default" : "outline"} 
            className="gap-2"
            onClick={() => handleServerSwitch("server4")}
          >
            <MonitorPlay size={16} />
            Server 4
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="w-full h-full relative rounded-lg overflow-hidden bg-muted animate-fade-in">
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 opacity-0 pointer-events-none" id="loading-overlay">
                <div className="flex flex-col items-center">
                  <RotateCw className="h-10 w-10 text-primary animate-spin" />
                  <p className="mt-4 text-sm">Loading video...</p>
                </div>
              </div>
              
              <iframe
                ref={iframeRef}
                key={activeServer}
                src={embedUrls[activeServer]}
                title={title}
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </div>
            
            <div className="flex justify-center mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/50 border-white/20 text-white hover:bg-white/20 gap-2"
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
                className="bg-black/50 border-white/20 text-white hover:bg-white/20 gap-2"
                onClick={tryNextServer}
              >
                <RotateCw size={14} />
                Try another server
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
