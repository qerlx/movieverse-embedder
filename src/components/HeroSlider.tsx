
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Info, Star, Clock } from "lucide-react";
import { Movie, TVShow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSliderProps {
  items: (Movie | TVShow)[];
  type: "movie" | "tv";
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items, type }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  
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
      className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Ken Burns effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${backdrop})`,
              filter: 'brightness(0.7) contrast(1.1)'
            }}
          />
          {/* Enhanced Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background" />
        </motion.div>
      </AnimatePresence>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              className="max-w-3xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Badges */}
              <motion.div 
                className="flex items-center flex-wrap gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white text-sm px-4 py-1.5 rounded-full font-semibold shadow-lg shadow-primary/30">
                  {type === "movie" ? "Movie" : "TV Show"}
                </div>
                
                {currentItem.vote_average > 0 && (
                  <div className="bg-black/60 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{currentItem.vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                {year && (
                  <div className="bg-black/60 backdrop-blur-md text-white text-sm px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <Clock size={14} />
                    <span className="font-medium">{year}</span>
                  </div>
                )}
              </motion.div>
              
              {/* Title */}
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold mb-6 leading-tight drop-shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {title}
              </motion.h1>
              
              {/* Overview */}
              <motion.p 
                className="text-gray-100 text-base md:text-lg mb-8 line-clamp-3 leading-relaxed drop-shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {currentItem.overview}
              </motion.p>
              
              {/* Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Button 
                  size="lg" 
                  className="gap-3 px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105"
                  onClick={navigateToWatch}
                >
                  <Play size={22} className="fill-current" />
                  Watch Now
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="gap-3 px-8 py-6 text-lg font-semibold bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  onClick={navigateToDetail}
                >
                  <Info size={22} />
                  More Info
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.15, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black/40 backdrop-blur-md hover:bg-primary/90 text-white p-4 ml-4 rounded-full transition-all border border-white/20 shadow-xl"
          onClick={handlePrev}
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </motion.button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.15, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-black/40 backdrop-blur-md hover:bg-primary/90 text-white p-4 mr-4 rounded-full transition-all border border-white/20 shadow-xl"
          onClick={handleNext}
          aria-label="Next slide"
        >
          <ChevronRight size={28} strokeWidth={2.5} />
        </motion.button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
        {filteredItems.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            className={cn(
              "transition-all duration-300",
              currentSlide === index 
                ? "bg-primary w-12 h-1.5 rounded-full shadow-lg shadow-primary/50" 
                : "bg-white/40 hover:bg-white/70 h-1.5 w-1.5 rounded-full"
            )}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
