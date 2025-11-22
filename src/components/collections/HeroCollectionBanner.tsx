import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collection } from "@/types";
import { useNavigate } from "react-router-dom";

interface HeroCollectionBannerProps {
  collection: Collection;
}

export const HeroCollectionBanner = ({ collection }: HeroCollectionBannerProps) => {
  const navigate = useNavigate();
  const backdropUrl = collection.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${collection.backdrop_path}`
    : null;

  const firstMovie = collection.parts?.[0];

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Backdrop Image */}
      {backdropUrl && (
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={backdropUrl}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-foreground to-foreground/90 bg-clip-text text-transparent">
              {collection.name}
            </h1>
            
            <p className="text-lg text-foreground/90 mb-6 line-clamp-3 drop-shadow-lg">
              {collection.overview}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-yellow-400 text-xl">★</span>
                <span className="font-semibold">Collection</span>
              </div>
              <span className="text-white/60">•</span>
              <span className="text-white/80">
                {collection.parts?.length || 0} Movies
              </span>
            </div>

            <div className="flex items-center gap-4">
              {firstMovie && (
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 px-8 font-semibold"
                  onClick={() => navigate(`/watch/movie/${firstMovie.id}`)}
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Play
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm px-8"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
