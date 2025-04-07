
import React from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

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
  
  return (
    <div 
      className={cn(
        "group relative h-full w-full rounded-lg overflow-hidden shadow-md transition-all duration-300",
        "cursor-pointer hover:shadow-xl hover:scale-105",
        isNetflix ? "bg-zinc-900" : "bg-card",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank indicator for ranked lists */}
      {isRanked && (
        <div className="absolute -left-3 bottom-1 z-10">
          <span className={cn(
            "text-5xl font-extrabold",
            isNetflix ? "text-red-600" : "text-primary",
            "opacity-90 drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
          )}>
            {index + 1}
          </span>
        </div>
      )}
      
      <div className="aspect-[2/3]">
        <img 
          src={posterPath} 
          alt={title}
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      <div className="p-2">
        <h3 className={cn(
          "font-semibold text-sm line-clamp-1",
          isNetflix && "text-gray-300"
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
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
