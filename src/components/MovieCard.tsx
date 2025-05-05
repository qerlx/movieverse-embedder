
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { Play, Star, Tv, Film } from "lucide-react";

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
    e.preventDefault();
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
        "cursor-pointer shadow-md hover:shadow-lg hover:shadow-purple-900/20 transition-shadow duration-200",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className="absolute -left-2 -top-2 z-10 h-10 w-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full blur-[2px] opacity-90"></div>
          <div className="absolute inset-0.5 bg-black/80 rounded-full"></div>
          <span className="relative text-base font-black text-purple-400">
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
        {/* Media Type Indicator */}
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm flex items-center">
          {type === 'tv' ? (
            <Tv size={12} className="text-purple-400 mr-1" />
          ) : (
            <Film size={12} className="text-purple-400 mr-1" />
          )}
          <span className="text-[10px] font-medium text-white">
            {type === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>

        {/* Poster Image */}
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          loading={priority ? "eager" : "lazy"}
        />

        {/* Overlay with gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-200"></div>
        
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
            className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/90 text-white hover:bg-purple-600 shadow-lg mb-2 transition-transform"
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
          <div className="h-1 w-full bg-black/50">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400" 
              style={{ width: `${(item as any).progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;
