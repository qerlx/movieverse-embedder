
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader, LibraryBig } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { fetchCollection, fetchMCUList } from "@/lib/collections";
import type { Collection, Movie } from "@/types";
import FavoriteButton from "@/components/FavoriteButton";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Featured collection IDs
  const featuredCollectionIds = [
    573436, // Spider-Verse
    328,    // Jurassic Park
    1241,   // Harry Potter
    119,    // Lord of the Rings
    10,     // Star Wars
    263,    // The Dark Knight
    131635, // Hunger Games
    86311,  // Avengers
    645,    // James Bond
    9485,   // Fast & Furious
    295,    // Pirates of the Caribbean
    2344,   // The Matrix
  ];

  useEffect(() => {
    const loadFeaturedCollections = async () => {
      setIsLoading(true);
      try {
        // Fetch MCU list separately as it's handled differently
        const mcuCollection = await fetchMCUList();
        
        // Fetch all regular collections
        const collectionsPromises = featuredCollectionIds.map(id => fetchCollection(id));
        
        // Wait for all collections to load
        const collections = await Promise.all(collectionsPromises);
        
        // Combine MCU with other collections
        const allCollections = [mcuCollection, ...collections];
        
        // Sort alphabetically by name
        allCollections.sort((a, b) => a.name.localeCompare(b.name));
        
        setCollections(allCollections);
      } catch (error) {
        console.error("Error loading featured collections:", error);
        toast.error("Failed to load collections. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedCollections();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-6 pb-16"
      >
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LibraryBig className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Movie Collections
              </h1>
              <p className="text-muted-foreground mt-2">
                Explore popular film franchises and series
              </p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Badge variant="premium" className="text-xs py-1.5">
              {collections.length} Featured Collections
            </Badge>
          </div>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8">
            {Array(4).fill(0).map((_, index) => (
              <Card key={index} className="border-white/10 bg-black/40 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-16 w-12 rounded-md" />
                    <div>
                      <Skeleton className="h-7 w-48 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Separate component for each collection card
const CollectionCard = ({ collection }: { collection: Collection }) => {
  // Sort parts by release date
  const sortedParts = [...collection.parts].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Get years range
  const firstYear = sortedParts[0]?.release_date?.split('-')[0] || 'N/A';
  const lastYear = sortedParts[sortedParts.length - 1]?.release_date?.split('-')[0] || 'N/A';
  
  // Calculate average rating
  const moviesWithRatings = collection.parts.filter(movie => movie.vote_average);
  const avgRating = moviesWithRatings.length 
    ? (moviesWithRatings.reduce((total, movie) => total + movie.vote_average, 0) / moviesWithRatings.length).toFixed(1)
    : null;

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
      <CardContent className="p-6">
        {/* Collection Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="shrink-0">
            <div className="relative aspect-[2/3] h-32 sm:h-40 rounded-md overflow-hidden border border-white/10">
              {collection.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w342${collection.poster_path}`}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-center p-2">No image</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{collection.name}</h2>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="collection">
                {collection.parts.length} {collection.parts.length === 1 ? 'Movie' : 'Movies'}
              </Badge>
              
              {firstYear !== 'N/A' && (
                <Badge variant="secondary">
                  {firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`}
                </Badge>
              )}
              
              {avgRating && (
                <Badge variant="warning">
                  ★ {avgRating}
                </Badge>
              )}
            </div>
            
            {collection.overview && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {collection.overview}
              </p>
            )}
          </div>
        </div>
        
        {/* Movies Carousel */}
        <div className="my-4">
          <h3 className="text-lg font-medium mb-3">Movies in this collection</h3>
          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {sortedParts.map((movie: Movie) => (
                <CarouselItem key={movie.id} className="pl-4 md:basis-1/3 lg:basis-1/4">
                  <MovieCard movie={movie} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-4 flex justify-end gap-2">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
};

// Individual movie card component
const MovieCard = ({ movie }: { movie: Movie }) => {
  const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'TBA';
  
  return (
    <div className="rounded-md overflow-hidden border border-white/10 bg-black/20 hover:border-white/30 transition-all h-full flex flex-col">
      <Link to={`/movie/${movie.id}`} className="block relative">
        <div className="aspect-[2/3] bg-black/40 relative">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`} 
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-black/50">
              <span className="text-xs text-center p-2">No image</span>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <FavoriteButton 
              itemId={movie.id} 
              itemType="movie" 
              title={movie.title}
              posterPath={movie.poster_path}
              size="icon" 
            />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-2">
            <div className="flex justify-between items-center">
              <Badge variant="glass" className="text-xs">{releaseYear}</Badge>
              {movie.vote_average > 0 && (
                <Badge variant="warning" className="text-xs">★ {movie.vote_average.toFixed(1)}</Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={`/movie/${movie.id}`} className="hover:text-primary transition-colors">
          <h4 className="font-medium text-sm line-clamp-2">{movie.title}</h4>
        </Link>
      </div>
    </div>
  );
};

export default Collections;
