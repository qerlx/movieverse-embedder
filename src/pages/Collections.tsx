
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getPopularCollections } from '@/lib/api/collections';
import { Film, FolderArchive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Collections = () => {
  const navigate = useNavigate();
  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);
  
  const { data: collections, isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: getPopularCollections,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <FolderArchive className="h-7 w-7 mr-2 text-primary" />
          Movie Collections
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video h-auto rounded-xl" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !collections) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Could not load collections</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an error while trying to fetch movie collections. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <FolderArchive className="h-7 w-7 mr-2 text-primary" />
            Popular Movie Collections
          </h1>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Explore curated collections of movies organized by franchise, universe, or theme.
            Each collection brings together related films for a complete viewing experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index % 6) }}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredCardId(collection.id)}
              onHoverEnd={() => setHoveredCardId(null)}
              className="cursor-pointer relative overflow-hidden rounded-xl"
              onClick={() => navigate(`/collection/${collection.id}`)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={collection.backdrop_path 
                    ? `https://image.tmdb.org/t/p/w780${collection.backdrop_path}` 
                    : '/placeholder.svg'
                  } 
                  alt={collection.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    hoveredCardId === collection.id ? 'scale-110' : 'scale-100'
                  }`}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-bold text-white mb-1">{collection.name}</h2>
                    <div className="flex items-center text-white/80 text-sm mb-2">
                      <Film className="mr-1.5 h-4 w-4 text-primary/80" />
                      <span>{collection.item_count} Movies</span>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2">{collection.description}</p>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute right-3 top-3 bg-black/80 backdrop-blur-sm text-white py-1 px-3 rounded-full text-sm flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCardId === collection.id ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                View Collection
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collections;
