
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LibraryBig } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchCollection, fetchMCUList } from "@/lib/collections";
import CollectionCard from "@/components/CollectionCard";
import type { Collection } from "@/types";

const Collections = () => {
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
        const collectionsPromises = featuredCollectionIds.map(async (id) => {
          try {
            return await fetchCollection(id);
          } catch (error) {
            console.error(`Failed to fetch collection ${id}:`, error);
            return null;
          }
        });
        
        // Wait for all collections to load
        const collectionsResults = await Promise.all(collectionsPromises);
        const validCollections = collectionsResults.filter(collection => collection !== null);
        
        // Combine MCU with other collections
        const allCollections = [mcuCollection, ...validCollections];
        
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(12).fill(0).map((_, index) => (
              <div key={index} className="overflow-hidden">
                <div className="aspect-[16/9] relative">
                  <Skeleton className="w-full h-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Collections;
