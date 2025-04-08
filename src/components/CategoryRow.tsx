
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, TVShow } from "@/types";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface CategoryRowProps {
  title: string;
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
  className?: string;
  isRanked?: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  items,
  type,
  className,
  isRanked = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <motion.div
      className={cn("py-6 relative w-full", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{title}</h2>
          {!isMobile && (
            <div className="flex gap-2">
              <button
                onClick={scrollLeft}
                className="p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-primary" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-primary" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-2 no-scrollbar scroll-smooth w-full"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className={cn("pl-4", isRanked && "pl-10")}></div>
          {items.map((item, idx) => (
            <motion.div
              key={`${type}-${item.id}`}
              className={cn(
                "flex-shrink-0 px-1",
                isRanked 
                  ? "w-[180px] sm:w-[200px] md:w-[240px]"  // Wider for ranked items
                  : "w-[140px] sm:w-[160px] md:w-[200px]"  // Standard size
              )}
              style={{ scrollSnapAlign: 'start' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <MovieCard 
                item={item} 
                type={type} 
                priority={idx < 5}
                index={idx} 
                isRanked={isRanked}
              />
            </motion.div>
          ))}
          <div className="pr-4"></div>
        </div>
        
        {/* Mobile scroll indicators */}
        {isMobile && (
          <div className="flex justify-center mt-2 gap-1">
            <div className="w-16 h-1 bg-primary/20 rounded-full"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryRow;
