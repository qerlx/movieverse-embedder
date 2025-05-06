
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getPopularCollections } from '@/lib/api/collections';
import { FolderArchive, ChevronRight, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CollectionShowcase = () => {
  const navigate = useNavigate();
  
  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: getPopularCollections,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <FolderArchive className="mr-2 h-5 w-5 text-primary" />
          Movie Collections
        </h2>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/collections')}
          className="text-muted-foreground hover:text-foreground"
        >
          View All Collections
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.slice(0, 6).map((collection, i) => (
          <motion.div
            key={collection.id}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
            onClick={() => navigate(`/collection/${collection.id}`)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="aspect-video relative">
              <img 
                src={collection.backdrop_path 
                  ? `https://image.tmdb.org/t/p/w500${collection.backdrop_path}` 
                  : '/placeholder.svg'
                } 
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-4">
                <h3 className="text-xl font-bold text-white mb-1">{collection.name}</h3>
                <div className="text-white/70 text-sm flex items-center">
                  <Film className="h-3.5 w-3.5 mr-1 text-primary/80" />
                  {collection.item_count} Movies
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CollectionShowcase;
