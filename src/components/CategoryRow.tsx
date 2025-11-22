
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "./MovieCard";
import { motion } from "framer-motion";

interface CategoryRowProps {
  title: string;
  items: any[];
  type: "movie" | "tv";
  isRanked?: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ 
  title, 
  items, 
  type, 
  isRanked = false 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group mb-2">
      {title && (
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
      )}

      <div className="relative">
        {/* Left Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/90 hover:bg-background text-foreground rounded-full w-12 h-12 shadow-xl border border-border/50"
        >
          <ChevronLeft size={24} />
        </Button>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/90 hover:bg-background text-foreground rounded-full w-12 h-12 shadow-xl border border-border/50"
        >
          <ChevronRight size={24} />
        </Button>

        {/* Content Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
              className="flex-none w-44 md:w-52 lg:w-56"
            >
              <MovieCard
                item={item}
                type={type}
                isRanked={isRanked}
                rank={isRanked ? index + 1 : undefined}
                size="md"
                variant="default"
                showFavorite={true}
                priority={index < 4}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;
