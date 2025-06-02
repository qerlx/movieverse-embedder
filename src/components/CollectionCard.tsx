
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Star, Film, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    ? `https://image.tmdb.org/t/p/w780${collection.backdrop_path}`
    : collection.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
    : "/placeholder.svg";

  const handleClick = () => {
    // Navigate to the first movie in the collection or search for the collection
    if (collection.parts && collection.parts.length > 0) {
      navigate(`/movie/${collection.parts[0].id}`);
    } else {
      navigate(`/movies?search=${encodeURIComponent(collection.name)}`);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={handleClick}
    >
      <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-md hover:border-white/30 transition-all group">
        {/* Collection Image */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Movie Count Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="glass" className="backdrop-blur-sm">
              <Film className="w-3 h-3 mr-1" />
              {collection.parts?.length || 0} {(collection.parts?.length || 0) === 1 ? 'Movie' : 'Movies'}
            </Badge>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-purple-600/90 hover:bg-purple-700 rounded-lg px-6 py-3 flex items-center space-x-2 backdrop-blur-sm">
              <Play className="w-5 h-5 text-white fill-white" />
              <span className="text-white font-medium">Play</span>
            </div>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
              {collection.name}
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
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
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CollectionCard;
