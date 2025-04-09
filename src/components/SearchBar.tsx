
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  const navigate = useNavigate();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsExpanded(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
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
    if (query.trim() === "" && variant !== "large") {
      setTimeout(() => setIsExpanded(false), 200);
    }
  };

  return (
    <motion.form 
      layout
      onSubmit={handleSearch} 
      className={cn(
        "relative flex items-center",
        variant === "large" ? "w-full max-w-md" : "w-auto",
        isExpanded && variant !== "large" ? "w-full max-w-xs" : "",
        className
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
                isFocused && "ring-2 ring-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
              )}
              autoFocus={autoFocus || isExpanded}
            />
            <SearchIcon 
              className={cn(
                "absolute left-3 text-muted-foreground",
                variant === "large" && "w-5 h-5"
              )} 
              size={variant === "large" ? 20 : 16}
            />
            
            {query && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-10"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-6 w-6 p-0 rounded-full hover:bg-white/10"
                >
                  <X size={14} className="text-muted-foreground" />
                  <span className="sr-only">Clear search</span>
                </Button>
              </motion.div>
            )}
            
            <Button 
              type="submit" 
              size="sm"
              variant="ghost"
              className={cn(
                "absolute right-1 text-primary hover:text-white hover:bg-primary/20 p-1.5 rounded-full",
                !query && "pointer-events-none opacity-50"
              )}
            >
              <span className="sr-only">Search</span>
              <SearchIcon size={16} />
            </Button>
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
  );
};

export default SearchBar;
