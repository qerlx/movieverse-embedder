
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
import { cn } from "@/lib/utils";

const TVShows = () => {
  const { toast } = useToast();
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState<"top_rated" | "genre">("top_rated");
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
        console.log(`Fetching ${category} TV shows, page ${currentPage}`);
        
        let response;
        if (category === "genre" && selectedGenre) {
          response = await getTVShowsByGenre(selectedGenre.id, currentPage);
        } else {
          response = await getTopRatedTVShows(currentPage);
        }
        
        console.log('TV Shows API Response:', response);
        
        if (response && response.results && Array.isArray(response.results)) {
          // Filter out shows without essential data
          const validShows = response.results.filter(show => 
            show && 
            show.id && 
            (show.title || show.name) &&
            show.poster_path !== undefined
          );
          
          console.log(`Valid TV shows found: ${validShows.length}`);
          setTVShows(validShows);
          setTotalPages(Math.min(response.total_pages, 20));
        } else {
          console.error('Invalid TV shows response structure:', response);
          setTVShows([]);
          setTotalPages(1);
        }
        
      } catch (error) {
        console.error("Error fetching TV shows:", error);
        setTVShows([]);
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TV Shows
          </h1>
          
          {selectedGenre && (
            <Badge 
              variant="secondary"
              className="ml-2 cursor-pointer bg-gradient-to-r from-primary/80 to-primary/50 hover:from-primary hover:to-primary/70 text-primary-foreground"
              onClick={clearGenreFilter}
            >
              {selectedGenre.name} ×
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {genres.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-1 bg-secondary/50 border-secondary/50 hover:bg-secondary/70"
                  disabled={isLoading}
                >
                  <Filter size={16} />
                  Genres
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 max-h-[70vh] overflow-y-auto bg-background/95 backdrop-blur-md"
              >
                <DropdownMenuGroup>
                  {genres.map((genre) => (
                    <DropdownMenuItem 
                      key={genre.id} 
                      onClick={() => selectGenre(genre)}
                      className={cn(
                        selectedGenre?.id === genre.id && "bg-muted"
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
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading TV shows...</p>
          </div>
        </div>
      ) : tvShows.length === 0 ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No TV shows found</h2>
            <p className="text-muted-foreground">Try selecting a different genre.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {tvShows.map((show, index) => (
              <MovieCard 
                key={`tv-${show.id}-${index}-${category}`} 
                item={show} 
                type="tv" 
                priority={index < 12}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="border-secondary/50 hover:border-primary/70"
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                  className="border-secondary/50 hover:border-primary/70"
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

export default TVShows;
