
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { searchMulti } from "@/lib/api";
import { MediaItem, Movie, TVShow } from "@/types";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { Search as SearchIcon, Film, Tv2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [inputQuery, setInputQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query.trim()) {
      setSearchQuery(query);
      setInputQuery(query);
      fetchResults(query, 1);
    }
  }, [searchParams]);

  const fetchResults = async (query: string, page: number) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      
      const data = await searchMulti(query, page);
      // Transform MediaItem results to Movie or TVShow
      const filteredResults = data.results
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .map((item: any): Movie | TVShow => {
          if (item.media_type === "movie") {
            return {
              id: item.id,
              title: item.title,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              release_date: item.release_date || "",
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              popularity: item.popularity || 0,
              adult: item.adult || false,
              video: item.video || false,
              original_language: item.original_language || "",
              media_type: "movie",
            } as Movie;
          } else {
            return {
              id: item.id,
              name: item.name,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              first_air_date: item.first_air_date || "",
              vote_average: item.vote_average || 0,
              vote_count: item.vote_count || 0,
              popularity: item.popularity || 0,
              original_language: item.original_language || "",
              origin_country: item.origin_country || [],
              media_type: "tv",
            } as TVShow;
          }
        });
      
      setResults(filteredResults);
      setTotalPages(Math.min(data.total_pages, 20)); // Limit to 20 pages
      setCurrentPage(page);
      
    } catch (error) {
      console.error("Error searching:", error);
      toast({
        title: "Error",
        description: "Failed to search. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchResults(searchQuery, page);
  };

  // Fixed variants objects to resolve TS errors
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero search section with backdrop */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-background/90 to-background"></div>
        <div className="absolute inset-0 bg-[url('https://source.unsplash.com/random/1920x1080/?cinema,movie')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative mx-auto px-4 py-12 md:py-24 max-w-5xl">
          <motion.div 
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-8">
              Discover Your Next Favorite
            </h1>
            
            <div className="w-full max-w-2xl mb-6 relative">
              <SearchBar variant="large" autoFocus />
              <motion.div 
                className="absolute -bottom-12 left-0 right-0 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex gap-2 text-sm text-white/60">
                  <span>Popular searches:</span>
                  <div className="flex gap-3">
                    <button onClick={() => setSearchParams({ q: "action" })} className="hover:text-primary transition-colors">Action</button>
                    <button onClick={() => setSearchParams({ q: "comedy" })} className="hover:text-primary transition-colors">Comedy</button>
                    <button onClick={() => setSearchParams({ q: "family" })} className="hover:text-primary transition-colors">Family</button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-screen-2xl mx-auto px-4 pt-16">
        {/* Results header */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              className="mb-8 flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold">
                  {results.length > 0 ? (
                    <>
                      Results for <span className="text-primary">"{searchQuery}"</span>
                    </>
                  ) : (
                    <>
                      No results found for <span className="text-primary">"{searchQuery}"</span>
                    </>
                  )}
                </h2>
                {results.length > 0 && (
                  <p className="text-muted-foreground mt-1">Found {results.length} titles</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-3 rounded-full border-t-2 border-primary/60 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                <div className="absolute inset-6 rounded-full border-t-2 border-primary/30 animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <p className="mt-4 text-muted-foreground animate-pulse">Searching...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results grid with animation */}
        {!isLoading && results.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8"
          >
            {results.map((item, index) => (
              <motion.div 
                key={`${item.id}-${(item as any).media_type}`} 
                variants={itemVariants}
                transition={{ duration: 0.4, delay: index * 0.03 }}
                className="transform-gpu"
              >
                <MovieCard
                  item={item}
                  type={(item as any).media_type === "movie" ? "movie" : "tv"}
                  priority={index < 12}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty state (no results) */}
        {!isLoading && searchQuery && results.length === 0 && (
          <motion.div 
            className="py-16 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">No results found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              We couldn't find any movies or shows matching "{searchQuery}". 
              Try using different keywords or explore our categories.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => navigate("/movies")}
                variant="default"
                className="gap-2 px-6 rounded-full"
                size="lg"
              >
                <Film size={18} />
                Browse Movies
              </Button>
              <Button 
                onClick={() => navigate("/tv-shows")} 
                variant="outline"
                className="gap-2 px-6 rounded-full glass-panel border-none"
                size="lg"
              >
                <Tv2 size={18} />
                Browse TV Shows
              </Button>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <motion.div 
            className="mt-16 mb-4 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="backdrop-blur-md bg-black/30 rounded-full px-2 py-1 border border-white/10 flex items-center">
              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-full h-10 w-10 p-0 flex items-center justify-center hover:bg-white/10"
              >
                <span className="sr-only">Previous page</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
              
              <div className="flex items-center px-4">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      onClick={() => handlePageChange(pageNum)}
                      className={`rounded-full h-8 w-8 p-0 mx-1 flex items-center justify-center text-sm ${
                        currentPage === pageNum 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="mx-1 text-white/50">...</span>
                    <Button
                      variant="ghost"
                      onClick={() => handlePageChange(totalPages)}
                      className="rounded-full h-8 w-8 p-0 mx-1 flex items-center justify-center text-sm text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-full h-10 w-10 p-0 flex items-center justify-center hover:bg-white/10"
              >
                <span className="sr-only">Next page</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
