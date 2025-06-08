
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
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-6"
    >
      <Card className="border-primary/20 bg-black/40 backdrop-blur-md overflow-hidden hover:border-primary/30 transition-all">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gradient">Movie Details</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Film size={16} className="text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Movie</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Enhanced Movie Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20">
                  <Star size={20} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-white/60 font-medium">Rating</p>
                  <p className="text-lg font-bold text-white">{movie.vote_average.toFixed(1)}/10</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20">
                <Clock size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/60 font-medium">Duration</p>
                <p className="text-lg font-bold text-white">{formattedRuntime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/30 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
                <Calendar size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/60 font-medium">Release</p>
                <p className="text-lg font-bold text-white">{releaseYear}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-white/90 mb-3">Genres</h4>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1.5 text-sm rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary-foreground hover:border-primary/50 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Overview */}
          {movie.overview && (
            <div>
              <h4 className="text-base font-semibold text-white/90 mb-3">Overview</h4>
              <p className="text-white/70 leading-relaxed">{movie.overview}</p>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={onWatchClick}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white gap-2 rounded-full py-6 text-base font-medium shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02]"
            >
              <Play size={18} />
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
