
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails } from "@/lib/api";
import { Star, Clock, Calendar, Play, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import WatchProviders from "@/components/WatchProviders";
import LogoTitle from "@/components/LogoTitle";
import { motion } from "framer-motion";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const movieId = parseInt(id);
        const data = await getMovieDetails(movieId);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        toast({
          title: "Error",
          description: "Failed to load movie details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
    window.scrollTo(0, 0);
  }, [id, toast]);

  const handleWatchClick = () => {
    if (id) {
      navigate(`/watch/movie/${id}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="relative w-16 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <motion.div 
            className="absolute inset-2 rounded-full border-2 border-t-transparent border-r-primary border-b-primary border-l-transparent animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
        </motion.div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 backdrop-blur-lg bg-black/40 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold mb-2 text-white">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/movies")} className="bg-primary hover:bg-primary/90">Browse Movies</Button>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;
  
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg";

  const formattedRuntime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Unknown";
  
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";
  
  const directors = movie.credits?.crew?.filter(
    (person: any) => person.job === "Director"
  ) || [];

  const topCast = movie.credits?.cast?.slice(0, 6) || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Hero section with backdrop */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <motion.div 
              initial={{ filter: "blur(16px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="w-full h-[70vh] sm:h-[80vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-20 pb-10 min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-center">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start">
            {/* Poster */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[200px] sm:max-w-[250px] lg:max-w-xs mx-auto lg:mx-0 flex-shrink-0"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl hover:shadow-primary/20 transition-shadow duration-300">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                      target.src = '/placeholder.svg';
                    }
                  }}
                />
              </div>
              
              {/* Watch Button for Mobile/Tablet */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-4 lg:hidden"
              >
                <Button
                  onClick={handleWatchClick}
                  className="w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-6 py-3 text-base font-medium shadow-lg hover:shadow-primary/30 transition-all"
                  size="lg"
                >
                  <Play size={20} className="fill-white" />
                  Watch Now
                </Button>
              </motion.div>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-4"
              >
                <WatchProviders id={parseInt(id!)} type="movie" />
              </motion.div>
            </motion.div>

            {/* Details */}
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-4"
              >
                <LogoTitle
                  id={movie.id}
                  title={movie.title}
                  type="movie"
                  className="w-full max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] h-auto max-h-10 sm:max-h-14 md:max-h-18 lg:max-h-22 object-contain mb-2 mx-auto lg:mx-0"
                  fallbackClassName="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-center lg:text-left"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 justify-center lg:justify-start"
              >
                {movie.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm backdrop-blur-sm bg-black/30 border border-white/10 text-white/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-3 sm:gap-6 mb-4 sm:mb-6 text-xs sm:text-sm justify-center lg:justify-start"
              >
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                    <Star size={14} className="text-yellow-400" />
                    <span className="font-medium">{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Clock size={14} className="text-white/80" />
                  <span>{formattedRuntime}</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Calendar size={14} className="text-white/80" />
                  <span>{releaseYear}</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Film size={14} className="text-purple-400" />
                  <span>Movie</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white/90">Overview</h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">{movie.overview}</p>
              </motion.div>
              
              {directors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-6 sm:mb-8"
                >
                  <h2 className="text-lg sm:text-xl font-semibold mb-2 text-white/90">Director</h2>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {directors.map((director: any) => (
                      <span key={director.id} className="text-sm sm:text-base text-white/70">
                        {director.name}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 justify-center lg:justify-start"
              >
                {/* Desktop Watch Button */}
                <Button
                  onClick={handleWatchClick}
                  className="hidden lg:flex bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <Play size={20} className="fill-white" />
                  Watch Now
                </Button>
                
                {currentUser && (
                  <FavoriteButton
                    id={movie.id} 
                    type="movie" 
                    title={movie.title}
                    posterPath={movie.poster_path}
                    variant="default"
                    className="flex-1 sm:flex-none"
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cast section */}
      {topCast.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-8 sm:py-12 bg-gradient-to-b from-transparent to-black/30"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center lg:text-left text-white">
              Featured Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-black/40 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-32 sm:h-48 object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 sm:h-48 flex items-center justify-center bg-black/50">
                      <span className="text-xs sm:text-sm text-muted-foreground">No Photo</span>
                    </div>
                  )}
                  <div className="p-2 sm:p-4">
                    <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-white">{person.name}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mt-1">
                      {person.character}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Similar movies */}
      {movie.similar?.results?.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-8 sm:py-12"
        >
          <CategoryRow
            title="More Like This"
            items={movie.similar.results}
            type="movie"
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default MovieDetail;
