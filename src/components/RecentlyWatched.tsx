
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getWatchHistory } from "@/lib/watchService";
import { Movie, TVShow } from "@/types";
import MovieCard from "./MovieCard";
import NetflixMovieCard from "./NetflixMovieCard";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ChevronRight, Play } from "lucide-react";
import { Progress } from "./ui/progress";

const RecentlyWatched: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [watchHistory, setWatchHistory] = useState<(Movie | TVShow)[]>([]);
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
        // Cast the return value to Match Movie or TVShow type
        const history = await getWatchHistory(currentUser) as unknown as (Movie | TVShow)[];
        setWatchHistory(history);
      } catch (error) {
        console.error("Error fetching watch history:", error);
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

  const isNetflix = theme === 'netflix';

  // Section title based on theme
  const getSectionTitle = () => {
    return isNetflix 
      ? "Continue Watching" 
      : "Recently Watched";
  };

  const handleContinueWatching = (item: any) => {
    if (item.type === 'tv' && item.lastEpisode) {
      navigate(`/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`);
    } else {
      navigate(`/watch/${item.media_type || 'movie'}/${item.id}`);
    }
  };

  return (
    <div className={cn("py-6", isNetflix && "mt-6")}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn(
            "text-xl md:text-2xl font-bold",
            isNetflix && "text-white"
          )}>
            {getSectionTitle()}
          </h2>
          <button
            onClick={handleSeeAllClick}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              isNetflix ? "text-gray-400 hover:text-white" : "text-muted-foreground hover:text-primary"
            )}
          >
            See All
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {watchHistory.slice(0, 6).map((item: any, index) => (
            <div key={`${(item as any).media_type || "movie"}-${item.id}-${index}`} className="relative">
              {isNetflix ? (
                <NetflixMovieCard 
                  item={item} 
                  type={(item as any).media_type === "tv" ? "tv" : "movie"} 
                  index={index}
                />
              ) : (
                <MovieCard 
                  item={item} 
                  type={(item as any).media_type === "tv" ? "tv" : "movie"} 
                  priority={true} 
                />
              )}
              
              {/* Episode info if available */}
              {item.lastEpisode && (
                <div className={cn(
                  "absolute bottom-12 left-0 right-0 bg-black/70 px-2 py-1",
                  "text-[10px] text-white"
                )}>
                  S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                </div>
              )}
              
              {/* Progress bar */}
              <Progress 
                value={item.progress || 10} 
                className={cn(
                  "h-1 w-full absolute bottom-0 left-0",
                  isNetflix ? "bg-gray-800" : "bg-secondary"
                )}
              />
              
              {/* Play button overlay */}
              <div 
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                onClick={() => handleContinueWatching(item)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  isNetflix ? "bg-red-600" : "bg-primary"
                )}>
                  <Play size={20} className="text-white ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyWatched;
