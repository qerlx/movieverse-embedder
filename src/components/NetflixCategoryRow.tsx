
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import NetflixMovieCard from "./NetflixMovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface NetflixCategoryRowProps {
  title: string;
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
}

const NetflixCategoryRow: React.FC<NetflixCategoryRowProps> = ({ title, items, type }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  if (items.length === 0) return null;

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };
  
  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };
  
  return (
    <div className="mt-8 animate-fade-in relative">
      <h2 className={cn(
        "text-2xl font-bold mb-4",
        theme === "netflix" && "text-white",
        theme === "prime" && "text-lg uppercase tracking-wide font-medium"
      )}>
        {title}
      </h2>
      
      <div className="relative group">
        <button 
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
        >
          {items.map((item, index) => (
            <div key={`${type}-${item.id}`} className="flex-none w-36 sm:w-40 md:w-48 lg:w-56 xl:w-64 snap-start">
              <NetflixMovieCard 
                item={item} 
                type={type} 
                recentlyAdded={index < 2}
              />
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default NetflixCategoryRow;
