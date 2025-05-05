
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Custom theme color for Vidora player - vibrant teal that matches theme
  const vidoraThemeColor = "00ff9d";

  // Handle back navigation
  const handleBackNavigation = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      if (type === "movie") {
        navigate(`/movie/${id}`);
      } else if (type === "tv" && id) {
        navigate(`/tv/${id}`);
      } else {
        navigate('/');
      }
    }
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
        
        // Build Vidora parameters
        let backbuttonUrl;
        if (type === "movie") {
          backbuttonUrl = `${window.location.origin}/movie/${id}`;
        } else {
          backbuttonUrl = `${window.location.origin}/tv/${id}`;
        }
        
        // Ensure the URL is properly encoded
        const encodedBackbuttonUrl = encodeURIComponent(backbuttonUrl);
        const logoUrl = encodeURIComponent(`${window.location.origin}/placeholder.svg`);
        
        if (type === "movie") {
          const movieData = await getMovieDetails(itemId);
          setTitle(movieData.title);
          setPosterPath(movieData.poster_path);
          
          // Set URL for Vidora with properly formatted parameters
          setVidoraUrl(`https://vidora.su/movie/${itemId}?autoplay=true&colour=${vidoraThemeColor}&backbutton=${encodedBackbuttonUrl}&pausescreen=true&logo=${logoUrl}`);

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
          
          // Set URL for Vidora with properly formatted parameters and built-in next episode support
          setVidoraUrl(`https://vidora.su/tv/${itemId}/${season}/${episode}?autoplay=true&colour=${vidoraThemeColor}&backbutton=${encodedBackbuttonUrl}&pausescreen=true&autonextepisode=true&logo=${logoUrl}`);

          try {
            // Fix for seasonData not being defined
            const seasonDetails = await getTVShowSeasonDetails(itemId, seasonNumber);
            
            let episodeName = "";
            if (seasonDetails && seasonDetails.episodes) {
              const episodeData = seasonDetails.episodes.find((e: any) => e.episode_number === episodeNumber);
              if (episodeData) {
                episodeName = episodeData.name;
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
          } catch (error) {
            console.error("Error with season details:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-black">
      <div className="container mx-auto px-0 py-0 flex flex-col h-screen">
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
              className="flex-1 flex flex-col relative"
            >
              {/* Back button overlay - faint and in top left corner */}
              <div className="absolute top-4 left-4 z-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackNavigation}
                  className="bg-black/30 text-white hover:bg-black/50 rounded-full transition-opacity opacity-70 hover:opacity-100"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  <span>Back</span>
                </Button>
              </div>
              
              {/* Vidora Player - full screen iframe with proper styling */}
              <div
                ref={playerContainerRef}
                className="w-full h-full relative overflow-hidden"
              >
                {vidoraUrl && (
                  <iframe
                    ref={iframeRef}
                    src={vidoraUrl}
                    title={title}
                    frameBorder="0"
                    allowFullScreen
                    className="w-full h-full absolute inset-0 bg-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{ zIndex: 10 }}
                  ></iframe>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Watch;
