
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Movie, TVShow } from "@/types";
import NetflixMovieCard from "./NetflixMovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

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
  
  const isNetflix = theme === 'netflix';

  // Rank numbers for Netflix top 10 style
  const rankNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  return (
    <motion.div 
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "text-2xl font-bold mb-4 ml-2",
          isNetflix && "text-white"
        )}
      >
        {title}
      </motion.h2>
      
      <div className="relative group">
        <motion.button 
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll left"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={24} className="text-white" />
        </motion.button>
        
        <div 
          ref={scrollRef}
          className="flex space-x-2 md:space-x-3 overflow-x-auto pb-4 scrollbar-hide snap-x px-2"
        >
          {items.map((item, index) => (
            <motion.div 
              key={`${type}-${item.id}`} 
              className="flex-none w-36 sm:w-40 md:w-44 lg:w-48 xl:w-52 snap-start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {title.includes('Top') && index < 10 ? (
                <div className="relative">
                  <NetflixMovieCard 
                    item={item} 
                    type={type} 
                    recentlyAdded={index < 2}
                    index={index}
                  />
                  <div className="absolute -left-4 bottom-0 text-6xl font-black text-white opacity-50 z-0">
                    {rankNumbers[index]}
                  </div>
                </div>
              ) : (
                <NetflixMovieCard 
                  item={item} 
                  type={type} 
                  recentlyAdded={index < 2}
                  index={index}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.button 
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll right"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight size={24} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NetflixCategoryRow;
