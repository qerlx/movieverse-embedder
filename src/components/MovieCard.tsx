
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
    <motion.div 
      className={cn(
        "relative h-full w-full overflow-hidden shadow-md transition-all duration-300",
        "cursor-pointer group bg-card rounded-lg",
        className
      )}
      onClick={handleClick}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className="absolute -left-2 -top-2 z-10 h-10 w-10 flex items-center justify-center">
          <span className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-full blur-sm"></span>
          <span className="relative text-xl font-extrabold text-white">
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3] relative">
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover rounded-t-lg"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Episode badge for TV shows with last episode info */}
        {type === 'tv' && lastEpisode && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded bg-primary/80 backdrop-blur-sm text-primary-foreground">
            S{lastEpisode.season}:E{lastEpisode.episode}
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all transform bg-primary/90 hover:bg-primary group-hover:scale-100 scale-75 opacity-0 group-hover:opacity-100"
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
            className="h-1 bg-secondary"
            indicatorClassName="bg-primary"
          />
        </div>
      )}
      
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1">
          {title}
        </h3>
        <div className="text-xs mt-1 text-muted-foreground">
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
    </motion.div>
  );
};

export default MovieCard;
