import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  item: any;
  type: "movie" | "tv";
  isRanked?: boolean;
  rank?: number;
  priority?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  isRanked = false, 
  rank,
  priority = false,
  className = "",
  size = "md",
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "tv") {
      navigate(`/${type}/${item.id}`);
    } else {
      navigate(`/watch/movie/${item.id}`);
    }
  };

  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder.svg";

  const title = item.title || item.name;
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : null;

  const sizeConfig = {
    sm: "w-28 md:w-32",
    md: "w-36 md:w-44",
    lg: "w-44 md:w-52"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative group cursor-pointer flex-shrink-0",
        sizeConfig[size],
        className
      )}
      onClick={handleClick}
    >
      {/* Rank Badge */}
      {isRanked && rank && (
        <div className="absolute -left-2 top-2 z-30 bg-primary text-primary-foreground font-bold text-xs px-2 py-0.5 rounded">
          #{rank}
        </div>
      )}

      <div className="relative overflow-hidden rounded-md bg-card">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading={priority ? "eager" : "lazy"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.svg') {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          {rating && Number(rating) > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-foreground font-medium">{rating}</span>
            </div>
          )}

          {/* Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center shadow-xl"
              onClick={handlePlayClick}
            >
              <Play className="w-5 h-5 text-background ml-0.5" fill="currentColor" />
            </motion.button>
          </div>

          {/* Title on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-foreground text-sm font-medium line-clamp-2 drop-shadow-lg">
              {title}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;