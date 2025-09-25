import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Filter, TrendingUp, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { enhancedAPI } from "@/lib/enhanced-api";
import { useNavigate } from "react-router-dom";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: 'movie' | 'tv' | 'person';
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

interface SmartSearchBarProps {
  className?: string;
  onSearchToggle?: (expanded: boolean) => void;
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({ 
  className, 
  onSearchToggle 
}) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState([
    "Spider-Man", "The Office", "Game of Thrones", "Marvel", "Breaking Bad"
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search with enhanced API
  const { results: searchResults, isLoading } = useDebouncedSearch(
    async (searchQuery) => {
      if (!searchQuery.trim()) return { results: [] };
      return enhancedAPI.advancedSearch({
        query: searchQuery,
        type: activeFilter === 'all' ? undefined : activeFilter,
        page: 1
      });
    }
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setShowResults(true);
    onSearchToggle?.(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setShowResults(false);
    setQuery("");
    onSearchToggle?.(false);
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(result.title || result.name || "");
    const path = result.media_type === 'movie' 
      ? `/movie/${result.id}` 
      : result.media_type === 'tv'
      ? `/tv/${result.id}`
      : `/person/${result.id}`;
    navigate(path);
    handleCollapse();
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      handleCollapse();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayResults = useMemo(() => {
    if (!searchResults?.results) return [];
    return searchResults.results.slice(0, 6);
  }, [searchResults]);

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'movie': return '🎬';
      case 'tv': return '📺';
      case 'person': return '👤';
      default: return '🔍';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).getFullYear();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <motion.div
          layout
          className={cn(
            "relative flex items-center transition-all duration-300",
            isExpanded 
              ? "w-full max-w-2xl" 
              : "w-10 md:w-64"
          )}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder={isExpanded ? "Search movies, TV shows..." : "Search..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleExpand}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
              } else if (e.key === 'Escape') {
                handleCollapse();
              }
            }}
            className={cn(
              "pr-20 bg-background/80 backdrop-blur-sm border-white/20 focus:border-primary/50 transition-all",
              !isExpanded && "md:opacity-100 opacity-0 cursor-pointer"
            )}
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResults(!showResults)}
                  className="h-7 w-7 p-0"
                >
                  <Filter size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCollapse}
                  className="h-7 w-7 p-0"
                >
                  <X size={14} />
                </Button>
              </motion.div>
            )}
            {!isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="h-7 w-7 p-0"
              >
                <Search size={14} />
              </Button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && isExpanded && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="bg-black/90 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardContent className="p-4">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-4">
                  {(['all', 'movie', 'tv'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={activeFilter === filter ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter)}
                      className="capitalize"
                    >
                      {filter === 'all' ? 'All' : filter === 'movie' ? 'Movies' : 'TV Shows'}
                    </Button>
                  ))}
                </div>

                {/* Search Results */}
                {query.trim() && (
                  <div className="space-y-2">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Searching...
                      </div>
                    )}
                    
                    {displayResults.map((result) => (
                      <motion.div
                        key={`${result.media_type}-${result.id}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleResultClick(result)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <div className="text-lg">{getMediaTypeIcon(result.media_type)}</div>
                        <img
                          src={result.poster_path 
                            ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
                            : "/placeholder.svg"
                          }
                          alt={result.title || result.name}
                          className="w-10 h-15 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {result.title || result.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {result.media_type}
                            </Badge>
                            {(result.release_date || result.first_air_date) && (
                              <span>{formatDate(result.release_date || result.first_air_date!)}</span>
                            )}
                            {result.vote_average && result.vote_average > 0 && (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                <span>{result.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {query.trim() && !isLoading && displayResults.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No results found for "{query}"
                      </div>
                    )}
                  </div>
                )}

                {/* Recent & Trending Searches */}
                {!query.trim() && (
                  <div className="space-y-4">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-muted-foreground" />
                          <span className="text-sm font-medium">Recent Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => handleSearch(search)}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Trending</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((search, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary/20"
                            onClick={() => handleSearch(search)}
                          >
                            {search}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;