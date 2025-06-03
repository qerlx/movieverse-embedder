
import React, { useEffect, useState, useCallback } from "react";
import { Movie, Genre } from "@/types";
import MovieCard from "@/components/MovieCard";
import { useToast } from "@/hooks/use-toast";
import { 
  getPopularMovies, 
  getNowPlayingMovies, 
  getTopRatedMovies, 
  getMoviesByGenre, 
  getMovieGenres 
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Movies = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"popular" | "now_playing" | "top_rated" | "genre">("popular");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  // Fetch movie genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getMovieGenres();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching movie genres:", error);
      }
    };
    
    fetchGenres();
  }, []);

  // Fetch movies when dependencies change
  const fetchMovies = useCallback(async () => {
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
      
      if (response && response.results) {
        setMovies(response.results);
        setTotalPages(Math.min(response.total_pages || 1, 20)); // Limit to 20 pages max
      } else {
        setMovies([]);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      toast({
        title: "Error",
        description: "Failed to load movies. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
  }, [category, currentPage, selectedGenre, toast]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const changeCategory = useCallback((newCategory: "popular" | "now_playing" | "top_rated") => {
    setCategory(newCategory);
    setSelectedGenre(null);
    setCurrentPage(1);
  }, []);

  const selectGenre = useCallback((genre: Genre) => {
    setSelectedGenre(genre);
    setCategory("genre");
    setCurrentPage(1);
  }, []);

  const clearGenreFilter = useCallback(() => {
    setSelectedGenre(null);
    setCategory("popular");
    setCurrentPage(1);
  }, []);

  const changePage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Movies</h1>
          
          {selectedGenre && (
            <Badge 
              variant="secondary" 
              className="ml-2 cursor-pointer hover:bg-secondary/80"
              onClick={clearGenreFilter}
            >
              {selectedGenre.name} ×
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={category === "popular" && !selectedGenre ? "default" : "outline"}
            onClick={() => changeCategory("popular")}
            className="transition-all duration-200"
            disabled={isLoading}
          >
            Popular
          </Button>
          <Button
            variant={category === "now_playing" ? "default" : "outline"}
            onClick={() => changeCategory("now_playing")}
            className="transition-all duration-200"
            disabled={isLoading}
          >
            Now Playing
          </Button>
          <Button
            variant={category === "top_rated" ? "default" : "outline"}
            onClick={() => changeCategory("top_rated")}
            className="transition-all duration-200"
            disabled={isLoading}
          >
            Top Rated
          </Button>
          
          {genres.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-1"
                  disabled={isLoading}
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
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading movies...</p>
          </div>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No movies found</h2>
            <p className="text-muted-foreground">Try selecting a different category or genre.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <MovieCard 
                key={`${movie.id}-${index}`} 
                item={movie} 
                type="movie" 
                priority={index < 12}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex flex-wrap gap-2 justify-center items-center">
                <Button
                  variant="outline"
                  onClick={() => changePage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                
                <div className="flex items-center px-4 text-sm">
                  <span className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => changePage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;
