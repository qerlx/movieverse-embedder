
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { getCollection, processCollection } from '@/lib/api/collections';
import { ChevronLeft, Star, Info, Calendar, Film, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-mobile';
import { FavoriteButton } from '@/components/FavoriteButton';
import MovieCard from '@/components/MovieCard';
import { Movie } from '@/types';

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedMovie, setSelectedMovie] = React.useState<Movie | null>(null);
  
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ['collection', id],
    queryFn: async () => {
      const rawCollection = await getCollection(Number(id));
      return processCollection(rawCollection);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-48 mb-4" />
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] h-auto rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">Could not load collection</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an error while trying to fetch this collection. Please try again later.
          </p>
          <Button onClick={() => navigate('/collections')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>
        </div>
      </div>
    );
  }

  const handleMovieClick = (movie: Movie) => {
    if (isMobile) {
      navigate(`/movie/${movie.id}`);
    } else {
      setSelectedMovie(movie);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };

  const getYearFromDate = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with Backdrop */}
      <div 
        className="w-full h-[50vh] relative overflow-hidden"
        style={{
          backgroundImage: collection.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/original${collection.backdrop_path})` 
            : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/30"></div>
        
        <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4" 
              onClick={() => navigate('/collections')}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Collections
            </Button>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">{collection.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                <span>{collection.average_rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center">
                <Film className="mr-1 h-4 w-4 text-primary/80" />
                <span>{collection.item_count} Movies</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-primary/80" />
                <span>
                  {getYearFromDate(collection.first_release_date)} - {getYearFromDate(collection.last_release_date)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Collection Description */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl">
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {collection.description}
          </motion.p>
        </div>
      </div>
      
      {/* Movies Section */}
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Film className="mr-2 h-5 w-5 text-primary" />
          Movies in this Collection
        </h2>
        
        {isMobile ? (
          // Mobile: Horizontal scrollable timeline
          <div className="relative">
            <div className="overflow-x-auto pb-6 no-scrollbar">
              <div className="flex space-x-4 px-1 min-w-max">
                {collection.movies.map((movie, index) => (
                  <motion.div 
                    key={movie.id}
                    className="w-36 md:w-44 flex-shrink-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (index % 8) }}
                    whileHover={{ y: -5 }}
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleMovieClick(movie)}
                    >
                      <img 
                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '/placeholder.svg'} 
                        alt={movie.title}
                        className="rounded-lg w-full shadow-md hover:shadow-xl transition-shadow duration-300"
                        loading="lazy"
                      />
                      <div className="mt-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                          <div className="flex items-center bg-black/40 px-1.5 rounded text-xs">
                            <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                            {movie.vote_average.toFixed(1)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getYearFromDate(movie.release_date)}
                        </p>
                        <p className="text-xs line-clamp-2 mt-1 text-muted-foreground">
                          {movie.overview}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute right-0 bottom-2 bg-gradient-to-l from-background via-background/80 to-transparent py-2 px-4 text-sm font-medium flex items-center">
              Swipe for more <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        ) : (
          // Desktop: Grid layout
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {collection.movies.map((movie, index) => (
              <motion.div 
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (index % 10) }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="movie-card-hover"
              >
                <Card 
                  className="overflow-hidden h-full flex flex-col bg-card/50 backdrop-blur-sm border-white/5"
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className="relative aspect-[2/3]">
                    <img 
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '/placeholder.svg'} 
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium">
                        <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                      <p className="text-xs text-white/90">
                        {getYearFromDate(movie.release_date)}
                      </p>
                    </div>
                  </div>
                  <CardContent className="flex-grow flex flex-col justify-between p-3">
                    <div>
                      <h3 className="font-medium text-sm">{movie.title}</h3>
                      <p className="text-xs line-clamp-2 mt-1 text-muted-foreground">
                        {movie.overview}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 h-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovieClick(movie);
                        }}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        <span className="text-xs">Details</span>
                      </Button>
                      <FavoriteButton 
                        itemId={movie.id} 
                        itemType="movie" 
                        title={movie.title}
                        posterPath={movie.poster_path || undefined}
                        size="icon"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Movie Detail Dialog */}
      <Dialog 
        open={!!selectedMovie} 
        onOpenChange={(open) => !open && setSelectedMovie(null)}
      >
        {selectedMovie && (
          <DialogContent className="max-w-2xl overflow-hidden bg-black/80 backdrop-blur-lg border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedMovie.title}</DialogTitle>
              <DialogDescription>
                Released {formatDate(selectedMovie.release_date)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <img 
                  src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}` : '/placeholder.svg'} 
                  alt={selectedMovie.title}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              
              <div className="md:col-span-2 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center bg-black/50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{selectedMovie.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedMovie.vote_count} votes
                  </div>
                </div>
                
                <p className="text-sm mb-6">
                  {selectedMovie.overview}
                </p>
                
                <div className="mt-auto flex gap-3">
                  <Button 
                    onClick={() => navigate(`/movie/${selectedMovie.id}`)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <FavoriteButton 
                    itemId={selectedMovie.id} 
                    itemType="movie" 
                    title={selectedMovie.title}
                    posterPath={selectedMovie.poster_path || undefined}
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CollectionDetail;
