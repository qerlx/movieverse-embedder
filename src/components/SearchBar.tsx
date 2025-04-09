
import React, { useState } from "react";
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
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <motion.form 
      layout
      onSubmit={handleSearch} 
      className={cn(
        "relative flex items-center",
        variant === "large" ? "w-full max-w-md" : "w-full max-w-xs",
        className
      )}
    >
      <Input
        type="text"
        placeholder="Search movies, TV shows..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "pr-10 pl-10 py-2 bg-black/40 backdrop-blur-lg border-white/10 hover:border-white/30 focus:border-primary transition-all rounded-full",
          variant === "large" && "h-12 text-lg",
          isFocused && "ring-2 ring-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
        )}
        autoFocus={autoFocus}
      />
      <SearchIcon 
        className={cn(
          "absolute left-3 text-muted-foreground",
          variant === "large" && "w-5 h-5"
        )} 
        size={variant === "large" ? 20 : 16}
      />
      
      <AnimatePresence>
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
      </AnimatePresence>
      
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
    </motion.form>
  );
};

export default SearchBar;
