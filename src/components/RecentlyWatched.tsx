
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentlyWatched } from "@/lib/watchService";
import { WatchProgress } from "@/types";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

const RecentlyWatched = () => {
  const { currentUser } = useAuth();
  const [recentItems, setRecentItems] = useState<WatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyWatched = async () => {
      if (!currentUser) {
        setRecentItems([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const items = await getRecentlyWatched(currentUser);
        setRecentItems(items);
      } catch (error) {
        console.error("Error fetching recently watched:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyWatched();
  }, [currentUser]);

  if (!currentUser || (recentItems.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex items-center mb-4">
        <Clock className="mr-2 text-primary" size={20} />
        <h2 className="text-xl font-bold">Continue Watching</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] rounded-lg bg-muted/20 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentItems.map((item) => (
            <Link
              key={`${item.type}_${item.id}`}
              to={
                item.type === "tv" && item.lastEpisode
                  ? `/watch/tv/${item.id}/${item.lastEpisode.season}/${item.lastEpisode.episode}`
                  : `/watch/${item.type}/${item.id}`
              }
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

              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: item.type === "movie" && item.progress
                      ? `${item.progress}%`
                      : "5%", // Default progress for TV shows or new movies
                  }}
                ></div>
              </div>

              {/* Hover content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white font-medium text-sm line-clamp-1">
                  {item.title}
                </h3>
                <div className="text-xs text-gray-300 mt-1">
                  {item.lastEpisode
                    ? `S${item.lastEpisode.season} E${item.lastEpisode.episode}`
                    : "Resume"}
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
