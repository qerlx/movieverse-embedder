
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MovieCardProps {
  item: Movie | TVShow;
  type: "movie" | "tv";
  className?: string;
  priority?: boolean;
  isRanked?: boolean;
  index?: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  className,
  priority = false,
  isRanked = false,
  index = 0
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';
  
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder.svg";
    
  const title = "title" in item ? item.title : item.name;
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Handle TV show episode navigation if available
    if (type === 'tv' && (item as any).lastEpisode) {
      const lastEpisode = (item as any).lastEpisode;
      navigate(`/watch/tv/${item.id}/${lastEpisode.season}/${lastEpisode.episode}`);
    } else {
      navigate(`/watch/${type}/${item.id}`);
    }
  };
  
  // Check if we have progress information (for continue watching)
  const hasProgress = (item as any).progress !== undefined;
  const lastEpisode = (item as any).lastEpisode;
  
  return (
    <div 
      className={cn(
        "group relative h-full w-full rounded-lg overflow-hidden shadow-md transition-all duration-300",
        "cursor-pointer hover:shadow-xl movie-card-hover",
        isNetflix ? "bg-zinc-900" : "bg-card",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className={cn(
          "absolute z-10",
          isNetflix ? "-left-3 bottom-1" : "-left-2 -top-4"
        )}>
          <span className={cn(
            "font-extrabold drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]",
            isNetflix 
              ? "text-5xl text-red-600 netflix-rank-number" 
              : "text-4xl text-white"
          )}>
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3] relative">
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Episode badge for TV shows with last episode info */}
        {type === 'tv' && lastEpisode && (
          <div className={cn(
            "absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded",
            isNetflix ? "bg-red-600 text-white" : "bg-primary text-primary-foreground"
          )}>
            S{lastEpisode.season}:E{lastEpisode.episode}
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <button
            onClick={handlePlayClick}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all transform",
              "group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100",
              isNetflix ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
            )}
          >
            <Play className="text-white ml-0.5" size={20} />
          </button>
        </div>
      </div>
      
      {/* Progress bar for watched items */}
      {hasProgress && (
        <div className="absolute bottom-[60px] left-0 right-0">
          <Progress 
            value={(item as any).progress || 0} 
            className={cn(
              "h-1",
              isNetflix ? "bg-gray-800" : "bg-secondary"
            )}
            indicatorClassName={isNetflix ? "bg-red-600" : undefined}
          />
        </div>
      )}
      
      <div className="p-2">
        <h3 className={cn(
          "font-semibold text-sm line-clamp-1",
          isNetflix ? "text-gray-300" : ""
        )}>
          {title}
        </h3>
        <div className={cn(
          "text-xs mt-1",
          isNetflix ? "text-gray-400" : "text-muted-foreground"
        )}>
          {("release_date" in item && item.release_date) && (
            <time dateTime={item.release_date}>
              {new Date(item.release_date).getFullYear()}
            </time>
          )}
          {("first_air_date" in item && item.first_air_date) && (
            <time dateTime={item.first_air_date}>
              {new Date(item.first_air_date).getFullYear()}
            </time>
          )}
          
          {lastEpisode && (
            <span className="ml-2">
              • S{lastEpisode.season}:E{lastEpisode.episode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
