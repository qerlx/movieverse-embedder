
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Star, Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchCollection } from "@/lib/collections";
import MovieCard from "@/components/MovieCard";
import LogoTitle from "@/components/LogoTitle";
import type { Collection } from "@/types";

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
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
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Collection not found</h1>
          <Button onClick={() => navigate("/collections")}>
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const backdropUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${collection.backdrop_path}`
    : null;

  // Sort movies by release date
  const sortedMovies = [...(collection.parts || [])].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Get year range
  const firstYear = sortedMovies[0]?.release_date?.split('-')[0] || 'N/A';
  const lastYear = sortedMovies[sortedMovies.length - 1]?.release_date?.split('-')[0] || 'N/A';
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-end">
        {/* Background */}
        {backdropUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        )}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 pb-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collections")}
              className="mb-6 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Button>

            {/* Title */}
            <div className="mb-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {collection.name}
              </h1>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <Badge variant="secondary" className="text-sm">
                <Calendar className="mr-1 h-3 w-3" />
                {yearRange}
              </Badge>
              
              <Badge variant="info" className="text-sm">
                <Film className="mr-1 h-3 w-3" />
                {collection.parts?.length || 0} Movies
              </Badge>
            </div>

            {/* Overview */}
            {collection.overview && (
              <p className="text-lg text-gray-200 leading-relaxed max-w-3xl">
                {collection.overview}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Film className="mr-2 h-6 w-6 text-primary" />
            Movies in Collection
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedMovies.map((movie, index) => (
              <MovieCard
                key={movie.id}
                item={movie}
                type="movie"
                isRanked={true}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionDetail;
