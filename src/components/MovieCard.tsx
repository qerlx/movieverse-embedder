
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { Play, Star } from "lucide-react";
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
    if (!item.id) return;
    navigate(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.id) return;
    
    // Direct navigation to Vidora player
    if (type === "movie") {
      navigate(`/watch/movie/${item.id}`);
    } else {
      // For TV shows, navigate to first episode
      navigate(`/watch/tv/${item.id}/1/1`);
    }
  };
  
  // Check if we have progress information (for continue watching)
  const hasProgress = (item as any).progress !== undefined;
  
  return (
    <div 
      className={cn(
        "relative h-full w-full group",
        "cursor-pointer premium-movie-poster",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className="absolute -left-3 -top-3 z-10 h-12 w-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/50 rounded-full blur-md opacity-70"></div>
          <div className="absolute inset-0.5 bg-black rounded-full"></div>
          <span className="relative text-xl font-black text-primary">
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-poster relative overflow-hidden rounded-xl">
        {/* Poster Image */}
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Blurred backdrop overlay when hovered */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-200"></div>
        
        {/* Rating indicator */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm flex items-center shadow-md">
            <Star size={10} className="text-yellow-500 mr-1" />
            <span className="text-xs font-medium text-white">{item.vote_average.toFixed(1)}</span>
          </div>
        )}
        
        {/* Play button overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-white hover:bg-primary/90 shadow-lg mb-2 transition-transform"
          >
            <Play className="text-white ml-0.5" size={22} />
          </button>
          
          <h3 className="font-medium text-center text-white text-shadow px-3 text-sm line-clamp-2 max-w-[90%]">
            {title}
          </h3>
        </div>
      </div>
      
      {/* Progress bar for watched items */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1.5 w-full bg-black/50">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70" 
              style={{ width: `${(item as any).progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Info panel */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-black/80 backdrop-blur-sm border-t border-white/10">
        <h3 className="font-medium text-sm text-center line-clamp-1 text-white/90 text-shadow-sm">
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
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
