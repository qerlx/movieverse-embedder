
import React from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"; 
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ContinueWatchingCard from "./ContinueWatchingCard";

// Define a clearer type for the items
export interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  progress?: number;
  lastEpisode?: {
    season: number;
    episode: number;
    name?: string;
  };
}

interface ContinueWatchingProps {
  items: ContinueWatchingItem[];
}

const ContinueWatchingRow: React.FC<ContinueWatchingProps> = ({ items }) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(true);
  
  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setShowLeftArrow(container.scrollLeft > 20);
    setShowRightArrow(container.scrollLeft < (container.scrollWidth - container.clientWidth - 20));
  };
  
  React.useEffect(() => {
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
  
  if (!items || items.length === 0) {
    return null;
  }
  
  return (
    <div className="py-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent">
        <Clock className="mr-2 h-5 w-5 text-purple-400" />
        Continue Watching
      </h2>
      
      <div className="relative mx-4 group">
        {/* Navigation arrows */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-x-auto py-4 no-scrollbar scroll-smooth carousel snap-x snap-mandatory"
          style={{ display: "flex" }}
        >
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="w-full min-w-[300px] sm:min-w-[350px] flex-shrink-0 snap-start">
              <ContinueWatchingCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContinueWatchingRow;
