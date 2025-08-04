import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "@/lib/favorites";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";

function FavoritesPage() {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-[300px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>

      {favorites && favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto mb-4 text-muted" size={40} />
          <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-4">
            Start adding movies and TV shows to your favorites
          </p>
          <Button asChild>
            <Link to="/">Browse Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites?.map((item) => (
            <MovieCard
              key={`${item.mediaType}_${item.mediaId}`}
              item={{
                id: parseInt(item.mediaId),
                media_type: item.mediaType,
                title: item.title,
                name: item.title,
                poster_path: item.posterPath,
              }}
              type={item.mediaType as "movie" | "tv"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavoritesPage;