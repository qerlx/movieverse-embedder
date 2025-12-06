
import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import { motion } from "framer-motion";

interface CategoryRowProps {
  title: string;
  items: any[];
  type: "movie" | "tv";
  isRanked?: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ title, items, type, isRanked = false }) => {
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
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative group"
    >
      {/* Title */}
      {title && (
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold mb-3 text-foreground">
          {title}
        </h2>
      )}

      {/* Scroll Container */}
      <div className="relative -mx-4 md:-mx-6 lg:-mx-8">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-r from-background via-background/80 to-transparent flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("left")}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </div>
          </button>
        )}

        {/* Movies Scroll */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-6 lg:px-8 py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <MovieCard
              key={item.id}
              item={item}
              type={type}
              isRanked={isRanked}
              rank={isRanked ? index + 1 : undefined}
              priority={index < 6}
              size="md"
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-16 bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll("right")}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-muted/80 hover:bg-muted rounded-full flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryRow;
