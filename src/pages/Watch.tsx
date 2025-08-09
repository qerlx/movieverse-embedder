import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getMovieDetails, getTVShowDetails, getTVShowSeasonDetails } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { addToWatchHistory } from "@/lib/firebase-watch";

// Vidora theme color - vibrant purple that matches theme
const VIDORA_THEME_COLOR = "8B5CF6"; // Purple color
// Storage key for watch progress
const STORAGE_KEY = 'watch_progress';

// Video sources definition
interface VideoSource {
  id: string;
  name: string;
  getUrl: (type: string, id: string, season?: string, episode?: string) => string;
}

const videoSources: VideoSource[] = [
  {
    id: "vidora",
    name: "Vidora",
    getUrl: (type, id, season, episode) => {
      const baseUrl = type === "movie" 
        ? `https://vidora.su/movie/${id}?autoplay=true&colour=${VIDORA_THEME_COLOR}`
        : `https://vidora.su/tv/${id}/${season}/${episode}?autoplay=true&colour=${VIDORA_THEME_COLOR}&autonextepisode=true`;
      
      // Ensure the URL is properly formed with encoded parameters
      const backbuttonUrl = encodeURIComponent(`${window.location.origin}/${type}/${id}`);
      const logoUrl = encodeURIComponent(`${window.location.origin}/placeholder.svg`);
      
      return `${baseUrl}&backbutton=${backbuttonUrl}&pausescreen=true&logo=${logoUrl}`;
    }
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://vidsrc.cc/v2/embed/movie/${id}`;
      } else {
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
      }
    }
  },
  {
    id: "vidzee",
    name: "Vidzee",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://vidzee.wtf/movie/movie.php?id=${id}`;
      } else {
        return `https://vidzee.wtf/tv/tv.php?id=${id}&season=${season}&episode=${episode}`;
      }
    }
  },
  {
    id: "vidjoy",
    name: "Vidjoy",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://vidjoy.pro/embed/movie/${id}?adFree=true`;
      } else {
        return `https://vidjoy.pro/embed/tv/${id}/${season}/${episode}?adFree=true`;
      }
    }
  }
];

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
  const [videoUrl, setVideoUrl] = useState("");
  const [activeSource, setActiveSource] = useState<VideoSource>(videoSources[0]);
  
  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Parse source from query params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sourceParam = searchParams.get('source');
    
    if (sourceParam) {
      const foundSource = videoSources.find(src => src.id === sourceParam);
      if (foundSource) {
        setActiveSource(foundSource);
      }
    }
  }, [location.search]);

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

  // Handle switching video source
  const switchVideoSource = (source: VideoSource) => {
    setIsLoading(true);
    setActiveSource(source);
    
    if (type && id) {
      const url = source.getUrl(type, id, season, episode);
      setVideoUrl(url);
      
      // Update URL with source parameter without navigating
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('source', source.id);
      const newUrl = `${location.pathname}?${searchParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
      
      // Small delay to ensure proper loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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
          
          // Use Vidora's built-in progress tracking
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
                mediaId: mediaData.id.toString(),
                mediaType: mediaData.type,
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
        
        if (type === "movie") {
          const movieData = await getMovieDetails(itemId);
          setTitle(movieData.title);
          
          // Set URL using the active source
          setVideoUrl(activeSource.getUrl(type, id));

          if (currentUser) {
            try {
              await addToWatchHistory(currentUser, {
                mediaId: itemId.toString(),
                mediaType: "movie",
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
          
          // Set URL using the active source
          setVideoUrl(activeSource.getUrl(type, id, season, episode));

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
                  mediaId: itemId.toString(),
                  mediaType: "tv",
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
  }, [id, type, season, episode, navigate, currentUser, activeSource]);

  return (
    <div className="min-h-screen bg-black">
      <div className="h-screen w-screen relative">
        {/* Enhanced source switcher with better mobile support */}
        <div className="absolute top-4 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackNavigation}
            className="bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full transition-all duration-200 border border-white/10 shadow-lg"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
            {videoSources.map((source) => (
              <Button 
                key={source.id}
                size="sm"
                variant={activeSource.id === source.id ? "default" : "outline"}
                onClick={() => switchVideoSource(source)}
                className={`
                  ${activeSource.id === source.id 
                    ? 'bg-purple-600 hover:bg-purple-700 border-purple-500 shadow-lg shadow-purple-600/20' 
                    : 'bg-black/50 text-white border-white/20 hover:bg-black/70 backdrop-blur-md'
                  }
                  rounded-full transition-all duration-200 text-xs sm:text-sm font-medium min-w-[60px] shadow-lg
                `}
              >
                {source.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Enhanced loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-40">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-lg font-medium">Loading {activeSource.name}...</p>
            <p className="text-gray-400 text-sm mt-2">{title}</p>
          </div>
        )}
        
        {/* Video Player iframe - REMOVED SANDBOX ATTRIBUTE */}
        {videoUrl && (
          <div
            ref={playerContainerRef}
            className="w-full h-full"
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          >
            <iframe
              ref={iframeRef}
              src={videoUrl}
              title={title}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full absolute inset-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              style={{ zIndex: 10 }}
              referrerPolicy="no-referrer"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
