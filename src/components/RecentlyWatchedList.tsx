import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecentlyWatched } from "@/lib/firebase-watch";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Clock, Play, Tv, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";

interface RecentlyWatchedListProps {
  limit?: number;
}

const RecentlyWatchedList: React.FC<RecentlyWatchedListProps> = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  
  const { data: recentlyWatched, isLoading } = useQuery({
    queryKey: ["recentlyWatched", currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return Promise.resolve([]);
      return getRecentlyWatched(currentUser, limit);
    },
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Card className="mx-auto max-w-md bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <Clock className="mx-auto mb-4 text-muted-foreground/60" size={40} />
            <h3 className="text-lg font-semibold mb-2">Sign in to view history</h3>
            <p className="text-muted-foreground mb-4">
              Track your viewing progress across all your devices
            </p>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (recentlyWatched?.length === 0 && !isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <Card className="mx-auto max-w-md bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <Play className="mx-auto mb-4 text-muted-foreground/40" size={40} />
            <h3 className="text-lg font-semibold mb-2">No watch history yet</h3>
            <p className="text-muted-foreground mb-4">
              Start watching movies and shows to see your progress here
            </p>
            <Button asChild>
              <Link to="/">Start Watching</Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="h-32 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse border border-border/20"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyWatched?.map((item, index) => (
            <motion.div
              key={`${item.mediaType}_${item.mediaId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/${item.mediaType === "movie" ? "movie" : "tv"}/${item.mediaId}`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    <div className="flex h-32">
                      <div className="w-20 flex-shrink-0">
                        <LazyImage
                          src={`https://image.tmdb.org/t/p/w154${item.posterPath}`}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-l-lg"
                          fallback="/placeholder.svg"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {item.mediaType === "movie" ? (
                              <Film className="w-4 h-4 text-primary" />
                            ) : (
                              <Tv className="w-4 h-4 text-primary" />
                            )}
                            <span className="text-xs text-muted-foreground capitalize">
                              {item.mediaType}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <div className="mt-2">
                          {item.mediaType === "tv" && item.lastEpisode ? (
                            <p className="text-xs text-muted-foreground">
                              S{item.lastEpisode.season}E{item.lastEpisode.episode}
                              {item.lastEpisode.name && ` • ${item.lastEpisode.name}`}
                            </p>
                          ) : item.progress ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(item.progress || 0)}%
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default RecentlyWatchedList;