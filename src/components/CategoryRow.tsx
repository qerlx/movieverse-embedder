
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie, TVShow } from "@/types";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";

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
    <div className={cn("py-6", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-2 no-scrollbar scroll-smooth"
        >
          <div className={cn("pl-4", isRanked && "pl-10")}></div>
          {items.map((item, idx) => (
            <div
              key={`${type}-${item.id}`}
              className={cn(
                "flex-shrink-0 mx-2",
                isRanked 
                  ? "w-[200px] md:w-[240px]"  // Wider for ranked items
                  : "w-[160px] md:w-[200px]"  // Standard size
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <MovieCard 
                item={item} 
                type={type} 
                priority={idx < 5}
                index={idx} 
                isRanked={isRanked}
              />
            </div>
          ))}
          <div className="pr-4"></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryRow;
