
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails, getTVShowDetails } from "@/lib/api";
import { ArrowLeft, MonitorPlay, RotateCw, ThumbsUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory, addToFavorites, removeFromFavorites, isFavorite } from "@/lib/watchService";

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [embedUrls, setEmbedUrls] = useState<{server1: string, server2: string, server3: string}>({
    server1: "",
    server2: "",
    server3: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<"server1" | "server2" | "server3">("server1");
  const [lastWorkingServer, setLastWorkingServer] = useState<"server1" | "server2" | "server3">("server1");
  const [isFavorited, setIsFavorited] = useState(false);

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
            server1: `https://embed.su/embed/movie/${itemId}`,
            server2: `https://www.2embed.cc/embed/${itemId}`,
            server3: `https://vidsrc.to/embed/movie/${itemId}`
          });
          
          if (currentUser) {
            await addToWatchHistory(currentUser, {
              id: itemId,
              type: "movie",
              title: movieData.title,
              posterPath: movieData.poster_path,
              progress: 0
            });
            
            // Check if movie is in favorites
            const isMovieFavorited = await isFavorite(currentUser, "movie", itemId);
            setIsFavorited(isMovieFavorited);
          }
        } else if (type === "tv" && season && episode) {
          const tvData = await getTVShowDetails(itemId);
          setTitle(`${tvData.name} - S${season} E${episode}`);
          setPosterPath(tvData.poster_path);
          setEmbedUrls({
            server1: `https://embed.su/embed/tv/${itemId}/${season}/${episode}`,
            server2: `https://www.2embed.cc/embedtv/${itemId}&s=${season}&e=${episode}`,
            server3: `https://vidsrc.to/embed/tv/${itemId}/${season}/${episode}`
          });
          
          if (currentUser) {
            const episodeNum = parseInt(episode);
            const seasonNum = parseInt(season);
            
            let episodeName = `Episode ${episodeNum}`;
            if (tvData.seasons) {
              const currentSeason = tvData.seasons.find(s => s.season_number === seasonNum);
              if (currentSeason) {
                episodeName = `${currentSeason.name}: Episode ${episodeNum}`;
              }
            }
            
            await addToWatchHistory(currentUser, {
              id: itemId,
              type: "tv",
              title: tvData.name,
              posterPath: tvData.poster_path,
              lastEpisode: {
                season: seasonNum,
                episode: episodeNum,
                name: episodeName
              }
            });
            
            // Check if show is in favorites
            const isShowFavorited = await isFavorite(currentUser, "tv", itemId);
            setIsFavorited(isShowFavorited);
          }
        } else {
          throw new Error("Invalid parameters for TV show");
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        toast({
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
  }, [id, type, season, episode, navigate, toast, currentUser]);

  const handleServerSwitch = (server: "server1" | "server2" | "server3") => {
    setActiveServer(server);
    setLastWorkingServer(server);
    const serverNames = {
      server1: "1 (Embed.su)",
      server2: "2 (2embed)",
      server3: "3 (VidSrc)"
    };
    toast({
      title: `Switched to Server ${serverNames[server]}`,
      description: "If video doesn't load, try another server",
    });
  };

  const handleIframeError = () => {
    console.log("Iframe error detected");
    if (activeServer === lastWorkingServer) {
      const serverOptions: ("server1" | "server2" | "server3")[] = ["server1", "server2", "server3"];
      const currentIndex = serverOptions.indexOf(activeServer);
      const nextServer = serverOptions[(currentIndex + 1) % serverOptions.length];
      
      toast({
        title: "Playback Issue",
        description: `Server error. Trying next server...`,
        variant: "destructive",
      });
      setActiveServer(nextServer);
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

  const handleFavoriteToggle = async () => {
    if (!currentUser || !id || !type) return;
    
    const itemId = parseInt(id);
    try {
      if (isFavorited) {
        await removeFromFavorites(currentUser, type as "movie" | "tv", itemId);
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: `${title} has been removed from your favorites.`,
        });
      } else {
        await addToFavorites(currentUser, {
          id: itemId,
          type: type as "movie" | "tv",
          title,
          posterPath
        });
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: `${title} has been added to your favorites.`,
        });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
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
          
          <div className="ml-auto flex space-x-2">
            {currentUser && (
              <Button
                size="sm"
                variant="ghost"
                className={`gap-2 ${isFavorited ? 'text-red-500' : 'text-white'}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={16} className={isFavorited ? "fill-current" : ""} />
                {isFavorited ? "Favorited" : "Favorite"}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
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
                key={activeServer}
                src={embedUrls[activeServer]}
                title={title}
                frameBorder="0"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                onError={handleIframeError}
              ></iframe>
            </div>
            
            <div className="flex justify-center mt-4 space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/50 border-white/20 text-white hover:bg-white/20 gap-2"
                onClick={() => {
                  toast({
                    title: "Thanks for the feedback!",
                    description: "We'll improve our video sources.",
                  });
                }}
              >
                <ThumbsUp size={14} />
                Working well
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/50 border-white/20 text-white hover:bg-white/20 gap-2"
                onClick={() => {
                  const serverOptions: ("server1" | "server2" | "server3")[] = ["server1", "server2", "server3"];
                  const currentIndex = serverOptions.indexOf(activeServer);
                  const nextServer = serverOptions[(currentIndex + 1) % serverOptions.length];
                  handleServerSwitch(nextServer);
                }}
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
