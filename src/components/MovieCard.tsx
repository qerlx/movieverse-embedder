
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { Play, Star } from "lucide-react";
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
        "relative h-full w-full overflow-hidden",
        "cursor-pointer rounded-xl group premium-movie-poster",
        className
      )}
      onClick={handleClick}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className="absolute -left-2 -top-2 z-10 h-10 w-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-full blur-sm"></div>
          <span className="relative text-xl font-extrabold text-white">
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3] relative">
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover rounded-xl"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Episode badge for TV shows with last episode info */}
        {type === 'tv' && lastEpisode && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground">
            S{lastEpisode.season}:E{lastEpisode.episode}
          </div>
        )}
        
        {/* Rating indicator */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 right-2 px-1.5 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center">
            <Star size={12} className="text-yellow-500 mr-0.5" />
            <span className="text-xs font-medium text-white">{item.vote_average.toFixed(1)}</span>
          </div>
        )}
        
        {/* Play button overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-500">
          <button
            onClick={handlePlayClick}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all transform bg-primary text-white hover:bg-primary/90 group-hover:scale-100 scale-0 opacity-0 group-hover:opacity-100 shadow-lg mb-2"
          >
            <Play className="text-white ml-1" size={24} />
          </button>
          
          <h3 className="font-semibold text-center text-white text-shadow px-3 opacity-0 group-hover:opacity-100 transition-all duration-500 mt-2">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Progress bar for watched items */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0">
          <Progress 
            value={(item as any).progress || 0} 
            className="h-1.5 bg-background/30"
            indicatorClassName="bg-primary"
          />
        </div>
      )}
      
      {/* Title and info panel - only shown on non-hover for cleaner look */}
      <div className="p-3 bg-black/80 backdrop-blur-md rounded-b-xl border-t border-white/5">
        <h3 className="font-semibold text-sm text-center line-clamp-1 text-white/90">
          {title}
        </h3>
        <div className="text-xs mt-1 text-center text-white/60">
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
