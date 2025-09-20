import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, removeFavorite, clearAllFavorites } from "@/lib/firebase-favorites";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";
import { useState } from "react";
import { toast } from "sonner";

const FavoritesList: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  
  const { data: favorites = [], isLoading, refetch } = useQuery({
    queryKey: ["favorites", currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return Promise.resolve([]);
      return getFavorites(currentUser);
    },
    enabled: !!currentUser,
  });

  // Filter favorites based on search and type
  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.mediaType === filterType;
    return matchesSearch && matchesType;
  });

  const handleRemoveFavorite = async (itemId: string, title: string) => {
    if (!currentUser) return;
    
    try {
      await removeFavorite(currentUser, itemId);
      toast.success(`Removed "${title}" from favorites`);
      refetch();
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  const handleClearAll = async () => {
    if (!currentUser || favorites.length === 0) return;
    
    try {
      await clearAllFavorites(currentUser);
      toast.success("All favorites cleared");
      refetch();
    } catch (error) {
      toast.error("Failed to clear favorites");
    }
  };

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

  if (favorites.length === 0 && !isLoading) {
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
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      {favorites.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <Input
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>
          <Select value={filterType} onValueChange={(value: "all" | "movie" | "tv") => setFilterType(value)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="tv">TV Shows</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Results Count */}
      {favorites.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterType !== "all" 
              ? `${filteredFavorites.length} of ${favorites.length} favorites`
              : `${favorites.length} favorites`
            }
          </p>
          {(searchTerm || filterType !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
              }}
            >
              Clear filters
            </Button>
          )}
          {favorites.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Favorites Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="aspect-[2/3] rounded-lg bg-gradient-to-b from-muted/40 to-muted/20 animate-pulse border border-border/20"
              />
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto mb-4 text-muted-foreground/40" size={48} />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredFavorites.map((item, index) => (
              <motion.div
                key={`${item.mediaType}_${item.mediaId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-card/30 backdrop-blur border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    <Link to={`/${item.mediaType === "movie" ? "movie" : "tv"}/${item.mediaId}`}>
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <LazyImage
                          src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallback="/placeholder.svg"
                        />
                        
                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <Badge 
                            variant={item.mediaType === "movie" ? "default" : "secondary"}
                            className="text-xs backdrop-blur-sm bg-black/50 text-white border-white/20"
                          >
                            {item.mediaType === "movie" ? "Movie" : "TV Show"}
                          </Badge>
                        </div>

                        {/* Remove Button */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 backdrop-blur-sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveFavorite(item.id, item.title);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Title Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                          <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FavoritesList;