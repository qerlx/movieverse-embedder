
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader, LibraryBig } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import CollectionShowcase from "@/components/CollectionShowcase";
import { toast } from "sonner";
import { 
  fetchCollection, 
  fetchMCUList, 
  fetchDCUList, 
  fetchStarWarsCollection,
  fetchPixarCollection
} from "@/lib/collections";
import type { Collection } from "@/types";

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Featured collection IDs
  const featuredCollectionIds = [
    573436, // Spider-Verse
    328,    // Jurassic Park
    1241,   // Harry Potter
    119,    // Lord of the Rings
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
        // Fetch special collections
        const [mcuCollection, dcuCollection, starWarsCollection, pixarCollection] = await Promise.all([
          fetchMCUList(),
          fetchDCUList(),
          fetchStarWarsCollection(),
          fetchPixarCollection(),
        ]);
        
        // Fetch all regular collections
        const collectionsPromises = featuredCollectionIds.map(id => fetchCollection(id));
        
        // Wait for all collections to load
        const collections = await Promise.all(collectionsPromises);
        
        // Combine special collections with regular ones
        const allCollections = [
          mcuCollection, 
          dcuCollection,
          starWarsCollection,
          pixarCollection,
          ...collections
        ];
        
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array(10).fill(0).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {collections.map((collection) => (
              <CollectionShowcase 
                key={collection.id} 
                collection={collection} 
                showMovieCount 
                showYearRange
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Collections;
