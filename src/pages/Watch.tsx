import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ArrowLeft, Maximize, Minimize, Volume2, VolumeX, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { toast } from "sonner";

const Watch = () => {
  const { type, id, season, episode } = useParams<{
    type: "movie" | "tv";
    id: string;
    season?: string;
    episode?: string;
  }>();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [genres, setGenres] = useState<number[]>([]);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const itemId = parseInt(id);
        
        if (type === "movie") {
          const data = await getMovieDetails(itemId);
          setTitle(data.title);
          setPosterPath(data.poster_path);
          setGenres(data.genres?.map((g: any) => g.id) || []);
        } else if (type === "tv" && season && episode) {
          const tvData = await getTVShowDetails(itemId);
          setTitle(tvData.name);
          setPosterPath(tvData.poster_path);
          setGenres(tvData.genres?.map((g: any) => g.id) || []);
          
          try {
            const seasonData = await getTVShowSeasonDetails(
              itemId,
              parseInt(season)
            );
            
            const episodeData = seasonData.episodes?.find(
              (ep: any) => ep.episode_number === parseInt(episode)
            );
            
            if (episodeData) {
              setEpisodeTitle(episodeData.name);
            }
          } catch (error) {
            console.error("Error fetching episode details:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        uiToast({
          title: "Error",
          description: "Failed to load content details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id, type, season, episode, uiToast]);

  useEffect(() => {
    // Add to watch history when the video starts playing
    const addHistory = async () => {
      if (!currentUser || !id || isLoading || !title) return;
      
      try {
        if (type === "movie") {
          await addToWatchHistory(currentUser, {
            id: parseInt(id),
            type: "movie",
            title,
            posterPath,
            progress: 0,
            genres
          });
        } else if (type === "tv" && season && episode) {
          await addToWatchHistory(currentUser, {
            id: parseInt(id),
            type: "tv",
            title,
            posterPath,
            lastEpisode: {
              season: parseInt(season),
              episode: parseInt(episode),
              name: episodeTitle || `Episode ${episode}`
            },
            genres
          });
        }
      } catch (error) {
        console.error("Error adding to watch history:", error);
      }
    };

    // Add a small delay to ensure all data is loaded
    const timer = setTimeout(() => {
      addHistory();
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentUser, id, type, season, episode, title, posterPath, isLoading, episodeTitle, genres]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleGoBack = () => {
    if (type === "movie") {
      navigate(`/movie/${id}`);
    } else if (type === "tv") {
      navigate(`/tv/${id}`);
    } else {
      navigate(-1);
    }
  };

  const getVideoTitle = () => {
    if (type === "movie") {
      return title;
    } else if (type === "tv") {
      return `${title} - Season ${season}, Episode ${episode}${
        episodeTitle ? `: ${episodeTitle}` : ""
      }`;
    }
    return "Loading...";
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="relative w-full h-screen" ref={videoContainerRef}>
        {/* Video player */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          {isLoading ? (
            <div className="text-white">
              <Skeleton className="w-16 h-16 rounded-full bg-gray-800" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-xl mb-4">
                  This is a demo app. No real video playback is available.
                </p>
                <p className="text-gray-400 mb-8">
                  In a real application, a video player would be integrated here.
                </p>
                <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70 opacity-100 transition-opacity duration-300 flex flex-col">
          {/* Top bar */}
          <div className="p-4 flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={24} />
            </Button>
            
            <div className="text-white font-medium truncate max-w-[70%]">
              {getVideoTitle()}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <X size={24} />
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="mt-auto p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Settings size={20} />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
