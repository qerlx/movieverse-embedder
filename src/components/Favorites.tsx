
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getFavorites, FavoriteItem } from "@/lib/favorites";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";

interface FavoritesProps {
  limit?: number;
}

const Favorites: React.FC<FavoritesProps> = ({ limit = 0 }) => {
  const { data: favorites, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  const favoriteItems = limit > 0 ? favorites?.slice(0, limit) : favorites;

  if (favoriteItems?.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <Heart className="mx-auto mb-4 text-muted" size={40} />
        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
        <p className="text-muted-foreground">
          Add movies and TV shows to your favorites to see them here
        </p>
        <Button className="mt-4" asChild>
          <Link to="/">Browse Content</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(limit > 0 ? limit : 6)].map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] rounded-lg bg-muted/20 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {favoriteItems?.map((item) => (
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
};

export default Favorites;
