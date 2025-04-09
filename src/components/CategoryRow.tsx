
import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, TVShow } from "@/types";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setShowLeftArrow(container.scrollLeft > 20);
    setShowRightArrow(container.scrollLeft < (container.scrollWidth - container.clientWidth - 20));
    
    // Calculate active index based on scroll position
    if (container.clientWidth > 0) {
      const index = Math.round(container.scrollLeft / (container.clientWidth * 0.75));
      setActiveIndex(Math.min(Math.floor(items.length / 6), index));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      // Initial check
      checkScrollPosition();
    }
    
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [items]);

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

  // Calculate how many dots should be shown
  const totalGroups = Math.ceil(items.length / 6);
  const dots = Array.from({ length: totalGroups }, (_, i) => i);

  return (
    <motion.div
      className={cn("py-8 relative w-full overflow-visible", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold purple-text-gradient"
          >
            {title}
          </motion.h2>
          
          {!isMobile && totalGroups > 1 && (
            <div className="flex gap-1.5">
              {dots.map((dot, i) => (
                <button 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex ? 'bg-primary w-4' : 'bg-white/30'
                  }`}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const container = scrollContainerRef.current;
                      container.scrollTo({
                        left: i * container.clientWidth * 0.75,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  aria-label={`Go to group ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative mx-4 group">
        {/* Navigation arrows - show on hover or when scrollable */}
        <AnimatePresence>
          {!isMobile && showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll left"
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}
        
          {!isMobile && showRightArrow && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Scroll right"
            >
              <ChevronRight size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-4 no-scrollbar scroll-smooth carousel content-carousel"
        >
          <div className="pl-2"></div>
          {items.map((item, idx) => (
            <motion.div
              key={`${type}-${item.id}`}
              className={cn(
                "flex-shrink-0 px-2",
                isRanked 
                  ? "w-[200px] sm:w-[220px] md:w-[260px]"  // Wider for ranked items
                  : "w-[160px] sm:w-[180px] md:w-[220px]"  // Standard size
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
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
          <div className="pr-2"></div>
        </div>
        
        {/* Mobile scroll indicator */}
        {isMobile && (
          <div className="flex justify-center mt-4 gap-1">
            <div className="w-16 h-1 bg-primary/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((activeIndex + 1) / totalGroups) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryRow;
