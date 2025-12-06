import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { Movie } from "@/types";

interface MoviePosterCardProps {
  movie: Movie;
  onInfoClick: () => void;
  onPlayClick: () => void;
}

export const MoviePosterCard = ({ movie, onInfoClick, onPlayClick }: MoviePosterCardProps) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg";

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative group cursor-pointer flex-shrink-0 w-32 md:w-40"
      onClick={onInfoClick}
    >
      <div className="relative overflow-hidden rounded-md bg-card">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
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
              className="w-11 h-11 bg-foreground/90 hover:bg-foreground rounded-full flex items-center justify-center shadow-xl"
              onClick={(e) => {
                e.stopPropagation();
                onPlayClick();
              }}
            >
              <Play className="w-5 h-5 text-background ml-0.5" fill="currentColor" />
            </motion.button>
          </div>

          {/* Title & Year on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-foreground text-xs font-medium line-clamp-2 drop-shadow-lg">
              {movie.title}
            </h3>
            {year && (
              <span className="text-muted-foreground text-xs">{year}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
