
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Star, Clock } from "lucide-react";
import { Movie, TVShow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 brightness-[0.7]"
        style={{ 
          backgroundImage: `url(${backdrop})`,
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl animate-fade-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary/90 text-white text-xs px-2 py-1 rounded">
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
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            
            <p className="text-gray-200 mb-6 line-clamp-3 md:line-clamp-none">
              {currentItem.overview}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={navigateToWatch}
              >
                <Play size={18} />
                Watch Now
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white"
                onClick={navigateToDetail}
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <button
          className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 m-2 rounded-full transition-all"
          onClick={handlePrev}
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white p-2 m-2 rounded-full transition-all"
          onClick={handleNext}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {filteredItems.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentSlide === index 
                ? "bg-primary w-8" 
                : "bg-white/30 hover:bg-white/60"
            )}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
