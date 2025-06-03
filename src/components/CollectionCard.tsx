
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Star, Film, Play, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LogoTitle from "@/components/LogoTitle";
import type { Collection } from "@/types";

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  const navigate = useNavigate();

  // Sort parts by release date to get year range
  const sortedParts = [...(collection.parts || [])].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Get years range
  const firstYear = sortedParts[0]?.release_date?.split('-')[0] || 'N/A';
  const lastYear = sortedParts[sortedParts.length - 1]?.release_date?.split('-')[0] || 'N/A';
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;
  
  // Calculate average rating
  const moviesWithRatings = (collection.parts || []).filter(movie => movie.vote_average);
  const avgRating = moviesWithRatings.length 
    ? (moviesWithRatings.reduce((total, movie) => total + movie.vote_average, 0) / moviesWithRatings.length).toFixed(1)
    : null;

  // Use backdrop for card image, fallback to poster
  const imageUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${collection.backdrop_path}`
    : collection.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
    : "/placeholder.svg";

  const handleCollectionClick = () => {
    navigate(`/collections/${collection.id}`);
  };

  const handleMovieClick = (movieId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/movie/${movieId}`);
  };

  const handleWatchClick = (movieId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/movie/${movieId}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={handleCollectionClick}
    >
      <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-md hover:border-white/30 transition-all group">
        {/* Collection Header Image */}
        <div className="aspect-[16/9] relative overflow-hidden">
          <img
            src={imageUrl}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Movie Count Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="glass" className="backdrop-blur-sm">
              <Film className="w-3 h-3 mr-1" />
              {collection.parts?.length || 0} {(collection.parts?.length || 0) === 1 ? 'Movie' : 'Movies'}
            </Badge>
          </div>
          
          {/* Collection Title with Logo */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <LogoTitle
              id={collection.id}
              title={collection.name}
              type="movie"
              className="max-w-xs sm:max-w-sm md:max-w-md max-h-12 sm:max-h-16 object-contain mb-3"
              fallbackClassName="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3"
            />
            
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {yearRange !== 'N/A' && (
                <Badge variant="secondary" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {yearRange}
                </Badge>
              )}
              
              {avgRating && (
                <Badge variant="warning" className="text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                  {avgRating}
                </Badge>
              )}
            </div>

            {/* View Collection Button */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">View Collection</span>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sortedParts.slice(0, 6).map((movie) => (
              <motion.div
                key={movie.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group/movie cursor-pointer"
                onClick={(e) => handleMovieClick(movie.id, e)}
              >
                <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-black/60">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/movie:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs text-center p-2">
                      No Image
                    </div>
                  )}
                  
                  {/* Movie Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/movie:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <LogoTitle
                        id={movie.id}
                        title={movie.title}
                        type="movie"
                        className="max-w-full max-h-6 object-contain mb-2"
                        fallbackClassName="text-xs font-semibold text-white mb-2 line-clamp-2"
                      />
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="glass" className="text-xs">
                          {movie.release_date?.split('-')[0]}
                        </Badge>
                        
                        <button
                          onClick={(e) => handleWatchClick(movie.id, e)}
                          className="bg-purple-600/80 hover:bg-purple-700 rounded-full p-1.5 transition-colors"
                        >
                          <Play size={12} className="text-white fill-white ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  {movie.vote_average > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="warning" className="text-xs">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                        {movie.vote_average.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Show more indicator if there are more than 6 movies */}
            {sortedParts.length > 6 && (
              <div className="aspect-[2/3] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                <div className="text-center">
                  <span className="text-lg font-bold text-white">+{sortedParts.length - 6}</span>
                  <p className="text-xs text-white/70">more</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CollectionCard;
