
import React, { useEffect, useState } from "react";
import { TVShow, Genre } from "@/types";
import MovieCard from "@/components/MovieCard";
import { useToast } from "@/hooks/use-toast";
import { 
  getPopularTVShows, 
  getTopRatedTVShows, 
  getTVShowsByGenre, 
  getTVGenres 
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

const TVShows = () => {
  const { toast } = useToast();
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"popular" | "top_rated" | "genre">("popular");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  // Fetch TV genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getTVGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching TV genres:", error);
      }
    };
    
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setIsLoading(true);
        
        let response;
        if (category === "genre" && selectedGenre) {
          response = await getTVShowsByGenre(selectedGenre.id, currentPage);
        } else {
          switch (category) {
            case "popular":
              response = await getPopularTVShows(currentPage);
              break;
            case "top_rated":
              response = await getTopRatedTVShows(currentPage);
              break;
            default:
              response = await getPopularTVShows(currentPage);
          }
        }
        
        setTVShows(response.results);
        setTotalPages(Math.min(response.total_pages, 20)); // Limit to 20 pages max
        
      } catch (error) {
        console.error("Error fetching TV shows:", error);
        toast({
          title: "Error",
          description: "Failed to load TV shows. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        window.scrollTo(0, 0);
      }
    };

    fetchTVShows();
  }, [category, currentPage, selectedGenre, toast]);

  const changeCategory = (newCategory: "popular" | "top_rated") => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">TV Shows</h1>
          
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
          <Button
            variant={category === "popular" && !selectedGenre ? "default" : "outline"}
            onClick={() => changeCategory("popular")}
            className="transition-all duration-300"
          >
            Popular
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {tvShows.map((show, index) => (
              <MovieCard 
                key={show.id} 
                item={show} 
                type="tv" 
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

export default TVShows;
