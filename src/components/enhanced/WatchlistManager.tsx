import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Clock, 
  Star, 
  Filter, 
  SortAsc, 
  Grid, 
  List,
  Search,
  X,
  Play,
  Calendar,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites, removeFavorite } from "@/lib/firebase-favorites";
import { getWatchHistory } from "@/lib/firebase-watch";
import { useToast } from "@/hooks/use-toast";
import MovieCard from "@/components/MovieCard";

interface WatchlistItem {
  id: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  addedAt: any;
  vote_average?: number;
  release_date?: string;
  genres?: number[];
}

interface WatchHistoryItem {
  id: string;
  itemId: number;
  itemType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  progress: number;
  watchedAt: any;
  lastEpisode?: {
    season: number;
    episode: number;
  };
}

type SortOption = 'added_date' | 'title' | 'rating' | 'release_date';
type ViewMode = 'grid' | 'list';

const WatchlistManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [favorites, setFavorites] = useState<WatchlistItem[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and view options
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("added_date");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  
  const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Sci-Fi" },
    { id: 53, name: "Thriller" }
  ];

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      const [favoritesData, historyData] = await Promise.all([
        getFavorites(currentUser),
        getWatchHistory(currentUser)
      ]);

      setFavorites(favoritesData.map(item => ({
        id: item.id,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        addedAt: item.addedAt
      })));

      setWatchHistory(historyData.map(item => ({
        id: item.id,
        itemId: Number(item.mediaId),
        itemType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        progress: item.progress || 0,
        watchedAt: item.watched_at || new Date().toISOString(),
        lastEpisode: item.lastEpisode
      })));

    } catch (error) {
      console.error("Error loading watchlist data:", error);
      toast({
        title: "Error",
        description: "Failed to load your watchlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!currentUser) return;

    try {
      const success = await removeFavorite(currentUser, favoriteId);
      if (success) {
        setFavorites(favorites.filter(item => item.id !== favoriteId));
        toast({
          title: "Removed",
          description: "Item removed from your list"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const filteredFavorites = favorites.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== "all" && item.mediaType !== selectedType) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'added_date':
        return b.addedAt.seconds - a.addedAt.seconds;
      default:
        return 0;
    }
  });

  const filteredHistory = watchHistory.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType !== "all" && item.itemType !== selectedType) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    return b.watchedAt.seconds - a.watchedAt.seconds;
  });

  const continueWatching = watchHistory.filter(item => item.progress > 0 && item.progress < 100);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please sign in to manage your watchlist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Shows</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added_date">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="favorites" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart size={16} />
            My List ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="continue" className="flex items-center gap-2">
            <Play size={16} />
            Continue ({continueWatching.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock size={16} />
            History ({watchHistory.length})
          </TabsTrigger>
        </TabsList>

        {/* My List Tab */}
        <TabsContent value="favorites">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredFavorites.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                  : "space-y-4"
                }
              >
                {filteredFavorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    {viewMode === 'grid' ? (
                      <div className="relative">
                        <MovieCard
                          item={{
                            id: Number(item.mediaId),
                            title: item.title,
                            poster_path: item.posterPath,
                            vote_average: 0,
                            release_date: ""
                          }}
                          type={item.mediaType}
                        />
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFavorite(item.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={item.posterPath 
                                ? `https://image.tmdb.org/t/p/w154${item.posterPath}`
                                : "/placeholder.svg"
                              }
                              alt={item.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  {item.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Added {new Date(item.addedAt.seconds * 1000).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveFavorite(item.id)}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your list is empty</h3>
                <p className="text-muted-foreground">
                  Start adding movies and TV shows to build your personal watchlist
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Continue Watching Tab */}
        <TabsContent value="continue">
          {continueWatching.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {continueWatching.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="aspect-video relative bg-muted">
                      <img
                        src={item.posterPath 
                          ? `https://image.tmdb.org/t/p/w500${item.posterPath}`
                          : "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Button size="lg" className="rounded-full">
                          <Play size={20} className="mr-2" />
                          Continue
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="w-full bg-white/20 rounded-full h-1 mb-2">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all" 
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-white text-sm">{item.progress}% complete</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.lastEpisode && (
                        <p className="text-sm text-muted-foreground">
                          S{item.lastEpisode.season}E{item.lastEpisode.episode}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Play className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nothing to continue</h3>
              <p className="text-muted-foreground">
                Items you're currently watching will appear here
              </p>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {filteredHistory.length > 0 ? (
            <div className="space-y-2">
              {filteredHistory.map((item) => (
                <Card key={item.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.posterPath 
                          ? `https://image.tmdb.org/t/p/w92${item.posterPath}`
                          : "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>
                            Watched {new Date(item.watchedAt.seconds * 1000).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">
                            {item.itemType === 'movie' ? 'Movie' : 'TV Show'}
                          </Badge>
                          <span>{item.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No watch history</h3>
              <p className="text-muted-foreground">
                Your viewing history will appear here as you watch content
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WatchlistManager;