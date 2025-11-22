import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { Movie } from "@/types";
import { useState } from "react";

interface MoviePosterCardProps {
  movie: Movie;
  onInfoClick: () => void;
  onPlayClick: () => void;
}

export const MoviePosterCard = ({ movie, onInfoClick, onPlayClick }: MoviePosterCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg";

  return (
    <motion.div
      className="relative group cursor-pointer flex-shrink-0 w-40 md:w-48"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.3 }}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4"
        >
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
            {movie.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            {movie.release_date && (
              <>
                <span className="text-white/60 text-xs">•</span>
                <span className="text-white/80 text-xs">
                  {new Date(movie.release_date).getFullYear()}
                </span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayClick();
              }}
              className="flex-1 bg-white text-black rounded-md py-1.5 px-3 flex items-center justify-center gap-1 hover:bg-white/90 transition-colors text-xs font-semibold"
            >
              <Play className="h-3 w-3 fill-current" />
              Play
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInfoClick();
              }}
              className="bg-white/20 text-white rounded-md py-1.5 px-3 flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Rating Badge (always visible) */}
      {!isHovered && movie.vote_average > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="text-white text-xs font-semibold">{movie.vote_average.toFixed(1)}</span>
        </div>
      )}
    </motion.div>
  );
};
