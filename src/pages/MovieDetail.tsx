
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
      {/* Hero Section with MovieInfoCard */}
      <MovieInfoCard 
        movie={movie} 
        onWatchClick={() => handleWatchClick()}
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

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Watch Options */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-md mx-auto">
            <div className="bg-card/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">Watch Options</h3>
              
              <div className="space-y-3">
                {videoSources.map((source, index) => (
                  <Button 
                    key={source.id}
                    onClick={() => handleWatchClick(source.id)}
                    className={
                      index === 0 
                        ? "w-full bg-primary hover:bg-primary/90 text-white gap-2 rounded-lg py-3 text-base" 
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
            </div>
          </div>
        </motion.div>

        {/* Movie Details */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">About {movie.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Movie Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Movie Details</h3>
                <div className="space-y-3 text-white/70">
                  <div className="flex justify-between">
                    <span className="text-white/90">Release Date:</span>
                    <span>{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/90">Runtime:</span>
                    <span>{movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Unknown'}</span>
                  </div>
                  {movie.vote_average > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/90">Rating:</span>
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400" fill="currentColor" />
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {directors.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/90">Director:</span>
                      <span>{directors.map((director: any) => director.name).join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1.5 rounded-full text-sm bg-white/10 border border-white/20 text-white/90"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="mt-8 text-center">
              <p className="text-white/80 leading-relaxed text-lg max-w-3xl mx-auto">
                {movie.overview}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cast section */}
        {topCast.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-8 text-white text-center">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
              {topCast.map((person: Cast, index) => (
                <motion.div 
                  key={person.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-card/30 rounded-lg overflow-hidden border border-white/10 backdrop-blur-sm"
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-muted/20">
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
          </motion.div>
        )}

        {/* Watch Providers */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <WatchProviders id={parseInt(id!)} type="movie" />
          </div>
        </motion.div>

        {/* Similar movies */}
        {movie.similar?.results?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <CategoryRow
              title="More Like This"
              items={movie.similar.results}
              type="movie"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MovieDetail;
