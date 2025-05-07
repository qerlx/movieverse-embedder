
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import CollectionShowcase from "@/components/CollectionShowcase";
import { fetchCollection, fetchMCUCollection, searchCollections } from "@/lib/collections";
import type { Collection } from "@/types";

const Collections = () => {
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [searchResults, setSearchResults] = useState<Collection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();
  
  // Featured collection IDs
  const featuredCollectionIds = [
    573436, // Spider-Verse
    84979,  // MCU (special handling as it's a list)
    328,    // Jurassic Park
    1241,   // Harry Potter
    119,    // Lord of the Rings
    10,     // Star Wars
    263,    // The Dark Knight
    131635  // Hunger Games
  ];

  useEffect(() => {
    const loadFeaturedCollections = async () => {
      setIsLoading(true);
      try {
        // Fetch all regular collections
        const collectionsPromises = featuredCollectionIds.filter(id => id !== 84979).map(id => fetchCollection(id));
        
        // Fetch MCU collection separately (it's handled differently)
        const mcuPromise = fetchMCUCollection();
        
        // Wait for all collections to load
        const [mcu, ...collections] = await Promise.all([
          mcuPromise, 
          ...collectionsPromises
        ]);
        
        // Combine MCU with other collections and filter out any failed fetches
        const allCollections = [mcu, ...collections].filter(Boolean);
        
        // Sort alphabetically by name
        allCollections.sort((a, b) => a.name.localeCompare(b.name));
        
        setFeaturedCollections(allCollections);
      } catch (error) {
        console.error("Error loading featured collections:", error);
        toast({
          title: "Error",
          description: "Failed to load featured collections. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedCollections();
  }, []);

  // Handle search
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchCollections(searchQuery);
          setSearchResults(results.results || []);
        } catch (error) {
          console.error("Error searching collections:", error);
          toast({
            title: "Search Error",
            description: "Failed to search collections. Please try again later.",
            variant: "destructive"
          });
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-6 pb-16"
      >
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Movie Collections
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore curated film collections and franchises
          </p>
        </div>

        {/* Featured Collections */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold">Featured Collections</h2>
            <Badge variant="glass" className="text-xs">
              {featuredCollections.length} Collections
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
            </div>
          ) : (
            <div className="relative -mx-4">
              <div className="px-4 py-2 overflow-x-auto scrollbar-none">
                <div className="flex space-x-4 pb-4 min-w-max">
                  {featuredCollections.map((collection) => (
                    <CollectionShowcase 
                      key={collection.id} 
                      collection={collection}
                      showMovieCount
                      showYearRange
                      width={isMobile ? 180 : 220}
                    />
                  ))}
                </div>
              </div>
              
              {/* Gradient fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
          )}
        </section>

        {/* Search Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Find More Collections</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for movie collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 bg-black/40 backdrop-blur-lg border-white/10 hover:border-white/30 focus:border-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="animate-spin text-primary" size={18} />
                </div>
              )}
            </div>
          </div>

          {searchQuery.length >= 2 && (
            <div>
              {isSearching ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div key={index} className="flex flex-col space-y-3">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6">
                      {searchResults.map((collection) => (
                        <CollectionShowcase 
                          key={collection.id} 
                          collection={collection}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-black/20 rounded-lg border border-white/5">
                      <p className="text-muted-foreground">No collections found matching "{searchQuery}"</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-12 bg-black/20 rounded-lg border border-white/5">
              <Search className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="text-muted-foreground">Type to search for movie collections</p>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
};

export default Collections;
