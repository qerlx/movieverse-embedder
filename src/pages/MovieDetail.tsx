
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getMovieDetails } from "@/lib/api";
import { Star, Clock, Calendar, Play, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie, Cast } from "@/types";
import CategoryRow from "@/components/CategoryRow";
import { useAuth } from "@/contexts/AuthContext";
import FavoriteButton from "@/components/FavoriteButton";
import AddToWatchedButton from "@/components/AddToWatchedButton";
import WatchProviders from "@/components/WatchProviders";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

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
  }, [id, toast]);

  const handleWatchClick = () => {
    navigate(`/watch/movie/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
          <p className="text-muted-foreground mb-4">The movie you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/movies")}>Browse Movies</Button>
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
    <div className="min-h-screen">
      {/* Hero section with backdrop */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 w-full h-full">
            <div 
              className="w-full h-[70vh] bg-cover bg-center bg-no-repeat animate-blur-in"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-12 pb-8 min-h-[70vh] flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-full max-w-xs mx-auto md:mx-0 animate-fade-in">
              <div className="overflow-hidden shadow-xl rounded-lg">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <div className="mt-6 p-4 bg-muted/20 backdrop-blur-sm rounded-lg">
                <WatchProviders id={parseInt(id!)} type="movie" />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {movie.genres?.map((genre: any) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-full text-sm bg-muted/30"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}/10</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{formattedRuntime}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{releaseYear}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Overview</h2>
                <p className="text-muted-foreground">{movie.overview}</p>
              </div>
              
              {directors.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Director</h2>
                  <div className="flex flex-wrap gap-2">
                    {directors.map((director: any) => (
                      <span key={director.id} className="text-muted-foreground">
                        {director.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-4 mt-8">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                  onClick={handleWatchClick}
                >
                  <Play size={18} />
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast section */}
      {topCast.length > 0 && (
        <div className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              Top Cast
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topCast.map((person: Cast) => (
                <div key={person.id} className="animate-fade-in">
                  <div className="overflow-hidden bg-muted/20 rounded-lg">
                    {person.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        className="w-full h-48 object-cover object-center"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-muted/20">
                        <span className="text-muted-foreground">No Photo</span>
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{person.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {person.character}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Similar movies */}
      {movie.similar?.results?.length > 0 && (
        <div className="py-8">
          <CategoryRow
            title="Similar Movies"
            items={movie.similar.results}
            type="movie"
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
