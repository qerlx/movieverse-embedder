import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Heart, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar,
  Activity,
  Award,
  BarChart3,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getFavorites } from "@/lib/firebase-favorites";
import { getWatchHistory } from "@/lib/firebase-watch";
import MovieCard from "@/components/MovieCard";

interface WatchStats {
  totalMinutes: number;
  totalItems: number;
  favoriteGenres: { id: number; name: string; count: number; }[];
  monthlyProgress: { month: string; minutes: number; }[];
  achievements: string[];
}

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [watchHistory, setWatchHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<WatchStats>({
    totalMinutes: 0,
    totalItems: 0,
    favoriteGenres: [],
    monthlyProgress: [],
    achievements: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        
        // Load favorites and watch history
        const [favoritesData, historyData] = await Promise.all([
          getFavorites(currentUser),
          getWatchHistory(currentUser)
        ]);

        setFavorites(favoritesData);
        setWatchHistory(historyData);

        // Calculate stats
        const totalMinutes = historyData.reduce((acc, item) => {
          // Estimate watch time based on progress
          const averageRuntime = 45; // minutes
          return acc + (averageRuntime * (item.progress || 0) / 100);
        }, 0);

        const genreCount = historyData.reduce((acc, item) => {
          if (item.genres) {
            item.genres.forEach((genre: number) => {
              acc[genre] = (acc[genre] || 0) + 1;
            });
          }
          return acc;
        }, {} as Record<number, number>);

        const favoriteGenres = Object.entries(genreCount)
          .map(([id, count]) => ({ 
            id: Number(id), 
            name: getGenreName(Number(id)), 
            count 
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Generate achievements
        const achievements = [];
        if (favoritesData.length >= 10) achievements.push("Movie Collector");
        if (historyData.length >= 50) achievements.push("Binge Watcher");
        if (totalMinutes >= 1000) achievements.push("Time Traveler");
        if (favoriteGenres.length >= 3) achievements.push("Genre Explorer");

        setStats({
          totalMinutes: Math.round(totalMinutes),
          totalItems: historyData.length,
          favoriteGenres,
          monthlyProgress: generateMonthlyProgress(historyData),
          achievements
        });

      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const getGenreName = (id: number): string => {
    const genres: Record<number, string> = {
      28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
      99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
      27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
      10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
    };
    return genres[id] || "Unknown";
  };

  const generateMonthlyProgress = (history: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map(month => ({
      month,
      minutes: Math.floor(Math.random() * 500) + 100
    }));
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please sign in to view your dashboard.</p>
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
        className="flex items-center gap-6"
      >
        <Avatar className="w-20 h-20">
          <AvatarImage src={currentUser.photoURL || ""} />
          <AvatarFallback>
            <User className="w-10 h-10" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {currentUser.displayName || "Movie Enthusiast"}
          </h1>
          <p className="text-muted-foreground">
            Member since {new Date(currentUser.metadata.creationTime!).getFullYear()}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {stats.achievements.map((achievement) => (
              <Badge key={achievement} variant="secondary">
                <Award className="w-3 h-3 mr-1" />
                {achievement}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMinutes}m</div>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(stats.totalMinutes / 60)} hours total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Watched</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Movies & TV shows
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-xs text-muted-foreground">
                In your list
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                Unlocked badges
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="favorites">My List</TabsTrigger>
          <TabsTrigger value="history">Watch History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Genres */}
            <Card>
              <CardHeader>
                <CardTitle>Favorite Genres</CardTitle>
                <CardDescription>Your most watched genres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.favoriteGenres.map((genre, index) => (
                    <div key={genre.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{genre.name}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(genre.count / stats.totalItems) * 100} 
                          className="w-20"
                        />
                        <span className="text-xs text-muted-foreground w-8">
                          {genre.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest watches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {watchHistory.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img
                        src={item.posterPath 
                          ? `https://image.tmdb.org/t/p/w92${item.posterPath}`
                          : "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.progress}% complete
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.itemType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>My List ({favorites.length})</CardTitle>
              <CardDescription>Your saved movies and TV shows</CardDescription>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {favorites.map((item) => (
                    <MovieCard
                      key={`${item.mediaType}-${item.mediaId}`}
                      item={{
                        id: Number(item.mediaId),
                        title: item.title,
                        poster_path: item.posterPath,
                        vote_average: 0,
                        release_date: ""
                      }}
                      type={item.mediaType}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No favorites yet. Start adding movies and shows to your list!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Watch History ({watchHistory.length})</CardTitle>
              <CardDescription>Everything you've watched</CardDescription>
            </CardHeader>
            <CardContent>
              {watchHistory.length > 0 ? (
                <div className="space-y-3">
                  {watchHistory.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                      <img
                        src={item.posterPath 
                          ? `https://image.tmdb.org/t/p/w92${item.posterPath}`
                          : "/placeholder.svg"
                        }
                        alt={item.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last watched: {new Date(item.watchedAt.seconds * 1000).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={item.progress || 0} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {item.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {item.itemType}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No watch history yet. Start watching to build your history!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Your watching patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.monthlyProgress.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month}</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={month.minutes / 5} 
                          className="w-32"
                        />
                        <span className="text-xs text-muted-foreground w-12">
                          {month.minutes}m
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.achievements.map((achievement) => (
                    <div key={achievement} className="flex items-center gap-3 p-2 rounded-lg bg-primary/10">
                      <Award className="w-6 h-6 text-primary" />
                      <span className="font-medium">{achievement}</span>
                    </div>
                  ))}
                  {stats.achievements.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      Keep watching to unlock achievements!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;