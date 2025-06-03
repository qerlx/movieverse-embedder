
import React, { memo } from "react";
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

const MovieCard: React.FC<MovieCardProps> = memo(({ 
  item, 
  type, 
  className,
  priority = false,
  isRanked = false,
  index = 0
}) => {
  const navigate = useNavigate();
  
  const posterPath = item.poster_path 
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
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
    
    if (type === "movie") {
      navigate(`/watch/movie/${item.id}`);
    } else {
      navigate(`/watch/tv/${item.id}/1/1`);
    }
  };
  
  const hasProgress = (item as any).progress !== undefined;
  
  return (
    <div 
      className={cn(
        "relative w-full group cursor-pointer",
        "transition-transform duration-200 ease-out",
        "hover:scale-105 hover:z-10",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank indicator */}
      {isRanked && (
        <div className="absolute -left-1 -top-1 z-20 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full opacity-90"></div>
          <div className="absolute inset-0.5 bg-black/90 rounded-full"></div>
          <span className="relative text-xs sm:text-sm font-black text-purple-400 z-10">
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-gray-900 shadow-lg">
        {/* Media Type Indicator */}
        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center">
          {type === 'tv' ? (
            <Tv size={12} className="text-purple-400 mr-1" />
          ) : (
            <Film size={12} className="text-purple-400 mr-1" />
          )}
          <span className="text-xs font-medium text-white">
            {type === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>

        {/* Poster Image */}
        <img 
          src={posterPath} 
          alt={title || 'Poster'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
          loading={priority ? "eager" : "lazy"}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== '/placeholder.svg') {
              target.src = '/placeholder.svg';
            }
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        
        {/* Rating */}
        {item.vote_average && item.vote_average > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 backdrop-blur-sm flex items-center">
            <Star size={10} className="text-yellow-500 mr-1 fill-yellow-500" />
            <span className="text-xs font-medium text-white">{item.vote_average.toFixed(1)}</span>
          </div>
        )}
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          <h3 className="text-sm font-semibold text-white mb-3 line-clamp-2 text-center leading-tight">
            {title}
          </h3>
          
          <button
            onClick={handlePlayClick}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 font-medium text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play</span>
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      {hasProgress && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-1 w-full bg-black/50 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400" 
              style={{ width: `${(item as any).progress || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;
