
import React, { useEffect, useState } from "react";
import { TVShow, Genre } from "@/types";
import MovieCard from "@/components/MovieCard";
import { useToast } from "@/hooks/use-toast";
import { 
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
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import NetflixMovieCard from "@/components/NetflixMovieCard";
import { motion } from "framer-motion";

const TVShows = () => {
  const { toast } = useToast();
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"top_rated" | "genre">("top_rated");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';

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
          // Default to top_rated
          response = await getTopRatedTVShows(currentPage);
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

  const selectGenre = (genre: Genre) => {
    setSelectedGenre(genre);
    setCategory("genre");
    setCurrentPage(1);
  };

  const clearGenreFilter = () => {
    setSelectedGenre(null);
    setCategory("top_rated");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <h1 className={cn("text-3xl font-bold", isNetflix && "text-white")}>TV Shows</h1>
          
          {selectedGenre && (
            <Badge 
              variant={isNetflix ? "outline" : "secondary"}
              className={cn(
                "ml-2 cursor-pointer",
                isNetflix && "bg-transparent border-gray-600 text-gray-300"
              )}
              onClick={clearGenreFilter}
            >
              {selectedGenre.name} ×
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={isNetflix ? "outline" : "default"}
            onClick={clearGenreFilter}
            className={cn(
              "transition-all duration-300",
              isNetflix && "border-gray-700 hover:border-gray-600 text-white"
            )}
          >
            Top Rated
          </Button>
          
          {genres.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "gap-1",
                    isNetflix && "border-gray-700 hover:border-gray-600 text-white"
                  )}
                >
                  <Filter size={16} />
                  Genres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={cn(
                  "w-56 max-h-[70vh] overflow-y-auto",
                  isNetflix && "bg-black/95 border-gray-800"
                )}
              >
                <DropdownMenuGroup>
                  {genres.map((genre) => (
                    <DropdownMenuItem 
                      key={genre.id} 
                      onClick={() => selectGenre(genre)}
                      className={cn(
                        selectedGenre?.id === genre.id && "bg-muted",
                        isNetflix && "text-gray-300 hover:text-white focus:text-white"
                      )}
                    >
                      {genre.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className={cn(
            "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
            isNetflix ? "border-red-600" : "border-primary"
          )}></div>
        </div>
      ) : (
        <>
          <div className={cn(
            isNetflix 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
          )}>
            {tvShows.map((show, index) => (
              <motion.div 
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {isNetflix ? (
                  <NetflixMovieCard 
                    item={show} 
                    type="tv" 
                    index={index}
                  />
                ) : (
                  <MovieCard 
                    item={show} 
                    type="tv" 
                    priority={index < 12}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={isNetflix && "border-gray-700 hover:border-gray-600 text-white"}
              >
                Previous
              </Button>
              
              {/* Show current page and total */}
              <div className="flex items-center px-4 text-sm">
                <span className={cn(
                  "text-muted-foreground",
                  isNetflix && "text-gray-400"
                )}>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={isNetflix && "border-gray-700 hover:border-gray-600 text-white"}
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
