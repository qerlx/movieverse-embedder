
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
    <div className="relative group">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">
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
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10"
        >
          <ChevronLeft size={20} />
        </Button>

        {/* Right Scroll Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-full w-10 h-10"
        >
          <ChevronRight size={20} />
        </Button>

        {/* Content Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-none w-48"
            >
              <MovieCard
                item={item}
                type={type}
                isRanked={isRanked}
                rank={isRanked ? index + 1 : undefined}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;
