
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Star, Play, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchCollection } from "@/lib/collections";
import LogoTitle from "@/components/LogoTitle";
import type { Collection } from "@/types";

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const collectionData = await fetchCollection(parseInt(id));
        setCollection(collectionData);
      } catch (error) {
        console.error("Error loading collection:", error);
        toast.error("Failed to load collection details");
      } finally {
        setIsLoading(false);
      }
    };

    loadCollection();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="container mx-auto px-4 pt-6">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-[21/9] w-full mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <Button onClick={() => navigate("/collections")}>
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const sortedParts = [...(collection.parts || [])].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  const firstYear = sortedParts[0]?.release_date?.split('-')[0] || 'N/A';
  const lastYear = sortedParts[sortedParts.length - 1]?.release_date?.split('-')[0] || 'N/A';
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;

  const moviesWithRatings = sortedParts.filter(movie => movie.vote_average);
  const avgRating = moviesWithRatings.length 
    ? (moviesWithRatings.reduce((total, movie) => total + movie.vote_average, 0) / moviesWithRatings.length).toFixed(1)
    : null;

  const backdropUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1920${collection.backdrop_path}`
    : "/placeholder.svg";

  return (
    <div className="min-h-screen pb-24">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/collections")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Collections
        </Button>
      </div>

      {/* Collection Header */}
      <div className="relative">
        <div className="aspect-[21/9] relative overflow-hidden">
          <img
            src={backdropUrl}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="container mx-auto">
              <LogoTitle
                id={collection.id}
                title={collection.name}
                type="movie"
                className="max-w-sm sm:max-w-md md:max-w-lg max-h-16 sm:max-h-20 md:max-h-24 object-contain mb-4"
                fallbackClassName="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
              />
              
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <Badge variant="glass" className="backdrop-blur-sm">
                  <Film className="w-4 h-4 mr-2" />
                  {collection.parts?.length || 0} Movies
                </Badge>
                
                {yearRange !== 'N/A' && (
                  <Badge variant="secondary">
                    <Calendar className="w-4 h-4 mr-2" />
                    {yearRange}
                  </Badge>
                )}
                
                {avgRating && (
                  <Badge variant="warning">
                    <Star className="w-4 h-4 mr-2 fill-yellow-400" />
                    {avgRating} Average
                  </Badge>
                )}
              </div>
              
              {collection.overview && (
                <p className="text-lg text-white/90 max-w-4xl leading-relaxed">
                  {collection.overview}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Movies in this Collection</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedParts.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <div className="aspect-[2/3] relative overflow-hidden rounded-lg bg-black/60">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-center p-4">
                    No Image Available
                  </div>
                )}
                
                {/* Movie Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <LogoTitle
                      id={movie.id}
                      title={movie.title}
                      type="movie"
                      className="max-w-full max-h-8 object-contain mb-3"
                      fallbackClassName="text-sm font-semibold text-white mb-3 line-clamp-2"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Badge variant="glass" className="text-xs w-fit">
                          {movie.release_date?.split('-')[0]}
                        </Badge>
                        
                        {movie.vote_average > 0 && (
                          <Badge variant="warning" className="text-xs w-fit">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                            {movie.vote_average.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/watch/movie/${movie.id}`);
                        }}
                        className="bg-purple-600/90 hover:bg-purple-700 rounded-full p-2 transition-colors"
                      >
                        <Play size={16} className="text-white fill-white ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Release Order Badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="glass" className="text-xs backdrop-blur-sm">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetail;
