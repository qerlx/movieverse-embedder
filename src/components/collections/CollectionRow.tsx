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
      className="relative group mb-8"
    >
      {/* Collection Title */}
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 px-6">
        {collection.name}
      </h2>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-full w-12 bg-black/50 hover:bg-black/70 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Movies Scroll */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-6 py-2"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-full w-12 bg-black/50 hover:bg-black/70 text-white rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
