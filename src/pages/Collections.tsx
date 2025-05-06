
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getPopularCollections } from '@/lib/api/collections';
import { Film, FolderArchive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

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

  // Feature the MCU collection first
  const mcuCollection = collections.find(c => c.id === 84979);
  const otherCollections = collections.filter(c => c.id !== 84979);

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

        {/* Featured Collection - MCU */}
        {mcuCollection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Film className="h-6 w-6 mr-2 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
                Featured Collection
              </span>
            </h2>
            
            <div 
              className="relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => navigate(`/collection/mcu`)}
            >
              <div 
                className="aspect-video md:aspect-[21/9] relative overflow-hidden" 
                style={{
                  backgroundImage: mcuCollection.backdrop_path 
                    ? `url(https://image.tmdb.org/t/p/original${mcuCollection.backdrop_path})` 
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
                
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end md:justify-center md:max-w-2xl">
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                    {mcuCollection.name}
                  </h3>
                  <div className="flex items-center text-white/80 text-sm mb-3">
                    <Film className="mr-1.5 h-4 w-4 text-purple-400" />
                    <span>{mcuCollection.item_count} Movies</span>
                  </div>
                  <p className="text-white/70 text-sm md:text-base line-clamp-3 md:line-clamp-4 mb-4">{mcuCollection.description}</p>
                  <Button 
                    className="w-fit bg-purple-600 hover:bg-purple-700 text-white"
                    size="sm"
                  >
                    Explore the MCU
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <h2 className="text-2xl font-bold my-6 flex items-center">
          <FolderArchive className="h-6 w-6 mr-2 text-primary" />
          All Collections
        </h2>
        
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
              onClick={() => {
                if (collection.id === 84979) {
                  navigate('/collection/mcu');
                } else {
                  navigate(`/collection/${collection.id}`);
                }
              }}
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
