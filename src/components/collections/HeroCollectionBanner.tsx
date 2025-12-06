import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Collection } from "@/types";

interface HeroCollectionBannerProps {
  collection: Collection;
}

export const HeroCollectionBanner = ({ collection }: HeroCollectionBannerProps) => {
  const navigate = useNavigate();
  
  const backdropUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${collection.backdrop_path}`
    : collection.parts?.[0]?.backdrop_path 
      ? `https://image.tmdb.org/t/p/original${collection.parts[0].backdrop_path}`
      : null;

  const handlePlayFirst = () => {
    if (collection.parts && collection.parts.length > 0) {
      navigate(`/watch/movie/${collection.parts[0].id}`);
    }
  };

  const handleMoreInfo = () => {
    navigate(`/collections/${collection.id}`);
  };

  if (!backdropUrl) return null;

  return (
    <div className="relative w-full h-[55vh] md:h-[70vh] lg:h-[75vh] overflow-hidden">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-0 flex items-end pb-16 md:pb-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl"
          >
            {/* Collection Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 drop-shadow-2xl">
              {collection.name}
            </h1>

            {/* Overview */}
            {collection.overview && (
              <p className="text-muted-foreground text-sm md:text-base mb-6 line-clamp-2 max-w-xl">
                {collection.overview}
              </p>
            )}

            {/* Movie Count */}
            <p className="text-sm text-muted-foreground mb-6">
              {collection.parts?.length || 0} movies in collection
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button 
                size="lg"
                className="gap-2 px-6 md:px-8 h-11 md:h-12 font-semibold bg-foreground hover:bg-foreground/90 text-background rounded-md"
                onClick={handlePlayFirst}
              >
                <Play size={18} className="fill-current" />
                Play
              </Button>
              
              <Button 
                variant="secondary"
                size="lg"
                className="gap-2 px-6 md:px-8 h-11 md:h-12 font-semibold bg-muted/80 hover:bg-muted text-foreground rounded-md"
                onClick={handleMoreInfo}
              >
                <Info size={18} />
                More Info
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
