import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWatchHistory, removeFromWatchHistory, clearWatchHistory } from "@/lib/firebase-watch";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Clock, Play, Tv, Film, Calendar, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { LazyImage } from "@/components/ui/lazy-image";
import { toast } from "sonner";

const WatchHistoryList: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "progress">("recent");
  
  const { data: watchHistory = [], isLoading, refetch } = useQuery({
    queryKey: ["watchHistory", currentUser?.uid],
    queryFn: () => {
      if (!currentUser) return Promise.resolve([]);
      return getWatchHistory(currentUser);
    },
    enabled: !!currentUser,
  });

  // Filter and sort watch history
  const processedHistory = watchHistory
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || item.mediaType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastWatched?.toDate?.() || b.lastWatched).getTime() - 
                 new Date(a.lastWatched?.toDate?.() || a.lastWatched).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

  const handleClearHistory = async () => {
    if (!currentUser || watchHistory.length === 0) return;
    
    try {
      await clearWatchHistory(currentUser);
      toast.success("Watch history cleared");
      refetch();
    } catch (error) {
      toast.error("Failed to clear watch history");
    }
  };

  const handleRemoveItem = async (mediaType: "movie" | "tv", mediaId: string, title: string) => {
    if (!currentUser) return;
    
    try {
      await removeFromWatchHistory(currentUser, mediaType, mediaId);
      toast.success(`Removed "${title}" from watch history`);
      refetch();
    } catch (error) {
      toast.error("Failed to remove from watch history");
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
            <Clock className="mx-auto mb-4 text-muted-foreground/60" size={48} />
            <h3 className="text-xl font-semibold mb-3">Sign in to view history</h3>
            <p className="text-muted-foreground mb-6">
              Track your viewing progress across all your devices
            </p>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (watchHistory.length === 0 && !isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Card className="mx-auto max-w-md bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur border-border/50">
          <CardContent className="p-8">
            <Play className="mx-auto mb-4 text-muted-foreground/40" size={48} />
            <h3 className="text-xl font-semibold mb-3">No watch history yet</h3>
            <p className="text-muted-foreground mb-6">
              Start watching movies and shows to see your progress here
            </p>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg" asChild>
              <Link to="/">Start Watching</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      {watchHistory.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search your watch history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value: "all" | "movie" | "tv") => setFilterType(value)}>
                <SelectTrigger className="w-[130px] bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: "recent" | "title" | "progress") => setSortBy(value)}>
                <SelectTrigger className="w-[140px] bg-background/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {searchTerm || filterType !== "all" 
                ? `${processedHistory.length} of ${watchHistory.length} items`
                : `${watchHistory.length} items in history`
              }
            </p>
            <div className="flex gap-2">
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
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* History List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="h-32 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 animate-pulse border border-border/20"
              />
            ))}
          </div>
        ) : processedHistory.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto mb-4 text-muted-foreground/40" size={48} />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {processedHistory.map((item, index) => (
              <motion.div
                key={`${item.mediaType}_${item.mediaId}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur border-border/50 hover:border-primary/20">
                  <CardContent className="p-0">
                    <Link to={`/${item.mediaType === "movie" ? "movie" : "tv"}/${item.mediaId}`}>
                      <div className="flex h-32">
                        <div className="w-20 flex-shrink-0">
                          <LazyImage
                            src={`https://image.tmdb.org/t/p/w154${item.posterPath}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            fallback="/placeholder.svg"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                {item.mediaType === "movie" ? (
                                  <Film className="w-4 h-4 text-primary" />
                                ) : (
                                  <Tv className="w-4 h-4 text-primary" />
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {item.mediaType === "movie" ? "Movie" : "TV Show"}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveItem(item.mediaType, item.mediaId, item.title);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(item.lastWatched?.toDate?.() || item.lastWatched).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            {item.mediaType === "tv" && item.lastEpisode ? (
                              <p className="text-xs text-muted-foreground">
                                S{item.lastEpisode.season}E{item.lastEpisode.episode}
                                {item.lastEpisode.name && ` • ${item.lastEpisode.name}`}
                              </p>
                            ) : item.progress ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1.5">
                                  <div 
                                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground min-w-[2.5rem]">
                                  {Math.round(item.progress || 0)}%
                                </span>
                              </div>
                            ) : null}
                          </div>
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

export default WatchHistoryList;