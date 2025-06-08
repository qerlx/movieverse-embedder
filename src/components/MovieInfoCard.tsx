
import React from "react";
import { Star, Clock, Calendar, Film, Play } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mt-6"
    >
      <Card className="border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 border border-primary/30">
              <Film size={16} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-white">Details</h3>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Movie Stats */}
          <div className="grid grid-cols-3 gap-3">
            {movie.vote_average > 0 && (
              <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center justify-center mb-1">
                  <Star size={16} className="text-yellow-400" />
                </div>
                <p className="text-xs text-white/60">Rating</p>
                <p className="text-sm font-bold text-white">{movie.vote_average.toFixed(1)}</p>
              </div>
            )}
            
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-center mb-1">
                <Clock size={16} className="text-blue-400" />
              </div>
              <p className="text-xs text-white/60">Duration</p>
              <p className="text-sm font-bold text-white">{formattedRuntime}</p>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-center mb-1">
                <Calendar size={16} className="text-green-400" />
              </div>
              <p className="text-xs text-white/60">Year</p>
              <p className="text-sm font-bold text-white">{releaseYear}</p>
            </div>
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">Genres</h4>
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 4).map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/80 border border-white/10"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">Overview</h4>
              <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={onWatchClick}
              className="w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-lg py-2 text-sm font-medium"
            >
              <Play size={16} />
              Watch Now
            </Button>
            
            {children && (
              <div className="flex gap-2">
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
