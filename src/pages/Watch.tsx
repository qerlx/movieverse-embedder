
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/watchService";

// Vidora theme color - vibrant purple that matches theme
const VIDORA_THEME_COLOR = "8B5CF6"; // Changed to a purple color
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
  const { currentUser } = useAuth();
  
  // Content info
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [vidoraUrl, setVidoraUrl] = useState("");
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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
    // Handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        if (mediaData.id && (mediaData.type === 'movie' || mediaData.type === 'tv')) {
          console.log('Progress update received:', mediaData);
          
          // Use Vidora's built-in progress tracking, but still save locally
          let watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
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
              addToWatchHistory(currentUser, {
                id: mediaData.id,
                type: mediaData.type,
                title: mediaData.title || '',
                posterPath: mediaData.poster_path || '',
                progress: progress,
              }).catch(err => console.error("Failed to update watch history:", err));
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
          
          // Set URL for Vidora with properly formatted parameters
          setVidoraUrl(`https://vidora.su/movie/${itemId}?autoplay=true&colour=${VIDORA_THEME_COLOR}&backbutton=${encodedBackbuttonUrl}&pausescreen=true&logo=${logoUrl}`);

          if (currentUser) {
            try {
              await addToWatchHistory(currentUser, {
                id: itemId,
                type: "movie",
                title: movieData.title,
                posterPath: movieData.poster_path || '',
                progress: 0,
                genres: movieData.genres?.map((g: any) => g.id) || []
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
          
          // Set URL for Vidora with properly formatted parameters and built-in next episode support
          setVidoraUrl(`https://vidora.su/tv/${itemId}/${season}/${episode}?autoplay=true&colour=${VIDORA_THEME_COLOR}&backbutton=${encodedBackbuttonUrl}&pausescreen=true&autonextepisode=true&logo=${logoUrl}`);

          try {
            // Get episode details if available
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
                  posterPath: tvData.poster_path || '',
                  lastEpisode: {
                    season: parseInt(season),
                    episode: parseInt(episode),
                    name: episodeName || "Episode " + episode
                  },
                  genres: tvData.genres?.map((g: any) => g.id) || []
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
        toast.error("Failed to load media. Please try again later.");
        navigate(-1);
      } finally {
        // Small delay to ensure UI transitions correctly
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchDetails();
  }, [id, type, season, episode, navigate, currentUser]);

  return (
    <div className="min-h-screen bg-black">
      <div className="h-screen w-screen relative">
        {/* Back button - faint and positioned top-left */}
        <div className="absolute top-6 left-6 z-50">
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
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Vidora Player - full screen iframe with proper styling */}
        {vidoraUrl && (
          <div
            ref={playerContainerRef}
            className="w-full h-full"
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          >
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
