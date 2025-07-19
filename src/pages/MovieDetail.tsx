
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
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import LogoTitle from "@/components/LogoTitle";
import MovieInfoCard from "@/components/MovieInfoCard";
import { motion } from "framer-motion";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface VideoSource {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Video sources list
  const videoSources: VideoSource[] = [
    { id: "vidora", name: "Vidora", icon: <Play size={16} className="mr-1" /> },
    { id: "vidsrc", name: "VidSrc", icon: <Film size={16} className="mr-1" /> },
    { id: "vidzee", name: "Vidzee", icon: <Film size={16} className="mr-1" /> },
    { id: "vidjoy", name: "Vidjoy", icon: <Film size={16} className="mr-1" /> }
  ];
  
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

  const handleWatchClick = (source?: string) => {
    if (id) {
      if (source) {
        navigate(`/watch/movie/${id}?source=${source}`);
      } else {
        navigate(`/watch/movie/${id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="relative w-16 h-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
          <p className="text-white/60 mb-6">The movie you're looking for doesn't exist or has been removed.</p>
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
              className="w-full h-[70vh] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-20 pb-10 min-h-[70vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-xs mx-auto md:mx-0"
            >
              <div className="overflow-hidden rounded-xl shadow-2xl">
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
              
              {/* Watch Options */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-6"
              >
                <Card className="border-white/10 bg-black/30 backdrop-blur-md">
                  <CardContent className="space-y-3 p-4">
                    <h3 className="text-white text-lg font-semibold">Watch Options</h3>
                    
                    <div className="space-y-2">
                      {videoSources.map((source, index) => (
                        <Button 
                          key={source.id}
                          onClick={() => handleWatchClick(source.id)}
                          className={
                            index === 0 
                              ? "w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-lg py-3" 
                              : "w-full bg-black/40 hover:bg-black/60 text-white gap-2 rounded-lg py-2 border border-white/10"
                          }
                          size={index === 0 ? "default" : "sm"}
                        >
                          {source.icon}
                          {source.name}
                          {index === 0 && <span className="text-xs opacity-70">(HD)</span>}
                        </Button>
                      ))}
                    </div>
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

              <MovieInfoCard 
                movie={movie} 
                onWatchClick={() => handleWatchClick()}
                showCompactLayout={true}
              >
                {currentUser && (
                  <>
                    <FavoriteButton
                      id={movie.id} 
                      type="movie" 
                      title={movie.title}
                      posterPath={movie.poster_path}
                      variant="outline"
                    />
                    <AddToWatchedButton
                      itemId={movie.id}
                      itemType="movie"
                      title={movie.title}
                      posterPath={movie.poster_path}
                      variant="outline"
                      genres={movie.genres?.map((g: any) => g.id)}
                    />
                  </>
                )}
              </MovieInfoCard>
            </motion.div>

            {/* Details */}
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex-1"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <LogoTitle
                  id={movie.id}
                  title={movie.title}
                  type="movie"
                  className="max-w-md h-12 sm:h-16 md:h-20 object-contain"
                  fallbackClassName="text-3xl md:text-5xl font-bold text-white"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {movie.genres?.slice(0, 4).map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/10 text-white/90"
                  >
                    {genre.name}
                  </span>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap gap-4 mb-6 text-sm"
              >
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={16} />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-white/80">
                  <Clock size={16} />
                  <span>{movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "Unknown"}</span>
                </div>
                
                <div className="flex items-center gap-1 text-white/80">
                  <Calendar size={16} />
                  <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-6 max-w-2xl"
              >
                <p className="text-white/80 leading-relaxed">{movie.overview}</p>
              </motion.div>
              
              {directors.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="mb-8"
                >
                  <p className="text-white/60">
                    <span className="font-medium">Director:</span> {directors.map((director: any) => director.name).join(", ")}
                  </p>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-wrap gap-4 mt-8"
              >
                <Button
                  onClick={() => handleWatchClick()}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-lg px-8 py-3 text-lg font-medium"
                >
                  <Play size={20} />
                  Play
                </Button>
                
                {currentUser && (
                  <>
                    <FavoriteButton
                      id={movie.id} 
                      type="movie" 
                      title={movie.title}
                      posterPath={movie.poster_path}
                      variant="outline"
                    />
                    <AddToWatchedButton
                      itemId={movie.id}
                      itemType="movie"
                      title={movie.title}
                      posterPath={movie.poster_path}
                      variant="outline"
                      genres={movie.genres?.map((g: any) => g.id)}
                    />
                  </>
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
          className="py-12"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-white">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-black/20 rounded-lg overflow-hidden border border-white/10"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-black/50">
                      <span className="text-white/60 text-sm">No Photo</span>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-white line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-white/60 line-clamp-1 mt-1">
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
