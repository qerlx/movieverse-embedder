
import React from "react";
import { Star, Clock, Calendar, Film, Play, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MovieInfoCardProps {
  movie: any;
  onWatchClick: () => void;
  children?: React.ReactNode;
  showHeroLayout?: boolean;
}

const MovieInfoCard: React.FC<MovieInfoCardProps> = ({ 
  movie, 
  onWatchClick, 
  children, 
  showHeroLayout = false 
}) => {
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Unknown";
  
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";

  if (showHeroLayout) {
    // Hero layout similar to the TV show design
    return (
      <div className="relative min-h-screen">
        {movie.backdrop_path && (
          <div className="absolute inset-0">
            <motion.div 
              initial={{ filter: "blur(20px)", opacity: 0, scale: 1.1 }}
              animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
            />
            {/* Blue gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/80 to-blue-600/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-6 pt-20 pb-12">
          {/* Hero Content */}
          <div className="flex flex-col items-center justify-center text-center py-20">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              {/* Movie Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                {movie.title}
              </h1>
              
              {/* Tagline */}
              {movie.tagline && (
                <p className="text-xl md:text-2xl text-white/90 font-light mb-6">
                  {movie.tagline}
                </p>
              )}
            </motion.div>

            {/* Large Play Button */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <Button
                onClick={onWatchClick}
                className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-110"
                size="icon"
              >
                <Play size={32} className="text-white ml-1" fill="white" />
              </Button>
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mb-8"
            >
              <p className="text-white/80 text-sm uppercase tracking-wide mb-2">
                NOW STREAMING
              </p>
              <div className="flex items-center justify-center gap-4 text-white/70">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {formattedRuntime}
                </span>
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
                <span>{releaseYear}</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-4 mt-8"
            >
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
              >
                <Heart size={20} className="text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20"
              >
                <Plus size={20} className="text-white" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Original compact card layout
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
};

export default MovieInfoCard;
