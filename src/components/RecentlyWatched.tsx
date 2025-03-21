
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentlyWatched } from "@/lib/watchService";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentlyWatchedProps {
  limit?: number;
}

const RecentlyWatched: React.FC<RecentlyWatchedProps> = ({ limit = 0 }) => {
  const { currentUser } = useAuth();
  const [watchedItems, setWatchedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      if (!currentUser) {
        setWatchedItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const items = await getRecentlyWatched(currentUser, limit > 0 ? limit : 6);
        setWatchedItems(items);
      } catch (error) {
        console.error("Error fetching recently watched:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [currentUser, limit]);

  if (!currentUser || (watchedItems.length === 0 && !isLoading)) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto mb-4 text-muted" size={40} />
        <h3 className="text-lg font-medium mb-2">No watch history yet</h3>
        <p className="text-muted-foreground">
          Start watching movies and TV shows to see them here
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
          {watchedItems.map((item) => (
            <Link
              key={`${item.type}_${item.id}`}
              to={`/${item.type}/${item.id}`}
              className="block relative group rounded-lg overflow-hidden bg-muted/20 aspect-[2/3] animate-fade-in"
            >
              <div className="absolute inset-0 w-full h-full">
                {item.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">{item.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              {/* Recently watched badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-primary/90 text-primary-foreground rounded-full p-1">
                  <Clock className="h-3 w-3" />
                </div>
              </div>

              {/* Episode info for TV shows */}
              {item.type === "tv" && item.lastEpisode && (
                <div className="absolute top-2 left-2">
                  <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                    S{item.lastEpisode.season}:E{item.lastEpisode.episode}
                  </div>
                </div>
              )}

              {/* Hover content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.lastWatched).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyWatched;
