
import React from "react";
import { Star, Clock, Calendar, Film, Play, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MovieInfoCardProps {
  movie: any;
  onWatchClick: () => void;
  children?: React.ReactNode;
  showCompactLayout?: boolean;
}

const MovieInfoCard: React.FC<MovieInfoCardProps> = ({ 
  movie, 
  onWatchClick, 
  children, 
  showCompactLayout = false 
}) => {
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Unknown";
  
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";

  if (showCompactLayout) {
    // Compact card layout for sidebar
    return (
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
              <Film size={16} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white">Movie Details</h3>
          </div>
          
          {/* Movie Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {movie.vote_average > 0 && (
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30">
                <div className="flex items-center justify-center mb-2">
                  <Star size={18} className="text-yellow-400" fill="currentColor" />
                </div>
                <p className="text-xs text-white/60 mb-1">Rating</p>
                <p className="text-sm font-bold text-white">{movie.vote_average.toFixed(1)}</p>
              </div>
            )}
            
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30">
              <div className="flex items-center justify-center mb-2">
                <Clock size={18} className="text-blue-400" />
              </div>
              <p className="text-xs text-white/60 mb-1">Duration</p>
              <p className="text-sm font-bold text-white">{formattedRuntime}</p>
            </div>
            
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30">
              <div className="flex items-center justify-center mb-2">
                <Calendar size={18} className="text-green-400" />
              </div>
              <p className="text-xs text-white/60 mb-1">Year</p>
              <p className="text-sm font-bold text-white">{releaseYear}</p>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/80 mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {movie.genres.slice(0, 4).map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 text-xs rounded-full bg-white/10 text-white/80 border border-white/20 hover:border-primary/30 transition-all"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/80 mb-3">Overview</h4>
              <p className="text-sm text-white/70 line-clamp-3 leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onWatchClick}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 rounded-xl py-3 text-sm font-medium shadow-lg hover:shadow-primary/20 transition-all"
            >
              <Play size={18} />
              Watch Now
            </Button>
            
            {children && (
              <div className="flex gap-2">
                {children}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default hero layout matching the streaming interface design
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      {movie.backdrop_path && (
        <div className="absolute inset-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Movie Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
          >
            {movie.title}
          </motion.h1>
          
          {/* Tagline */}
          {movie.tagline && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-white/90 font-light mb-6 max-w-2xl mx-auto"
            >
              {movie.tagline}
            </motion.p>
          )}

          {/* Movie Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-white/80 mb-8"
          >
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1.5">
                <Star size={18} className="text-yellow-400" fill="currentColor" />
                <span className="text-sm sm:text-base font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock size={18} />
              <span className="text-sm sm:text-base">{formattedRuntime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={18} />
              <span className="text-sm sm:text-base">{releaseYear}</span>
            </div>
          </motion.div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-8"
            >
              {movie.genres.slice(0, 4).map((genre: any) => (
                <span
                  key={genre.id}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-full bg-white/10 text-white/90 border border-white/20 backdrop-blur-sm"
                >
                  {genre.name}
                </span>
              ))}
            </motion.div>
          )}

          {/* Large Play Button */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <Button
              onClick={onWatchClick}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110 group"
              size="icon"
            >
              <Play size={24} className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" />
            </Button>
          </motion.div>

          {/* Overview */}
          {movie.overview && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 line-clamp-3"
            >
              {movie.overview}
            </motion.p>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfoCard;
