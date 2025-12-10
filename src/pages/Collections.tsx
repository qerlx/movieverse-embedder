import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchAllCollections } from "@/lib/collections";
import { Collection, Movie } from "@/types";
import { HeroCollectionBanner } from "@/components/collections/HeroCollectionBanner";
import { CollectionRow } from "@/components/collections/CollectionRow";
import { MovieDetailModal } from "@/components/collections/MovieDetailModal";
import { usePageTransition } from "@/components/PageTransition";

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { triggerTransition } = usePageTransition();

  useEffect(() => {
    const loadCollections = async () => {
      const data = await fetchAllCollections();
      // Filter collections with parts and sort by number of movies
      const validCollections = data
        .filter(c => c.parts && c.parts.length > 0)
        .sort((a, b) => (b.parts?.length || 0) - (a.parts?.length || 0));
      setCollections(validCollections);
      setLoading(false);
    };
    loadCollections();
  }, []);

  const handleMovieInfoClick = (movie: Movie) => {
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "/placeholder.svg";
    
    triggerTransition({
      posterUrl,
      title: movie.title,
      type: "movie",
      id: movie.id,
      destinationPath: `/movie/${movie.id}`
    });
  };

  const handleMoviePlayClick = (movie: Movie) => {
    navigate(`/watch/movie/${movie.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const heroCollection = collections.find(c => c.backdrop_path || c.parts?.[0]?.backdrop_path);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      {heroCollection && <HeroCollectionBanner collection={heroCollection} />}

      {/* Collections Grid */}
      <div className="relative -mt-16 z-20 space-y-8 pb-24">
        {collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No collections found</p>
          </div>
        ) : (
          collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <CollectionRow
                collection={collection}
                onMovieInfoClick={handleMovieInfoClick}
                onMoviePlayClick={handleMoviePlayClick}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Collections;
