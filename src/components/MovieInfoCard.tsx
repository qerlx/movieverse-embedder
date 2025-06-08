
import React from "react";
import { Star, Clock, Calendar, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface MovieInfoCardProps {
  movie: any;
  onWatchClick: () => void;
  children?: React.ReactNode;
}

const MovieInfoCard: React.FC<MovieInfoCardProps> = ({ movie, onWatchClick, children }) => {
  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Unknown";
  
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-8"
    >
      <Card className="border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gradient">Movie Details</h3>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Film size={16} className="text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Movie</span>
            </div>
          </div>
          
          {/* Movie Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
                  <Star size={18} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Rating</p>
                  <p className="font-semibold text-white">{movie.vote_average.toFixed(1)}/10</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
                <Clock size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Duration</p>
                <p className="font-semibold text-white">{formattedRuntime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                <Calendar size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Release</p>
                <p className="font-semibold text-white">{releaseYear}</p>
              </div>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white/80 mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 text-xs rounded-full bg-primary/20 border border-primary/30 text-primary-foreground"
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
              <p className="text-white/70 leading-relaxed text-sm">{movie.overview}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onWatchClick}
              className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2 rounded-full py-3 text-base font-medium shadow-lg hover:shadow-primary/30 transition-all"
            >
              <Film size={18} />
              Watch Now
            </Button>
            
            {children && (
              <div className="flex gap-2 sm:flex-row">
                {children}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MovieInfoCard;
