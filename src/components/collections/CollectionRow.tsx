import { motion } from "framer-motion";
import { Collection, Movie } from "@/types";
import { MoviePosterCard } from "./MoviePosterCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CollectionRowProps {
  collection: Collection;
  onMovieInfoClick: (movie: Movie) => void;
  onMoviePlayClick: (movie: Movie) => void;
}

export const CollectionRow = ({ collection, onMovieInfoClick, onMoviePlayClick }: CollectionRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!collection.parts || collection.parts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group mb-10"
    >
      {/* Collection Title */}
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-5 px-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
        {collection.name}
      </h2>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-background/90 hover:bg-background border border-border/50 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Movies Scroll */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {collection.parts.map((movie) => (
            <MoviePosterCard
              key={movie.id}
              movie={movie}
              onInfoClick={() => onMovieInfoClick(movie)}
              onPlayClick={() => onMoviePlayClick(movie)}
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 bg-background/90 hover:bg-background border border-border/50 text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
