
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Collection, Movie } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type CollectionShowcaseProps = {
  collection: Collection;
  showMovieCount?: boolean;
  showYearRange?: boolean;
  compact?: boolean;
  width?: number;
};

const CollectionShowcase = ({
  collection,
  showMovieCount = false,
  showYearRange = false,
  compact = false,
  width = 220,
}: CollectionShowcaseProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get years range from movies if they exist
  const getYearRange = () => {
    if (!collection.parts || collection.parts.length === 0) return 'N/A';

    // Sort parts by release date
    const sortedParts = [...collection.parts].sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
      const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
      return dateA - dateB;
    });

    const firstYear = sortedParts[0]?.release_date?.split('-')[0] || 'N/A';
    const lastYear = sortedParts[sortedParts.length - 1]?.release_date?.split('-')[0] || 'N/A';

    return firstYear === lastYear ? firstYear : `${firstYear} - ${lastYear}`;
  };

  const imgSrc = collection.poster_path
    ? `https://image.tmdb.org/t/p/w500${collection.poster_path}`
    : collection.backdrop_path
    ? `https://image.tmdb.org/t/p/w500${collection.backdrop_path}`
    : '/placeholder.svg';

  return (
    <>
      <motion.div 
        className={`flex-shrink-0 cursor-pointer group rounded-lg overflow-hidden
          ${compact ? '' : 'border border-white/10 hover:border-white/30 transition-all duration-300'}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        style={{ width }}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative aspect-[2/3] bg-black/40 overflow-hidden">
          {!imageLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <img
            src={imgSrc}
            alt={collection.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {showMovieCount && collection.parts && (
            <Badge 
              className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border-white/10" 
              variant="outline"
            >
              {collection.parts.length} {collection.parts.length === 1 ? 'movie' : 'movies'}
            </Badge>
          )}
        </div>
        
        <div className="p-2">
          <h3 className="font-medium text-sm truncate">{collection.name}</h3>
          {showYearRange && (
            <p className="text-xs text-muted-foreground mt-1">{getYearRange()}</p>
          )}
        </div>
      </motion.div>

      {/* Collection Details Dialog */}
      <AnimatePresence>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold">{collection.name}</DialogTitle>
              <DialogDescription>
                {collection.parts && (
                  <div className="flex items-center gap-2 mt-1 mb-4">
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                      {collection.parts.length} {collection.parts.length === 1 ? 'Movie' : 'Movies'}
                    </Badge>
                    {showYearRange && <Badge variant="outline">{getYearRange()}</Badge>}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2">
              {collection.backdrop_path && (
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${collection.backdrop_path}`} 
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {collection.overview && (
                <p className="text-sm text-muted-foreground mb-6">{collection.overview}</p>
              )}

              {collection.parts && collection.parts.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-3">Movies in this collection</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[...collection.parts]
                      .sort((a, b) => {
                        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                        return dateA - dateB;
                      })
                      .map((movie: Movie) => (
                        <div 
                          key={movie.id} 
                          className="rounded overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            // Navigate to movie details page
                            window.location.href = `/movie/${movie.id}`;
                          }}
                        >
                          <div className="relative aspect-[2/3]">
                            {movie.poster_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                                alt={movie.title} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-black/50">
                                <span className="text-xs text-center p-2">No image</span>
                              </div>
                            )}
                            {movie.release_date && (
                              <Badge 
                                className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm border-white/10" 
                                variant="outline"
                              >
                                {movie.release_date.split('-')[0]}
                              </Badge>
                            )}
                          </div>
                          <div className="p-2">
                            <h4 className="text-xs font-medium truncate">{movie.title}</h4>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  );
};

export default CollectionShowcase;
