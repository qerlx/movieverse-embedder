
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LibraryBig, Film, Calendar, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchCollection, fetchMCUList } from "@/lib/collections";
import type { Collection } from "@/types";

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Featured collection IDs with more variety
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
    748,    // X-Men
    422834, // Godzilla MonsterVerse
    87359,  // Mission: Impossible
    8091,   // Alien
    1709,   // Scream
    91361,  // Halloween
    8945,   // Mad Max
    434,    // Lethal Weapon
    1582,   // Tremors
    86066,  // Sherlock Holmes
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

  const handleCollectionClick = (collection: Collection) => {
    // For now, we'll navigate to the movies page with a search for the collection name
    // In a real app, you'd have a dedicated collection detail page
    navigate(`/movies?search=${encodeURIComponent(collection.name)}`);
  };

  return (
    <div className="min-h-screen pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-6 pb-16"
      >
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LibraryBig className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Collections
            </h1>
          </div>
          <p className="text-muted-foreground">
            Explore popular film franchises and series
          </p>
          
          {!isLoading && (
            <Badge variant="premium" className="text-xs py-1.5 mt-4">
              {collections.length} Featured Collections
            </Badge>
          )}
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(12).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-[16/9] relative">
                  <Skeleton className="w-full h-full rounded-none" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection} 
                onClick={() => handleCollectionClick(collection)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Individual collection card component
const CollectionCard = ({ 
  collection, 
  onClick 
}: { 
  collection: Collection;
  onClick: () => void;
}) => {
  // Sort parts by release date to get year range
  const sortedParts = [...collection.parts].sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  // Get years range
  const firstYear = sortedParts[0]?.release_date?.split('-')[0] || 'N/A';
  const lastYear = sortedParts[sortedParts.length - 1]?.release_date?.split('-')[0] || 'N/A';
  const yearRange = firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;
  
  // Calculate average rating
  const moviesWithRatings = collection.parts.filter(movie => movie.vote_average);
  const avgRating = moviesWithRatings.length 
    ? (moviesWithRatings.reduce((total, movie) => total + movie.vote_average, 0) / moviesWithRatings.length).toFixed(1)
    : null;

  // Use backdrop for card image, fallback to poster
  const imageUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/w780${collection.backdrop_path}`
    : collection.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
    : "/placeholder.svg";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
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
              {collection.parts.length} {collection.parts.length === 1 ? 'Movie' : 'Movies'}
            </Badge>
          </div>
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {collection.name}
            </h3>
            
            <div className="flex items-center gap-2">
              {yearRange !== 'N/A' && (
                <Badge variant="secondary" size="sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  {yearRange}
                </Badge>
              )}
              
              {avgRating && (
                <Badge variant="warning" size="sm">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                  {avgRating}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Card Content */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-0">
              View Collection →
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Collections;
