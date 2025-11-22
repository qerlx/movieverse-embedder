import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Collection, Movie } from "@/types";
import { fetchAllCollections } from "@/lib/collections";
import { HeroCollectionBanner } from "@/components/collections/HeroCollectionBanner";
import { CollectionRow } from "@/components/collections/CollectionRow";
import { MovieDetailModal } from "@/components/collections/MovieDetailModal";
import { useNavigate } from "react-router-dom";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

const Collections = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllCollections();
        setCollections(data);
      } catch (error) {
        console.error("Error loading collections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollections();
  }, []);

  const handleMovieInfoClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleMoviePlayClick = (movie: Movie) => {
    navigate(`/watch/movie/${movie.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <SkeletonLoader variant="hero" />
          <div className="space-y-8 mt-8 px-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-8 w-64 bg-muted rounded mb-4" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <SkeletonLoader key={j} variant="card" className="w-40 md:w-48" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const heroCollection = collections[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      {/* Hero Banner */}
      {heroCollection && <HeroCollectionBanner collection={heroCollection} />}

      {/* Collection Rows */}
      <div className="pb-20 -mt-20 relative z-10">
        {collections.map((collection) => (
          <CollectionRow
            key={collection.id}
            collection={collection}
            onMovieInfoClick={handleMovieInfoClick}
            onMoviePlayClick={handleMoviePlayClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {collections.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-6"
        >
          <h3 className="text-2xl font-bold text-white mb-4">No Collections Available</h3>
          <p className="text-white/60 mb-8">
            Collections are currently being prepared. Check back soon!
          </p>
        </motion.div>
      )}

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMovie(null);
        }}
      />
    </motion.div>
  );
};

export default Collections;
