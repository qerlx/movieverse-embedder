import React from "react";
import { useQuery } from "@tanstack/react-query";
import { storageService } from "@/lib/storage-service";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Clock, Play, Tv, Film, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";

interface RecentlyWatchedListProps {
  limit?: number;
}

const RecentlyWatchedList: React.FC<RecentlyWatchedListProps> = ({ limit = 6 }) => {
  const { currentUser } = useAuth();
  
  const { data: recentlyWatched, isLoading } = useQuery({
    queryKey: ["recentlyWatched", currentUser?.uid],
    queryFn: async () => {
      const history = await storageService.getRecentlyWatched(currentUser || undefined, limit);
      // Convert to the expected format
      return history.map(item => ({
        id: item.id,
        userId: currentUser?.uid || '',
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        progress: item.progress,
        lastEpisode: item.lastEpisode,
        lastWatched: { toDate: () => new Date(item.lastWatched) }
      }));
    },
    enabled: true,
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recentlyWatched?.map((item, index) => {
            const progress = item.progress || 0;
            const hasEpisode = item.lastEpisode && item.mediaType === "tv";
            
            return (
              <motion.div
                key={`${item.mediaType}_${item.mediaId}_${index}`}
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
                    
                    {/* Progress Bar */}
                    {progress > 0 && progress < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}
                    
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
                          const watchUrl = hasEpisode 
                            ? `/watch/${item.mediaType}/${item.mediaId}?season=${item.lastEpisode.season}&episode=${item.lastEpisode.episode}`
                            : `/watch/${item.mediaType}/${item.mediaId}`;
                          window.location.href = watchUrl;
                        }}
                      >
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </motion.div>
                    </div>
                    
                    {/* Episode Badge */}
                    {hasEpisode && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-black/60 border-white/20">
                          S{item.lastEpisode.season}E{item.lastEpisode.episode}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant={item.mediaType === "movie" ? "default" : "secondary"} className="text-xs backdrop-blur-sm">
                        {item.mediaType === "movie" ? <><Film className="w-3 h-3 mr-1" />Movie</> : <><Tv className="w-3 h-3 mr-1" />TV</>}
                      </Badge>
                    </div>
                    
                    {/* Info on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-sm font-semibold line-clamp-2 mb-2">{item.title}</h3>
                      {hasEpisode && (
                        <p className="text-white/70 text-xs mb-2 line-clamp-1">{item.lastEpisode.name}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          className="text-xs bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.preventDefault();
                            const watchUrl = hasEpisode 
                              ? `/watch/${item.mediaType}/${item.mediaId}?season=${item.lastEpisode.season}&episode=${item.lastEpisode.episode}`
                              : `/watch/${item.mediaType}/${item.mediaId}`;
                            window.location.href = watchUrl;
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {progress > 0 ? "Continue" : "Watch"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecentlyWatchedList;