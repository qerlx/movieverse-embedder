import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Info, Star, Clock } from "lucide-react";
import { Movie, TVShow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import LogoTitle from "./LogoTitle";

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
      className="relative w-full h-[60vh] md:h-[80vh] lg:h-[85vh] overflow-hidden"
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
          <motion.div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url(${backdrop})`,
            }}
            animate={{ scale: [1, 1.05] }}
            transition={{ duration: 10, ease: "linear" }}
          />
          
          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-24 md:pb-32 lg:pb-40">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              className="max-w-2xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Badges */}
              <motion.div 
                className="flex items-center flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded font-semibold uppercase tracking-wider">
                  {type === "movie" ? "Movie" : "Series"}
                </div>
                
                {currentItem.vote_average > 0 && (
                  <div className="bg-black/60 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded flex items-center gap-1.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{currentItem.vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                {year && (
                  <div className="bg-black/60 backdrop-blur-sm text-foreground text-xs px-3 py-1 rounded">
                    {year}
                  </div>
                )}
              </motion.div>
              
              {/* Logo or Title */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <LogoTitle
                  id={currentItem.id}
                  title={title}
                  type={type}
                  className="max-w-md md:max-w-lg max-h-20 md:max-h-28 object-contain drop-shadow-2xl"
                  fallbackClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-2xl"
                />
              </motion.div>
              
              {/* Overview */}
              <motion.p 
                className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentItem.overview}
              </motion.p>
              
              {/* Buttons */}
              <motion.div 
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button 
                  size="lg" 
                  className="gap-2 px-6 md:px-8 h-11 md:h-12 text-sm md:text-base font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-md"
                  onClick={navigateToWatch}
                >
                  <Play size={18} className="fill-current" />
                  Play
                </Button>
                
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="gap-2 px-6 md:px-8 h-11 md:h-12 text-sm md:text-base font-semibold bg-muted/80 hover:bg-muted text-foreground rounded-md"
                  onClick={navigateToDetail}
                >
                  <Info size={18} />
                  More Info
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Navigation buttons - Netflix style */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 text-foreground rounded-full transition-all opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/40 hover:bg-black/60 text-foreground rounded-full transition-all opacity-0 hover:opacity-100 focus:opacity-100"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Slide Indicators - Netflix style */}
      <div className="absolute bottom-6 right-6 md:right-12 flex gap-1 z-20">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-0.5 rounded-full transition-all duration-300",
              currentSlide === index 
                ? "bg-foreground w-6" 
                : "bg-foreground/40 hover:bg-foreground/60 w-4"
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
