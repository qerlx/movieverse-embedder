
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { searchMulti } from "@/lib/api";
import { MediaItem, Movie, TVShow } from "@/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface SearchBarProps {
  className?: string;
  variant?: "default" | "large";
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className, 
  variant = "default",
  autoFocus = false
}) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset search when navigating away from search page
  useEffect(() => {
    if (location.pathname !== '/search') {
      setQuery("");
      setResults([]);
    }
  }, [location.pathname]);

  // Dispatch custom event when expanded state changes
  useEffect(() => {
    const event = new CustomEvent('searchBarExpandToggle', { 
      detail: { expanded: isExpanded } 
    });
    document.dispatchEvent(event);

    return () => {
      // Reset on unmount
      const resetEvent = new CustomEvent('searchBarExpandToggle', { 
        detail: { expanded: false } 
      });
      document.dispatchEvent(resetEvent);
    };
  }, [isExpanded]);

  // Live search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      
      const data = await searchMulti(searchQuery, 1);
      // Transform MediaItem results to Movie or TVShow
      const filteredResults = data.results
        .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
        .slice(0, 6) // Limit to 6 results for the dropdown
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
      
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
      setResults([]);
    }
  };

  const handleResultClick = (item: Movie | TVShow, type: 'movie' | 'tv') => {
    if (type === 'movie') {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/tv/${item.id}`);
    }
    setIsExpanded(false);
    setQuery("");
    setResults([]);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const toggleExpand = () => {
    if (!isExpanded && variant !== "large") {
      setIsExpanded(true);
      setTimeout(() => {
        const inputElement = document.querySelector(".search-input") as HTMLInputElement;
        if (inputElement) inputElement.focus();
      }, 100);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Small delay to allow click on results
    setTimeout(() => {
      if (query.trim() === "" && variant !== "large") {
        setIsExpanded(false);
      }
    }, 200);
  };

  return (
    <div className={cn(
      "relative",
      className
    )}>
      <motion.form 
        layout
        onSubmit={handleSearch} 
        className={cn(
          "relative flex items-center",
          variant === "large" ? "w-full max-w-md" : "w-auto",
          isExpanded && variant !== "large" ? "w-full max-w-xs" : "",
        )}
      >
        <AnimatePresence>
          {(isExpanded || variant === "large") ? (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleBlur}
                  className={cn(
                    "search-input pr-10 pl-10 py-2 bg-black/40 backdrop-blur-lg border-white/10 hover:border-white/30 focus:border-primary transition-all rounded-full",
                    variant === "large" && "h-12 text-lg",
                    isFocused && "ring-2 ring-primary/30 shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                  )}
                  autoFocus={autoFocus || isExpanded}
                />
                <SearchIcon 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={variant === "large" ? 20 : 16}
                />
                
                {query && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 rounded-full flex items-center justify-center hover:bg-white/10"
                  >
                    <X size={14} className="text-muted-foreground" />
                    <span className="sr-only">Clear search</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={toggleExpand}
              className="p-2.5 text-muted-foreground hover:text-white bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SearchIcon size={18} />
              <span className="sr-only">Open search</span>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Live search results dropdown */}
      <AnimatePresence>
        {query.length >= 2 && results.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute z-50 mt-2 w-full max-h-[70vh] bg-background/95 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden",
              variant === "large" ? "max-w-md" : "max-w-xs",
            )}
          >
            <Command>
              <CommandList>
                <CommandGroup heading="Results">
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    </div>
                  ) : (
                    results.map((item) => {
                      const isMovie = (item as any).media_type === "movie";
                      const title = isMovie ? (item as Movie).title : (item as TVShow).name;
                      const year = isMovie 
                        ? (item as Movie).release_date?.substring(0, 4) 
                        : (item as TVShow).first_air_date?.substring(0, 4);
                      const imagePath = item.poster_path
                        ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                        : '/placeholder.svg';
                        
                      return (
                        <CommandItem
                          key={`${item.id}-${isMovie ? 'movie' : 'tv'}`}
                          onSelect={() => handleResultClick(item, isMovie ? 'movie' : 'tv')}
                          className="py-2 px-3 cursor-pointer hover:bg-primary/10 flex items-center gap-3"
                        >
                          <div className="h-12 w-8 flex-shrink-0 rounded overflow-hidden">
                            <img 
                              src={imagePath}
                              alt={title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{title}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="capitalize">{isMovie ? 'Movie' : 'TV Show'}</span>
                              {year && <span>• {year}</span>}
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })
                  )}
                </CommandGroup>
                {results.length > 0 && (
                  <div className="px-3 py-2 text-xs text-center border-t border-white/10">
                    <button 
                      onClick={handleSearch}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View all results for "{query}"
                    </button>
                  </div>
                )}
              </CommandList>
              <CommandEmpty>
                <div className="py-6">
                  <p className="text-center text-sm text-muted-foreground">No results found</p>
                </div>
              </CommandEmpty>
            </Command>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
