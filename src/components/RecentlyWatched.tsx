
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchHistory } from "@/lib/watchService";
import { Movie, TVShow } from "@/types";
import MovieCard from "./MovieCard";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ChevronRight, Play, Clock, Tv, Film } from "lucide-react";
import { Progress } from "./ui/progress";

// Storage key for watch progress - for local client-side favorites
const STORAGE_KEY = 'watch_progress';

// Define a type for the watch history items that includes Vidora's structure
interface WatchHistoryItem {
  id: number;
  title: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
  genre_ids?: number[];
  progress?: number; 
  lastEpisode?: { 
    season: number; 
    episode: number;
    name?: string;
  };
  media_type?: string;
  type?: string;
}

const RecentlyWatched: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get watch history from local service
        const history = await getWatchHistory(currentUser) as unknown as WatchHistoryItem[];

        // Also check Vidora's local storage for additional items
        try {
          const vidoraProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          
          // Convert Vidora progress to our format
          const vidoraItems = Object.entries(vidoraProgress).map(([id, data]: [string, any]) => {
            const itemId = parseInt(id);
            if (isNaN(itemId)) return null;
            
            // Create a properly typed object
            const item: WatchHistoryItem = {
              id: itemId,
              type: data.type || 'movie',
              title: data.title || 'Unknown Title',
              name: data.title || 'Unknown Title',
              poster_path: data.poster_path,
              progress: data.progress?.percent || 0,
              lastEpisode: data.type === 'tv' ? {
                season: data.season || 1,
                episode: data.episode || 1,
                name: data.episode_title || `Episode ${data.episode || 1}`
              } : undefined,
              media_type: data.type || 'movie',
              // Add minimum required properties
              backdrop_path: null,
              overview: '',
              vote_average: 0,
              first_air_date: '',
              genre_ids: []
            };
            
            return item;
          }).filter(Boolean) as WatchHistoryItem[];
          
          // Merge with our history (prioritizing our own data)
          const existingIds = new Set(history.map(item => item.id));
          const uniqueVidoraItems = vidoraItems.filter(item => !existingIds.has(item.id));
          
          setWatchHistory([...history, ...uniqueVidoraItems]);
        } catch (error) {
          console.error("Error parsing Vidora progress:", error);
          setWatchHistory(history);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
        setWatchHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchHistory();
  }, [currentUser]);

  const handleSeeAllClick = () => {
    navigate("/profile");
  };

  // Don't render anything if there's no watch history or not logged in
  if (!currentUser || watchHistory.length === 0) {
    return null;
  }

  // Show placeholder while loading
  if (isLoading) {
    return (
      <div className="py-4 animate-pulse">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-muted-foreground/20 rounded mb-6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="aspect-[2/3] bg-muted-foreground/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleContinueWatching = (item: WatchHistoryItem) => {
    if (item.type === 'tv' && item.lastEpisode) {
      navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
    } else {
      navigate(`/watch/${item.media_type || item.type || 'movie'}/${item.id}`);
    }
  };

  return (
    <div className="py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center">
            <Clock className="text-purple-500 mr-2" size={20} />
            <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
              Recently Watched
            </span>
          </h2>
          <button
            onClick={handleSeeAllClick}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              "text-muted-foreground hover:text-purple-500"
            )}
          >
            See All
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {watchHistory.slice(0, 6).map((item, index) => {
            const mediaType = item.media_type || item.type || "movie";
            return (
              <div key={`${mediaType}-${item.id}-${index}`} className="relative">
                <MovieCard 
                  item={{
                    id: item.id,
                    title: item.title || item.name || "Unknown",
                    name: item.name || item.title || "Unknown",
                    poster_path: item.poster_path || null,
                    backdrop_path: item.backdrop_path || null,
                    overview: item.overview || "",
                    vote_average: item.vote_average || 0,
                    release_date: item.release_date || "",
                    first_air_date: item.first_air_date || "",
                    genre_ids: item.genre_ids || [],
                    progress: item.progress,
                  }}
                  type={mediaType === "tv" ? "tv" : "movie"} 
                  priority={true} 
                />
                
                {/* Play button overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  onClick={() => handleContinueWatching(item)}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500">
                    <Play size={20} className="text-white ml-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentlyWatched;
