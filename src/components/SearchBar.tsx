
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchMulti } from "@/lib/api";
import { MediaItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Logo from "@/components/ui/logo";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        if (isMobile) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        searchMulti(query)
          .then((data) => {
            setResults(data.results.slice(0, 6));
            setShowResults(true);
          })
          .catch(() => {
            toast({
              title: "Search error",
              description: "Failed to fetch search results",
              variant: "destructive",
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      setQuery("");
    }
  };

  const handleResultClick = (item: MediaItem) => {
    const mediaType = item.media_type || (item.title ? "movie" : "tv");
    navigate(`/${mediaType}/${item.id}`);
    setShowResults(false);
    setQuery("");
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    // Hide logo text when expanded
    document.dispatchEvent(new CustomEvent('searchBarExpandToggle', { 
      detail: { expanded: !isExpanded } 
    }));
  };

  return (
    <div ref={searchRef} className="relative z-30">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center transition-all duration-300 ${
          isMobile
            ? isExpanded
              ? "w-full animate-fade-in"
              : "w-12" 
            : "w-full max-w-md"
        }`}
      >
        {isMobile && !isExpanded ? (
          <button
            type="button"
            className={cn(
              "transition-colors p-3",
              isNetflix ? "text-gray-300 hover:text-white" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={toggleExpand}
            aria-label="Open search"
          >
            <Search size={24} />
          </button>
        ) : (
          <>
            <div className="relative w-full">
              <motion.input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies & shows..."
                className={cn(
                  "w-full py-3 px-5 pr-12 border rounded-full text-base placeholder:text-muted-foreground focus:outline-none transition-all",
                  isNetflix 
                    ? "bg-black/50 border-gray-700 text-white focus:border-gray-400" 
                    : "bg-muted/50 border-border/50 focus:ring-2 focus:ring-primary/70"
                )}
                initial={{ width: "100%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
              <button
                type="submit"
                className={cn(
                  "absolute right-0 top-0 h-full px-4 transition-colors",
                  isNetflix ? "text-gray-400 hover:text-white" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Submit search"
              >
                <Search size={22} />
              </button>
            </div>
            {isMobile && (
              <motion.button
                type="button"
                className={cn(
                  "ml-3 p-2 text-base",
                  isNetflix ? "text-gray-400 hover:text-white" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleExpand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Cancel
              </motion.button>
            )}
          </>
        )}
      </form>

      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div 
            className={cn(
              "absolute mt-2 w-full max-h-[70vh] overflow-y-auto rounded-lg shadow-lg",
              isNetflix ? "bg-black/95 border border-gray-800" : "bg-card"
            )}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2">
              {results.map((item) => (
                <motion.div
                  key={`${item.id}-${item.media_type || (item.title ? "movie" : "tv")}`}
                  className={cn(
                    "p-3 rounded cursor-pointer transition-colors",
                    isNetflix 
                      ? "hover:bg-gray-800/50" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleResultClick(item)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900"> 
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                          alt={item.title || item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={cn(
                        "font-medium text-base text-balance",
                        isNetflix && "text-white"
                      )}>
                        {item.title || item.name}
                      </p>
                      <p className="text-sm text-muted-foreground"> 
                        {item.media_type === "movie" || item.title
                          ? `Movie · ${
                              item.release_date
                                ? new Date(item.release_date).getFullYear()
                                : "Unknown"
                            }`
                          : `TV Show · ${
                              item.first_air_date
                                ? new Date(item.first_air_date).getFullYear()
                                : "Unknown"
                            }`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className={cn(
                "pt-2 pb-1 px-2 mt-1",
                isNetflix ? "border-t border-gray-800" : "border-t border-border/50"
              )}>
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "w-full text-center py-2 text-base",
                    isNetflix ? "text-red-600 hover:text-red-500" : "text-primary hover:underline"
                  )}
                >
                  See all results
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
