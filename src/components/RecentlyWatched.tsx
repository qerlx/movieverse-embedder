import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, Film, Tv, Star } from 'lucide-react';
import { Movie, TVShow } from '@/types';

type Media = Movie | TVShow;

const RecentlyWatched = () => {
  const [recentlyWatched, setRecentlyWatched] = useLocalStorage<Media[]>('recentlyWatched', []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  useEffect(() => {
    // Load recently watched items from local storage on component mount
    const storedItems = localStorage.getItem('recentlyWatched');
    if (storedItems) {
      setRecentlyWatched(JSON.parse(storedItems));
    }
  }, [setRecentlyWatched]);

  useEffect(() => {
    // Save recently watched items to local storage whenever the state changes
    localStorage.setItem('recentlyWatched', JSON.stringify(recentlyWatched));
  }, [recentlyWatched]);

  const handleMediaClick = (media: Media) => {
    setSelectedMedia(media);
    setIsOpen(true);
  };

  const handleCloseDialog = () => {
    setIsOpen(false);
    setSelectedMedia(null);
  };

  const clearHistory = () => {
    setRecentlyWatched([]);
    localStorage.removeItem('recentlyWatched');
  };

  const removeFromHistory = (mediaId: number) => {
    const updatedHistory = recentlyWatched.filter(item => item.id !== mediaId);
    setRecentlyWatched(updatedHistory);
  };

  const updateProgress = (mediaId: number, progress: number) => {
    const updatedHistory = recentlyWatched.map(item => {
      if (item.id === mediaId) {
        return { ...item, progress };
      }
      return item;
    });
    setRecentlyWatched(updatedHistory);
  };

  // Get years range from movies if they exist
  const getYear = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return dateString?.split('-')[0] || 'N/A';
  };

  // Calculate average rating if available
  const getRating = (rating: number | undefined) => {
    if (!rating) return null;
    return rating?.toFixed(1);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold">Recently Watched</h2>
          {recentlyWatched.length > 0 && (
            <button onClick={clearHistory} className="text-sm text-muted-foreground hover:text-red-500 transition-colors">
              Clear History
            </button>
          )}
        </div>

        {recentlyWatched.length === 0 ? (
          <div className="text-center py-12 bg-black/20 rounded-lg border border-white/5">
            <p className="text-muted-foreground">No recently watched movies or TV shows</p>
          </div>
        ) : (
          <ScrollArea className="rounded-md border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {recentlyWatched.map((item) => {
                const mediaType = item.title ? 'movie' : 'tv';
                const year = getYear(item.release_date || item.first_air_date);
                const rating = getRating(item.vote_average);
                const progress = item.progress || 0;

                // When creating media objects for RecentlyWatched, ensure we add all required properties
                // Find the section where the error occurs (around line 172)
                // and add the missing properties:

                const mediaObj = {
                  id: item.id,
                  title: item.title || item.name,
                  name: item.name || item.title,
                  poster_path: item.poster_path,
                  backdrop_path: item.backdrop_path,
                  overview: item.overview,
                  vote_average: item.vote_average,
                  vote_count: item.vote_count || 0, // Add missing property
                  popularity: item.popularity || 0, // Add missing property
                  release_date: item.release_date || '',
                  first_air_date: item.first_air_date || '',
                  genre_ids: item.genre_ids || [],
                  original_language: item.original_language || 'en', // Add missing property
                  origin_country: item.origin_country || ['US'], // Add missing property
                  progress: progress
                };

                return (
                  <motion.div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMediaClick(mediaObj)}
                  >
                    <div className="relative aspect-[2/3]">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/50">
                          <span className="text-xs text-center p-2">No image</span>
                        </div>
                      )}

                      {progress > 0 && progress < 99 && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/80">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      <div className="absolute top-2 left-2 flex gap-1">
                        {mediaType === 'movie' ? (
                          <Badge variant="movie" className="text-xs">
                            <Film className="w-3 h-3 mr-1" /> Movie
                          </Badge>
                        ) : (
                          <Badge variant="collection" className="text-xs">
                            <Tv className="w-3 h-3 mr-1" /> TV Show
                          </Badge>
                        )}
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="glass" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" /> {year}
                          </Badge>

                          {rating && (
                            <Badge variant="warning" className="text-xs">
                              <Star className="w-3 h-3 mr-1 fill-yellow-400" /> {rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h4 className="text-xs font-medium truncate">{item.title || item.name}</h4>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Media Details Dialog */}
      <AnimatePresence>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
            {selectedMedia && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl md:text-2xl font-bold">{selectedMedia.title || selectedMedia.name}</DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center gap-2 mt-1 mb-4">
                      <Badge variant="info">
                        <Film className="w-3 h-3 mr-1" /> Movie
                      </Badge>

                      <Badge variant="secondary">
                        <Calendar className="w-3 h-3 mr-1" /> {getYear(selectedMedia.release_date || selectedMedia.first_air_date)}
                      </Badge>

                      {getRating(selectedMedia.vote_average) && (
                        <Badge variant="warning">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400" /> {getRating(selectedMedia.vote_average)}
                        </Badge>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                  {selectedMedia.backdrop_path && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={`https://image.tmdb.org/t/p/original${selectedMedia.backdrop_path}`}
                        alt={selectedMedia.title || selectedMedia.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {selectedMedia.overview && (
                    <p className="text-sm text-muted-foreground mb-6">{selectedMedia.overview}</p>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </>
  );
};

export default RecentlyWatched;
