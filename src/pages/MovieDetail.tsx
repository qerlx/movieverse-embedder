import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails } from "@/lib/api";
import { Star, Clock, Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom theme color for Vidora player
  const vidoraThemeColor = "00ff9d";
  
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
    // Scroll to top when navigating to a new movie
    window.scrollTo(0, 0);
  }, [id, toast]);

  const handleWatchClick = () => {
    navigate(`/watch/movie/${id}`);
  };

  // Loading and error states
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
          <h2 className="text-2xl font-bold mb-2 purple-text-gradient">Movie Not Found</h2>
          <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/movies")} className="premium-button premium-button-primary">Browse Movies</Button>
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
              className="w-full h-[80vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-20 pb-10 min-h-[80vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-xs mx-auto md:mx-0"
            >
              <div className="overflow-hidden rounded-2xl shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 purple-glow">
                <motion.img
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Video Player Options Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-8"
              >
                <Card className="border-primary/20 bg-black/30 backdrop-blur-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gradient text-xl">Watch Now</CardTitle>
                    <CardDescription>High quality streaming with Vidora</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pb-3">
                    <Button 
                      onClick={handleWatchClick}
                      className="w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-4 py-6 shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      <Play size={22} className="ml-1" />
                      Watch with Vidora
                    </Button>
                  </CardContent>
                </Card>
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
              className="flex-1"
            >
              <motion.h1 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="cinematic-title text-4xl md:text-6xl font-bold mb-4 text-white text-shadow"
              >
                {movie.title}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-3 mb-6"
              >
                {movie.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm backdrop-blur-sm bg-black/30 border border-white/10 text-white/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-6 mb-6 text-sm"
              >
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                    <Star size={16} className="text-yellow-400" />
                    <span className="font-medium">{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Clock size={16} className="text-white/80" />
                  <span>{formattedRuntime}</span>
                </div>
                
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                  <Calendar size={16} className="text-white/80" />
                  <span>{releaseYear}</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-6 max-w-2xl"
              >
                <h2 className="text-xl font-semibold mb-2 text-white/90">Overview</h2>
                <p className="text-white/70 leading-relaxed">{movie.overview}</p>
              </motion.div>
              
              {directors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-semibold mb-2 text-white/90">Director</h2>
                  <div className="flex flex-wrap gap-2">
                    {directors.map((director: any) => (
                      <span key={director.id} className="text-white/70">
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
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button
                  onClick={handleWatchClick}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-8 py-6 text-lg font-medium shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <Play size={22} className="ml-1" />
                  Watch Now
                </Button>
                
                {currentUser && (
                  <FavoriteButton
                    itemId={parseInt(id!)}
                    itemType="movie"
                    title={movie.title}
                    posterPath={movie.poster_path}
                    size="lg"
                    variant="outline"
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
          className="py-12 bg-gradient-to-b from-transparent to-black/30"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 purple-text-gradient">
              Featured Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="premium-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-48 object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-black/50">
                      <span className="text-muted-foreground">No Photo</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
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
          className="py-12"
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
