
import React, { useEffect, useState } from "react";
import { Movie } from "@/types";
import MovieCard from "@/components/MovieCard";
import { useToast } from "@/hooks/use-toast";
import { getPopularMovies, getNowPlayingMovies, getTopRatedMovies } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

const Movies = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"popular" | "now_playing" | "top_rated">("popular");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        
        let response;
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
  }, [category, currentPage, toast]);

  const changeCategory = (newCategory: "popular" | "now_playing" | "top_rated") => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Movies</h1>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={category === "popular" ? "default" : "outline"}
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      ) : (
        <>
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
