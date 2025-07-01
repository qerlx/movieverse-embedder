
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Film, Tv, Star, Calendar, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { collections } from "@/lib/collections";

const Collections = () => {
  const navigate = useNavigate();
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const collectionsData = await Promise.all(
          collections.map(async (collection) => {
            try {
              const data = await collection.fetchFunction();
              return {
                ...collection,
                itemCount: data?.results?.length || data?.length || 0,
                items: data?.results || data || []
              };
            } catch (error) {
              console.error(`Error loading collection ${collection.name}:`, error);
              return {
                ...collection,
                itemCount: 0,
                items: []
              };
            }
          })
        );
        setFeaturedCollections(collectionsData);
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="relative w-16 h-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-3 border-t-primary border-r-primary/30 border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/5 to-blue-500/10" />
        <div className="container mx-auto px-6 py-16">
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Collections
              </h1>
            </div>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Discover curated collections of the best movies and TV shows, organized by themes, genres, and popular franchises.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="container mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <Card className="border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full">
                {/* Collection Image/Preview */}
                <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20">
                  {collection.items.length > 0 && collection.items[0].poster_path ? (
                    <div className="flex">
                      {collection.items.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="flex-1 h-32 sm:h-40 md:h-48 relative">
                          <img
                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              transform: `translateX(${idx * -15}px)`,
                              zIndex: 3 - idx
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                          {collection.type === 'movie' ? (
                            <Film size={24} className="text-primary" />
                          ) : (
                            <Tv size={24} className="text-primary" />
                          )}
                        </div>
                        <p className="text-white/60 text-sm">No items available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Collection Badge */}
                  <div className="absolute top-2 left-2 md:top-3 md:left-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-black/60 backdrop-blur-sm text-white border-white/20 text-xs"
                    >
                      {collection.itemCount} items
                    </Badge>
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "backdrop-blur-sm border-white/20 text-white text-xs",
                        collection.type === 'movie' 
                          ? "bg-blue-500/20 border-blue-500/30" 
                          : "bg-purple-500/20 border-purple-500/30"
                      )}
                    >
                      {collection.type === 'movie' ? (
                        <><Film size={10} className="mr-1" /> Movies</>
                      ) : (
                        <><Tv size={10} className="mr-1" /> TV Shows</>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3 md:space-y-4">
                    {/* Title */}
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2">
                        {collection.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs md:text-sm text-white/60">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center gap-1">
                          <Users size={10} className="md:w-3 md:h-3" />
                          <span className="hidden sm:inline">Popular</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={10} className="md:w-3 md:h-3" />
                          <span className="hidden sm:inline">Curated</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Updated</span>
                      </div>
                    </div>

                    {/* View Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 text-white rounded-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20 text-sm"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/collections/${collection.id}`);
                      }}
                    >
                      Explore Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {featuredCollections.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Collections Available</h3>
              <p className="text-white/60 mb-6">
                Collections are currently being prepared. Check back soon for curated content!
              </p>
              <Button 
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Browse All Content
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function for conditional classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default Collections;
