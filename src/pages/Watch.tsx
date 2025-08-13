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
    name: "Vidora Pro",
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
    name: "VidSrc HD",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://vidsrc.cc/v2/embed/movie/${id}`;
      } else {
        return `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`;
      }
    }
  },
  {
    id: "vidsrcpro",
    name: "VidSrc Pro",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://vidsrc.pro/embed/movie/${id}`;
      } else {
        return `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`;
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
    id: "embedsu",
    name: "EmbedSu",
    getUrl: (type, id, season, episode) => {
      if (type === "movie") {
        return `https://embed.su/embed/movie/${id}`;
      } else {
        return `https://embed.su/embed/tv/${id}/${season}/${episode}`;
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
        {/* Enhanced Player Controls */}
        <div className="absolute top-0 left-0 w-full h-full z-40 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {/* Top Control Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackNavigation}
                  className="bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 rounded-full transition-all duration-300 border border-white/10 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  <span className="font-medium">Back</span>
                </Button>
                
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-white/90 max-w-md truncate">
                    {title}
                  </h1>
                  <p className="text-xs text-white/60 mt-1">
                    Playing on {activeSource.name}
                  </p>
                </div>
              </div>

              {/* Source Switcher */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="text-xs text-white/60 hidden sm:block mr-2">Quality:</span>
                {videoSources.map((source) => (
                  <Button 
                    key={source.id}
                    size="sm"
                    variant="ghost"
                    onClick={() => switchVideoSource(source)}
                    className={`
                      ${activeSource.id === source.id 
                        ? 'bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/20' 
                        : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                      rounded-lg transition-all duration-300 text-xs font-medium min-w-[50px] border backdrop-blur-xl hover:scale-105 shadow-md
                    `}
                  >
                    {source.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="pointer-events-auto">
                <p className="text-sm font-medium text-white/90 mb-1">{title}</p>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>Live</span>
                  </div>
                  <span>•</span>
                  <span>{activeSource.name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 rounded-lg transition-all duration-300 border border-white/10"
                >
                  HD
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black z-50">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center max-w-md px-4">
              <h2 className="text-white text-xl font-bold mb-2">Loading Video</h2>
              <p className="text-white/80 text-lg font-medium mb-2">{activeSource.name}</p>
              <p className="text-white/60 text-sm">{title}</p>
              <div className="mt-4 flex items-center justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-primary rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
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
