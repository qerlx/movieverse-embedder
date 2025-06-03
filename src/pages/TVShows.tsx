
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

  // Animation variants for staggered loading
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div 
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
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
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      ) : (
        <>
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {tvShows.map((show, index) => (
              <motion.div 
                key={show.id}
                variants={item}
                transition={{ duration: 0.4 }}
              >
                <MovieCard 
                  item={show} 
                  type="tv" 
                  priority={index < 12}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-secondary/50 hover:border-primary/70"
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
                className="border-secondary/50 hover:border-primary/70"
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TVShows;
