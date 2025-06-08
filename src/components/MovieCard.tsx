
import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardProps {
  item: any;
  type: "movie" | "tv";
  isRanked?: boolean;
  rank?: number;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  item, 
  type, 
  isRanked = false, 
  rank, 
  className = "" 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : "/placeholder.svg";

  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Rank Badge */}
      {isRanked && rank && (
        <div className="absolute -left-3 top-2 z-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg px-2 py-1 rounded-r-md shadow-lg">
          #{rank}
        </div>
      )}

      <div className="relative overflow-hidden rounded-lg shadow-lg bg-black/20 backdrop-blur-sm border border-white/10 group-hover:border-primary/30 transition-all duration-300">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.svg') {
                target.src = '/placeholder.svg';
              }
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              className="bg-primary/90 backdrop-blur-sm text-white rounded-full p-3 shadow-xl"
            >
              <Play size={24} className="ml-1" />
            </motion.div>
          </div>

          {/* Rating Badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} />
              {item.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-white/60">
            {year && (
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{year}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1 text-primary/80">
              <div className="w-1 h-1 bg-primary rounded-full"></div>
              <span className="uppercase font-medium">{type}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
