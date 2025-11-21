
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { storageService } from "@/lib/storage-service";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Play, Tv, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";

interface FavoritesProps {
  limit?: number;
}

const Favorites: React.FC<FavoritesProps> = ({ limit = 0 }) => {
  const { currentUser } = useAuth();
  
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites", currentUser?.uid],
    queryFn: () => storageService.getFavorites(currentUser || undefined),
    enabled: !!currentUser,
    staleTime: 1000 * 60, // 1 minute
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
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group relative"
            >
              <Link to={`/${item.mediaType}/${item.mediaId}`} className="block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted/20 border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <LazyImage
                    src={item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/watch/${item.mediaType}/${item.mediaId}`;
                      }}
                    >
                      <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                    </motion.div>
                  </div>
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={item.mediaType === "movie" ? "default" : "secondary"} className="text-xs backdrop-blur-sm">
                      {item.mediaType === "movie" ? "Movie" : <><Tv className="w-3 h-3 mr-1" />TV</>}
                    </Badge>
                  </div>
                  
                  {/* Info on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs bg-background/20 border-border/40 hover:bg-background/40"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/${item.mediaType}/${item.mediaId}`;
                        }}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Favorites;
