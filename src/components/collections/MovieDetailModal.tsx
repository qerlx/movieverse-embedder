import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Plus, ThumbsUp, Calendar, Star } from "lucide-react";
import { Movie } from "@/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MovieDetailModal = ({ movie, isOpen, onClose }: MovieDetailModalProps) => {
  const navigate = useNavigate();

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const handlePlayClick = () => {
    navigate(`/watch/movie/${movie.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-4xl bg-background rounded-xl overflow-hidden shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header with Backdrop */}
              <div className="relative h-[400px]">
                {backdropUrl && (
                  <img
                    src={backdropUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Title & Actions */}
                <div className="absolute bottom-8 left-8 right-8">
                  <h2 className="text-4xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
                    {movie.title}
                  </h2>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 font-semibold"
                      onClick={handlePlayClick}
                    >
                      <Play className="h-5 w-5 mr-2 fill-current" />
                      Watch Now
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-full h-11 w-11"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm rounded-full h-11 w-11"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Info Row */}
                <div className="flex items-center gap-4 mb-6 text-sm">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-semibold">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {movie.release_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-white/60" />
                      <span className="text-white/80">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    </div>
                  )}

                  {movie.runtime && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="text-white/80">{movie.runtime} min</span>
                    </>
                  )}
                </div>

                {/* Overview */}
                <p className="text-white/90 text-base leading-relaxed mb-6">
                  {movie.overview}
                </p>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
