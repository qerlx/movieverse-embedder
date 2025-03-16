
import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchMulti } from "@/lib/api";
import { MediaItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  };

  return (
    <div ref={searchRef} className="relative z-30">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center transition-all duration-300 ${
          isMobile
            ? isExpanded
              ? "w-full"
              : "w-10"
            : "w-full max-w-md"
        }`}
      >
        {isMobile && !isExpanded ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-white transition-colors p-2"
            onClick={toggleExpand}
          >
            <Search size={20} />
          </button>
        ) : (
          <>
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies & shows..."
                className="w-full py-2 px-4 pr-10 bg-muted/50 border border-border/50 rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/70 transition-all"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-white transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
            {isMobile && (
              <button
                type="button"
                className="ml-2 text-muted-foreground hover:text-white"
                onClick={toggleExpand}
              >
                Cancel
              </button>
            )}
          </>
        )}
      </form>

      {showResults && results.length > 0 && (
        <div className="absolute mt-2 w-full max-h-[70vh] overflow-y-auto bg-card rounded-lg shadow-lg animate-fade-in">
          <div className="p-2">
            {results.map((item) => (
              <div
                key={`${item.id}-${item.media_type || (item.title ? "movie" : "tv")}`}
                className="p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                onClick={() => handleResultClick(item)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0">
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
                  <div className="ml-3">
                    <p className="font-medium text-sm text-balance">
                      {item.title || item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
              </div>
            ))}
            <div className="pt-2 pb-1 px-2 border-t border-border/50 mt-1">
              <button
                onClick={handleSubmit}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                See all results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
