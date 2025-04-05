
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Info, Star, Clock } from "lucide-react";
import { Movie, TVShow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface HeroSliderProps {
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items, type }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isNetflix = theme === 'netflix';
  
  const filteredItems = items.filter(item => item.backdrop_path);
  const totalSlides = filteredItems.length;
  
  const currentItem = filteredItems[currentSlide];
  const title = "title" in currentItem ? currentItem.title : currentItem.name;
  const releaseDate = "release_date" in currentItem 
    ? currentItem.release_date 
    : currentItem.first_air_date;

  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const backdrop = currentItem.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : "";
  
  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  const navigateToDetail = () => {
    navigate(`/${type}/${currentItem.id}`);
  };
  
  const navigateToWatch = () => {
    navigate(`/watch/${type}/${currentItem.id}`);
  };
  
  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, 8000);
    
    return () => clearInterval(interval);
  }, [totalSlides, currentSlide, isPaused]);
  
  return (
    <div 
      className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.4 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center brightness-[0.7]"
            style={{ backgroundImage: `url(${backdrop})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                isNetflix ? "bg-red-600 text-white" : "bg-primary/90 text-white"
              )}>
                {type === "movie" ? "Movie" : "TV Show"}
              </div>
              
              {currentItem.vote_average > 0 && (
                <div className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center">
                  <Star size={12} className="text-yellow-400 mr-1" />
                  <span>{currentItem.vote_average.toFixed(1)}</span>
                </div>
              )}
              
              {year && (
                <div className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center">
                  <Clock size={12} className="mr-1" />
                  <span>{year}</span>
                </div>
              )}
            </motion.div>
            
            <motion.h1 
              className={cn(
                "font-bold mb-4 leading-tight",
                isNetflix 
                  ? "text-5xl md:text-7xl text-white" 
                  : "text-4xl md:text-6xl text-white"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {title}
            </motion.h1>
            
            <motion.p 
              className="text-gray-200 mb-6 line-clamp-3 md:line-clamp-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              {currentItem.overview}
            </motion.p>
            
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <Button 
                size="lg" 
                className={cn(
                  "gap-2 text-white",
                  isNetflix 
                    ? "bg-white hover:bg-white/90 text-black" 
                    : "bg-primary hover:bg-primary/90"
                )}
                onClick={navigateToWatch}
              >
                <Play size={18} />
                {isNetflix ? "Play" : "Watch Now"}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className={cn(
                  isNetflix 
                    ? "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white" 
                    : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                )}
                onClick={navigateToDetail}
              >
                <Info size={18} className="mr-2" />
                {isNetflix ? "More Info" : "Details"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 m-2 rounded-full transition-all"
          onClick={handlePrev}
        >
          <ChevronLeft size={24} />
        </motion.button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 m-2 rounded-full transition-all"
          onClick={handleNext}
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            className={cn(
              "transition-all",
              currentSlide === index 
                ? isNetflix 
                  ? "bg-red-600 w-8 h-[3px]" 
                  : "bg-primary w-8 h-2 rounded-full" 
                : isNetflix 
                  ? "bg-white/30 hover:bg-white/60 w-8 h-[3px]" 
                  : "bg-white/30 hover:bg-white/60 h-2 w-2 rounded-full"
            )}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
