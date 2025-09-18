
import React, { useEffect, useState } from "react";
import { Movie, Genre } from "@/types";
import MovieCard from "@/components/MovieCard";
import DomeGallery from "@/components/DomeGallery";
import { useToast } from "@/hooks/use-toast";
import { 
  getPopularMovies, 
  getNowPlayingMovies, 
  getTopRatedMovies, 
  getMoviesByGenre, 
  getMovieGenres 
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Grid, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Movies = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"popular" | "now_playing" | "top_rated" | "genre">("popular");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "dome">("grid");

  // Fetch movie genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getMovieGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching movie genres:", error);
      }
    };
    
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        
        let response;
        if (category === "genre" && selectedGenre) {
          response = await getMoviesByGenre(selectedGenre.id, currentPage);
        } else {
          switch (category) {
            case "popular":
              response = await getPopularMovies(currentPage);
              break;
            case "now_playing":
              response = await getNowPlayingMovies(currentPage);
              break;
            case "top_rated":
              response = await getTopRatedMovies(currentPage);
              break;
            default:
              response = await getPopularMovies(currentPage);
          }
        }
        
        setMovies(response.results);
        setTotalPages(Math.min(response.total_pages, 20)); // Limit to 20 pages max
        
      } catch (error) {
        console.error("Error fetching movies:", error);
        toast({
          title: "Error",
          description: "Failed to load movies. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchMovies();
  }, [category, currentPage, selectedGenre, toast]);

  const changeCategory = (newCategory: "popular" | "now_playing" | "top_rated") => {
    setCategory(newCategory);
    setSelectedGenre(null);
    setCurrentPage(1);
  };

  const selectGenre = (genre: Genre) => {
    setSelectedGenre(genre);
    setCategory("genre");
    setCurrentPage(1);
  };

  const clearGenreFilter = () => {
    setSelectedGenre(null);
    setCategory("popular");
    setCurrentPage(1);
  };

  const handleMovieClick = (movie: any) => {
    navigate(`/movie/${movie.id}`);
  };

  const formatMoviesForDome = (movies: Movie[]) => {
    return movies.map(movie => ({
      src: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : '/placeholder.svg',
      alt: movie.title,
      id: movie.id,
      title: movie.title
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Movies</h1>
          
          {selectedGenre && (
            <Badge 
              variant="secondary" 
              className="ml-2 cursor-pointer"
              onClick={clearGenreFilter}
            >
              {selectedGenre.name} ×
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="transition-all duration-300"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "dome" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("dome")}
              className="transition-all duration-300"
            >
              <Globe size={16} />
            </Button>
          </div>
          
          <Button
            variant={category === "popular" && !selectedGenre ? "default" : "outline"}
            onClick={() => changeCategory("popular")}
            className="transition-all duration-300"
          >
            Popular
          </Button>
          <Button
            variant={category === "now_playing" ? "default" : "outline"}
            onClick={() => changeCategory("now_playing")}
            className="transition-all duration-300"
          >
            Now Playing
          </Button>
          <Button
            variant={category === "top_rated" ? "default" : "outline"}
            onClick={() => changeCategory("top_rated")}
            className="transition-all duration-300"
          >
            Top Rated
          </Button>
          
          {genres.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-1"
                >
                  <Filter size={16} />
                  Genres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto">
                <DropdownMenuGroup>
                  {genres.map((genre) => (
                    <DropdownMenuItem 
                      key={genre.id} 
                      onClick={() => selectGenre(genre)}
                      className={selectedGenre?.id === genre.id ? "bg-muted" : ""}
                    >
                      {genre.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  item={movie} 
                  type="movie" 
                  priority={index < 12}
                />
              ))}
            </div>
          ) : (
            <div className="h-[80vh] w-full">
              <DomeGallery 
                images={formatMoviesForDome(movies)}
                onItemClick={handleMovieClick}
                overlayBlurColor="hsl(var(--background))"
                grayscale={false}
              />
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Show current page and total */}
              <div className="flex items-center px-4 text-sm">
                <span className="text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Movies;
