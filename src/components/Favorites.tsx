
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, FavoriteItem } from "@/lib/firebase-favorites";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MovieCard from "@/components/MovieCard";
import { motion } from "framer-motion";

interface FavoritesProps {
  limit?: number;
}

const Favorites: React.FC<FavoritesProps> = ({ limit = 0 }) => {
  const { currentUser } = useAuth();
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return Promise.resolve([]);
      return getFavorites(currentUser);
    },
    enabled: !!currentUser,
  });

  const favoriteItems = limit > 0 ? favorites?.slice(0, limit) : favorites;

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card className="mx-auto max-w-md bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur border-border/50">
          <CardContent className="p-8">
            <Heart className="mx-auto mb-4 text-muted-foreground/60" size={48} />
            <h3 className="text-xl font-semibold mb-3 text-foreground">Sign in to view favorites</h3>
            <p className="text-muted-foreground mb-6">
              Create an account to save your favorite movies and TV shows
            </p>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (favoriteItems?.length === 0 && !isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card className="mx-auto max-w-md bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur border-border/50">
          <CardContent className="p-8">
            <div className="relative mb-6">
              <Heart className="mx-auto text-muted-foreground/40" size={48} />
              <Sparkles className="absolute -top-1 -right-1 text-primary/60" size={20} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your collection by adding movies and TV shows to your favorites
            </p>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
              <Link to="/">Discover Content</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(limit > 0 ? limit : 6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="aspect-[2/3] rounded-lg bg-gradient-to-b from-muted/40 to-muted/20 animate-pulse border border-border/20"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favoriteItems?.map((item, index) => (
            <motion.div
              key={`${item.mediaType}_${item.mediaId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MovieCard
                item={{
                  id: parseInt(item.mediaId),
                  media_type: item.mediaType,
                  title: item.title,
                  name: item.title,
                  poster_path: item.posterPath,
                }}
                type={item.mediaType as "movie" | "tv"}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Favorites;
