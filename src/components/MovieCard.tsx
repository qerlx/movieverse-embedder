import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, Calendar, Clock, Eye, Heart, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "./FavoriteButton";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  item: any;
  type: "movie" | "tv";
  isRanked?: boolean;
  rank?: number;
  priority?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "detailed" | "compact";
  showFavorite?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  isRanked = false, 
  rank,
  priority = false,
  className = "",
  size = "md",
  variant = "default",
  showFavorite = true
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "tv") {
      // For TV shows, go to show detail to select episode
      navigate(`/${type}/${item.id}`);
    } else {
      // For movies, go directly to watch
      navigate(`/watch/movie/${item.id}`);
    }
  };

  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/placeholder.svg";

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const runtime = item.runtime;
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : null;
  const overview = item.overview || "";

  const sizeConfig = {
    sm: {
      aspectRatio: "aspect-[2/3]",
      titleSize: "text-xs md:text-sm",
      playButton: "w-8 h-8",
      playIcon: "w-4 h-4"
    },
    md: {
      aspectRatio: "aspect-[2/3]",
      titleSize: "text-sm md:text-base",
      playButton: "w-10 h-10 md:w-12 md:h-12",
      playIcon: "w-5 h-5 md:w-6 md:h-6"
    },
    lg: {
      aspectRatio: "aspect-[2/3]",
      titleSize: "text-base md:text-lg",
      playButton: "w-12 h-12 md:w-14 md:h-14",
      playIcon: "w-6 h-6 md:w-7 md:h-7"
    }
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative group cursor-pointer",
        variant === "compact" ? "w-full" : "",
        className
      )}
      onClick={handleClick}
    >
      {/* Rank Badge */}
      {isRanked && rank && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -left-3 top-3 z-30 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-sm px-3 py-1 rounded-r-xl shadow-xl border-2 border-yellow-300"
        >
          #{rank}
        </motion.div>
      )}

      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-md border border-white/10 group-hover:border-primary/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20">
        {/* Poster Image */}
        <div className={cn("relative overflow-hidden", config.aspectRatio)}>
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            loading={priority ? "eager" : "lazy"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.svg') {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Enhanced Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Top Row - Rating and Favorite */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-20">
            {/* Rating Badge */}
            {rating && Number(rating) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-400/30 shadow-lg"
              >
                <Star size={10} fill="currentColor" />
                <span>{rating}</span>
              </motion.div>
            )}
            
            {/* Favorite Button */}
            {showFavorite && (
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <FavoriteButton
                  id={item.id}
                  type={type}
                  title={title}
                  posterPath={item.poster_path}
                  variant="iconOnly"
                  size="sm"
                />
              </div>
            )}
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:opacity-100 group-hover:scale-100",
                config.playButton
              )}
              onClick={handleWatchClick}
            >
              <Play className={cn(config.playIcon, "ml-1")} fill="white" />
            </motion.div>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {year && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                    <Calendar size={8} className="mr-1" />
                    {year}
                  </Badge>
                )}
                
                {runtime && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                    <Clock size={8} className="mr-1" />
                    {runtime}m
                  </Badge>
                )}
                
                <Badge 
                  variant="secondary" 
                  className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold"
                >
                  {type.toUpperCase()}
                </Badge>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/${type}/${item.id}`);
                }}
              >
                <Info size={12} className="mr-1" />
                More Info
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Content - Always Visible */}
        <div className="p-3 md:p-4 space-y-2">
          <h3 className={cn(
            "font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300",
            config.titleSize
          )}>
            {title}
          </h3>
          
          {variant === "detailed" && overview && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {overview}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {year}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-primary/60 rounded-full"></div>
              <span className="uppercase font-medium text-primary/80">{type}</span>
            </div>
          </div>

          {variant !== "compact" && (
            <div className="pt-2 border-t border-border/50">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg text-xs"
                onClick={handleWatchClick}
              >
                <Play size={12} className="mr-1.5" />
                {type === "tv" ? "Watch Series" : "Watch Movie"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;